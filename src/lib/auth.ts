import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Usuário logado, uma vez por requisição (layout e página reaproveitam).
 *
 * Lê a sessão do cookie, sem ir ao Supabase Auth: o middleware (src/middleware.ts) já
 * validou o login com getUser() nessa mesma requisição em /painel e /admin, e todos os
 * dados continuam protegidos pelo RLS do banco, que confere o token em cada consulta.
 * Antes eram duas validações pela internet por página, a principal causa da lentidão.
 * Server Actions que usam a chave de serviço continuam validando com getUser().
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

/** Perfil (papel e situação) do usuário logado, também uma vez por requisição. */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, role, status").eq("id", user.id).maybeSingle();
  return data;
});
