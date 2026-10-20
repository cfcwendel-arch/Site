import "server-only";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getPreApprovalClient() {
  return new PreApproval(getMercadoPagoClient());
}
