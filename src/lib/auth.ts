import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Usuário logado, consultado uma única vez por requisição: layout e página reaproveitam
 * o mesmo resultado em vez de ir ao Supabase Auth cada um.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil (papel e situação) do usuário logado, também uma vez por requisição. */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, role, status").eq("id", user.id).maybeSingle();
  return data;
});
