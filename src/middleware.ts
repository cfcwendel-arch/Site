import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildCsp } from "@/lib/csp";

export async function middleware(request: NextRequest) {
  // Nonce novo a cada requisição: o Next.js lê a CSP do cabeçalho da requisição e marca
  // os próprios scripts com ele, então só esses scripts rodam no painel/admin.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  const response = await updateSession(request);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

// Só nas áreas logadas. As páginas públicas saem prontas do cache e resolvem o login no
// navegador — rodar o middleware nelas só gastava créditos do Netlify a cada visita.
export const config = {
  matcher: ["/painel/:path*", "/admin/:path*"],
};
