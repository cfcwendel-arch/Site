import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Só nas áreas logadas. As páginas públicas saem prontas do cache e resolvem o login no
// navegador — rodar o middleware nelas só gastava créditos do Netlify a cada visita.
export const config = {
  matcher: ["/painel/:path*", "/admin/:path*"],
};
