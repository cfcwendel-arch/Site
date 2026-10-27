import "server-only";
import { headers } from "next/headers";

/** Endereço público do site, usado quando não há uma requisição (robots, sitemap). */
export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agronegocia.netlify.app").replace(/\/$/, "");

/**
 * Endereço do site para links enviados ao usuário (recuperar senha etc.). Usa o domínio
 * da própria requisição, então nunca gera link para "localhost" mesmo se a variável
 * NEXT_PUBLIC_SITE_URL não estiver configurada no Netlify.
 */
export async function getSiteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return host ? `http://${host}` : PUBLIC_SITE_URL;
}
