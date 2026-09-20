import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Mercado Pago webhook signature.
 * https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks#editor_4
 */
export function verifyMercadoPagoSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string;
}): boolean {
  if (!xSignature) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );

  const ts = parts.ts;
  const receivedHash = parts.v1;
  if (!ts || !receivedHash) return false;

  const manifest = `id:${dataId.toLowerCase()};${xRequestId ? `request-id:${xRequestId};` : ""}ts:${ts};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expectedHash);
  const b = Buffer.from(receivedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
