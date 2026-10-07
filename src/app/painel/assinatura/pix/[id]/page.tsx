import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPaymentClient } from "@/lib/mercadopago";
import { pixSubscriptionId, syncPixPayment, type PaymentResponse } from "@/lib/pix";
import { formatBRL } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PixCopyCode } from "@/components/dashboard/pix-copy-code";
import { PixAutoRefresh } from "@/components/dashboard/pix-auto-refresh";

export const metadata: Metadata = { title: "Pagamento via Pix" };

export default async function PixPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let payment: PaymentResponse;
  try {
    payment = await getPaymentClient().get({ id });
  } catch {
    redirect("/painel/assinatura?erro=pix_invalido");
  }

  // Só o dono da assinatura vê o próprio Pix (RLS filtra as assinaturas de outros usuários).
  const subscriptionId = pixSubscriptionId(payment);
  if (!subscriptionId) notFound();
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, plans(name)")
    .eq("id", subscriptionId)
    .maybeSingle();
  if (!subscription) notFound();

  if (payment.status === "approved") {
    // Garante a liberação mesmo se o webhook ainda não chegou.
    try {
      await syncPixPayment(payment);
    } catch (err) {
      console.error(err);
    }
  }

  const transaction = payment.point_of_interaction?.transaction_data;
  const amount = formatBRL(Math.round((payment.transaction_amount ?? 0) * 100));
  const expiresAt = payment.date_of_expiration
    ? new Date(payment.date_of_expiration).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : null;

  return (
    <div className="max-w-lg">
      <Link href="/painel/assinatura" className="text-sm text-green-700 hover:underline">
        ← Voltar para assinatura
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">Pagamento via Pix</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Plano {subscription.plans?.name} · 1 mês · <strong>{amount}</strong>
      </p>

      {payment.status === "approved" ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-700" />
          <p className="mt-3 font-semibold text-green-900">Pagamento confirmado!</p>
          <p className="mt-1 text-sm text-green-800">Sua assinatura está ativa. Já pode publicar seus anúncios.</p>
          <Link href="/painel/anuncios/novo" className={`${buttonVariants()} mt-4`}>
            Publicar anúncio
          </Link>
        </div>
      ) : payment.status === "pending" && transaction?.qr_code ? (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
          <PixAutoRefresh />
          <ol className="space-y-1 text-sm text-neutral-700">
            <li>1. Abra o app do seu banco e escolha pagar com Pix.</li>
            <li>2. Escaneie o QR Code ou use o Pix Copia e Cola.</li>
            <li>3. Pronto — esta tela atualiza sozinha quando o pagamento for confirmado.</li>
          </ol>
          {transaction.qr_code_base64 && (
            // eslint-disable-next-line @next/next/no-img-element -- imagem em data: URI gerada pelo Mercado Pago
            <img
              src={`data:image/png;base64,${transaction.qr_code_base64}`}
              alt="QR Code Pix"
              width={240}
              height={240}
              className="mx-auto mt-6 h-60 w-60"
            />
          )}
          <div className="mt-6">
            <PixCopyCode code={transaction.qr_code} />
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            Aguardando pagamento{expiresAt ? ` · válido até ${expiresAt}` : ""}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-600" />
          <p className="mt-3 font-semibold text-red-900">Este Pix expirou ou foi cancelado.</p>
          <p className="mt-1 text-sm text-red-800">Gere um novo código na tela de assinatura.</p>
          <Link href="/painel/assinatura" className={`${buttonVariants({ variant: "outline" })} mt-4`}>
            Gerar novo Pix
          </Link>
        </div>
      )}
    </div>
  );
}
