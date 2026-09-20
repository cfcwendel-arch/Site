"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPreApprovalClient } from "@/lib/mercadopago";

export async function subscribeToPlanAction(planId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/painel/assinatura");

  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) redirect("/painel/assinatura?erro=plano_invalido");

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
