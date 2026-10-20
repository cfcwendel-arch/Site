import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Cliente anônimo, sem cookies, para dados públicos (anúncios aprovados, categorias,
 * planos, banners). Por não depender da sessão, o resultado pode ir para o cache e as
 * páginas públicas podem ser servidas prontas, sem consultar o banco a cada visita.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
