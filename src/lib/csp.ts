/**
 * Content-Security-Policy do site.
 *
 * - Com `nonce` (painel e admin, gerado a cada requisição no middleware): só rodam os
 *   scripts do próprio Next.js marcados com o nonce. Sem isso o navegador bloqueava os
 *   scripts embutidos do Next e o painel ficava preso na tela de carregamento.
 * - Sem `nonce` (páginas públicas, servidas prontas do cache): só scripts do próprio site.
 */
export function buildCsp(nonce?: string) {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : undefined;

  return [
    "default-src 'self'",
    nonce ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'` : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ""}`,
    `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
