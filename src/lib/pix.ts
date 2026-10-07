import "server-only";
import type { Payment } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export type PaymentResponse = Awaited<ReturnType<Payment["get"]>>;

/**
 * Pagamentos Pix de assinatura usam `external_reference = "pix:<subscription_id>"`.
 * O prefixo separa esses pagamentos avulsos das cobranças recorrentes do cartão
 * (que chegam pelo evento `subscription_authorized_payment`).
 */
export const PIX_REFERENCE_PREFIX = "pix:";

/** Quanto tempo o QR Code fica válido. */
export const PIX_EXPIRATION_MINUTES = 30;

export function pixSubscriptionId(payment: Pick<PaymentResponse, "external_reference">) {
  const ref = payment.external_reference;
  return ref?.startsWith(PIX_REFERENCE_PREFIX) ? ref.slice(PIX_REFERENCE_PREFIX.length) : null;
}

/** Data no formato que o Mercado Pago espera (horário de Brasília). */
export function pixExpirationDate(from = new Date()) {
  const expires = new Date(from.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
  const brasilia = new Date(expires.getTime() - 3 * 60 * 60 * 1000);
  return brasilia.toISOString().replace("Z", "-03:00");
}

/**
 * Registra o pagamento e, se aprovado, libera 1 mês na assinatura. Só deve receber um
 * pagamento lido direto da API do Mercado Pago (nunca dados vindos do navegador).
 * Idempotente — pode ser chamado pelo webhook e pela tela do QR Code sem duplicar.
 */
export async function syncPixPayment(payment: PaymentResponse) {
  const subscriptionId = pixSubscriptionId(payment);
  if (!subscriptionId || !payment.id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("apply_pix_payment", {
    p_subscription_id: subscriptionId,
    p_payment_id: String(payment.id),
    p_amount_cents: Math.round((payment.transaction_amount ?? 0) * 100),
    p_status: payment.status ?? "unknown",
    p_raw: JSON.parse(JSON.stringify(payment)) as Json,
  });
  if (error) throw new Error(`Falha ao registrar pagamento Pix: ${error.message}`);
}
