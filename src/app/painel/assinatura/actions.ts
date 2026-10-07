"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPaymentClient, getPreApprovalClient } from "@/lib/mercadopago";
import { PIX_REFERENCE_PREFIX, pixExpirationDate } from "@/lib/pix";

export async function subscribeToPlanAction(planId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/painel/assinatura");

  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) redirect("/painel/assinatura?erro=plano_invalido");

  // Quem está no mês grátis (ou pagou por Pix) e decide assinar no cartão: a assinatura
  // atual, sem renovação automática, é encerrada e substituída pela recorrente.
  const { data: current } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("advertiser_id", user.id)
    .eq("status", "active")
    .is("mercadopago_preapproval_id", null)
    .maybeSingle();
  if (current) {
    await supabase.rpc("cancel_own_subscription", { p_subscription_id: current.id });
  }

  const { data: subscriptionId, error: rpcError } = await supabase.rpc("create_pending_subscription", {
    p_plan_id: planId,
  });

  if (rpcError || !subscriptionId) {
    if (rpcError?.message.includes("subscription_already_exists")) {
      redirect("/painel/assinatura?erro=ja_existe");
    }
    redirect("/painel/assinatura?erro=falha_iniciar");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let checkoutUrl: string | null = null;

  try {
    const preApproval = await getPreApprovalClient().create({
      body: {
        reason: `AgroNegocia - Plano ${plan.name}`,
        external_reference: subscriptionId,
        payer_email: user.email,
        back_url: `${siteUrl}/painel/assinatura?status=retorno`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.price_cents / 100,
          currency_id: "BRL",
        },
        status: "pending",
      },
    });

    if (!preApproval.id || !preApproval.init_point) {
      redirect("/painel/assinatura?erro=falha_iniciar");
    }

    await supabase.rpc("attach_preapproval_to_subscription", {
      p_subscription_id: subscriptionId,
      p_preapproval_id: preApproval.id,
    });

    checkoutUrl = preApproval.init_point;
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    redirect("/painel/assinatura?erro=mp_indisponivel");
  }

  redirect(checkoutUrl!);
}

/** Primeiro mês grátis: só para quem nunca teve assinatura (regra reforçada no banco). */
export async function startFreeTrialAction(planId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/painel/assinatura");

  const { error } = await supabase.rpc("start_free_trial", { p_plan_id: planId });
  if (error) {
    if (error.message.includes("trial_not_eligible")) redirect("/painel/assinatura?erro=teste_usado");
    if (error.message.includes("invalid_plan")) redirect("/painel/assinatura?erro=plano_invalido");
    redirect("/painel/assinatura?erro=falha_iniciar");
  }

  revalidatePath("/painel", "layout");
  redirect("/painel/assinatura?gratis=1");
}

export async function cancelSubscriptionAction(subscriptionId: string): Promise<void> {
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("mercadopago_preapproval_id")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (subscription?.mercadopago_preapproval_id) {
    try {
      await getPreApprovalClient().update({
        id: subscription.mercadopago_preapproval_id,
        body: { status: "cancelled" },
      });
    } catch {
      // Mercado Pago may already have it cancelled/expired; proceed to cancel locally too.
    }
  }

  await supabase.rpc("cancel_own_subscription", { p_subscription_id: subscriptionId });
  revalidatePath("/painel/assinatura");
}

/**
 * Gera um QR Code Pix para pagar 1 mês do plano. Pix não é recorrente: quando o período
 * pago termina, o anunciante gera um novo Pix pela mesma tela para renovar.
 * - Sem assinatura: cria uma pendente para o plano escolhido.
 * - Assinatura já paga por Pix (pendente, ativa ou vencida): paga/renova a mesma.
 * - Checkout de cartão abandonado (pendente com preapproval): descarta e começa pelo Pix.
 */
export async function payWithPixAction(planId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/painel/assinatura");

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status, plan_id, mercadopago_preapproval_id")
    .eq("advertiser_id", user.id)
    .in("status", ["pending", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let subscriptionId: string | null = null;

  if (existing && !existing.mercadopago_preapproval_id) {
    subscriptionId = existing.id;
  } else {
    if (existing?.mercadopago_preapproval_id) {
      // Assinatura no cartão já ativa renova sozinha — não faz sentido pagar Pix por cima.
      if (existing.status !== "pending") redirect("/painel/assinatura?erro=cartao_ativo");
      await supabase.rpc("cancel_own_subscription", { p_subscription_id: existing.id });
    }

    const { data: createdId, error: rpcError } = await supabase.rpc("create_pending_subscription", {
      p_plan_id: planId,
    });
    if (rpcError || !createdId) {
      if (rpcError?.message.includes("subscription_already_exists")) {
        redirect("/painel/assinatura?erro=ja_existe");
      }
      redirect("/painel/assinatura?erro=falha_iniciar");
    }
    subscriptionId = createdId;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, plans(name, price_cents)")
    .eq("id", subscriptionId)
    .maybeSingle();
  const plan = subscription?.plans;
  if (!plan || plan.price_cents <= 0) redirect("/painel/assinatura?erro=plano_invalido");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let paymentId: string | null = null;

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: plan.price_cents / 100,
        description: `AgroNegocia - Plano ${plan.name} (1 mês)`,
        payment_method_id: "pix",
        payer: { email: user.email! },
        external_reference: `${PIX_REFERENCE_PREFIX}${subscriptionId}`,
        date_of_expiration: pixExpirationDate(),
        // O Mercado Pago só aceita URL pública https para notificações.
        ...(siteUrl.startsWith("https://") ? { notification_url: `${siteUrl}/api/mercadopago/webhook` } : {}),
      },
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });
    paymentId = payment.id ? String(payment.id) : null;
  } catch (err) {
    console.error("Erro ao gerar Pix no Mercado Pago", err);
  }

  if (!paymentId) redirect("/painel/assinatura?erro=mp_indisponivel");
  redirect(`/painel/assinatura/pix/${paymentId}`);
}
