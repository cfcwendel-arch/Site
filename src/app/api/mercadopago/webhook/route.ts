import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago-webhook";
import { getPreApprovalClient } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET não configurado; webhook rejeitado.");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const dataId: string | undefined = body?.data?.id;
  const type: string | undefined = body?.type ?? body?.topic;

  if (!dataId || !type) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const valid = verifyMercadoPagoSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret,
  });

  if (!valid) {
    console.warn("Assinatura de webhook do Mercado Pago inválida.");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    if (type === "subscription_preapproval") {
      const preApproval = await getPreApprovalClient().get({ id: dataId });
      const subscriptionId = preApproval.external_reference;
      if (!subscriptionId) return NextResponse.json({ ok: true });

      const statusMap: Record<string, string> = {
        authorized: "active",
        paused: "paused",
        cancelled: "cancelled",
        pending: "pending",
      };
      const status = statusMap[preApproval.status ?? ""] ?? "pending";

      await supabase
        .from("subscriptions")
        .update({
          status,
          mercadopago_preapproval_id: dataId,
          current_period_end: null,
        })
        .eq("id", subscriptionId);
    } else if (type === "subscription_authorized_payment") {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      const res = await fetch(`https://api.mercadopago.com/authorized_payments/${dataId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return NextResponse.json({ ok: true });
      const payment = await res.json();

      const preapprovalId: string | undefined = payment.preapproval_id;
      if (!preapprovalId) return NextResponse.json({ ok: true });

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("mercadopago_preapproval_id", preapprovalId)
        .maybeSingle();

      if (subscription) {
        await supabase.from("payments").upsert(
          {
            subscription_id: subscription.id,
            mercadopago_payment_id: String(payment.id ?? dataId),
            amount_cents: Math.round((payment.transaction_amount ?? 0) * 100),
            status: payment.status ?? "unknown",
            raw: payment,
          },
          { onConflict: "mercadopago_payment_id" },
        );

        if (payment.status === "approved") {
          const nextPeriodEnd = new Date();
          nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
          await supabase
            .from("subscriptions")
            .update({ status: "active", current_period_end: nextPeriodEnd.toISOString() })
            .eq("id", subscription.id);
        } else if (payment.status === "rejected") {
          await supabase.from("subscriptions").update({ status: "past_due" }).eq("id", subscription.id);
        }
      }
    }
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago", err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
