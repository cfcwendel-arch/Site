"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPreApprovalClient } from "@/lib/mercadopago";

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
 * Pagamento via Pix direto com a AgroNegocia (sem gateway): registra o pedido como
 * assinatura pendente e mostra a chave Pix do Wendel, o QR Code e o Copia e Cola com o
 * valor do plano. O anunciante paga, manda o comprovante no WhatsApp e o admin confirma
 * em Admin → Anunciantes, o que libera 1 mês.
 * - Sem assinatura: cria uma pendente para o plano escolhido.
 * - Já tem assinatura paga por Pix ou mês grátis (pendente, ativa ou vencida): renova a mesma.
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

  let subscriptionId: string;

  if (existing && !existing.mercadopago_preapproval_id) {
    subscriptionId = existing.id;
  } else {
    if (existing?.mercadopago_preapproval_id) {
      // Assinatura antiga no cartão: ativa renova sozinha; pendente é descartada.
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

  revalidatePath("/painel/assinatura");
  // Tela com a chave Pix, o QR Code e o Copia e Cola já com o valor do plano.
  redirect(`/painel/assinatura/pix?assinatura=${subscriptionId}`);
}
