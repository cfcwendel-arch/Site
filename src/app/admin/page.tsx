import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel admin" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [advertisersCount, pendingListingsCount, activeSubs, settings] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "advertiser"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("subscriptions").select("*, plans(price_cents)").eq("status", "active"),
    supabase.from("site_settings").select("commission_percent").single(),
  ]);

  const mrr = (activeSubs.data ?? []).reduce((sum, s) => sum + (s.plans?.price_cents ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Visão geral</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-neutral-500">Anunciantes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{advertisersCount.count ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-neutral-500">Assinaturas ativas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{activeSubs.data?.length ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-neutral-500">Receita recorrente (MRR)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatBRL(mrr)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-neutral-500">Anúncios em análise</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingListingsCount.count ?? 0}</p>
            {(pendingListingsCount.count ?? 0) > 0 && (
              <Link href="/admin/anuncios?status=pending_review" className="text-xs font-medium text-green-700 hover:underline">
                Ver fila de moderação
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        Comissão configurada sobre o GMV (referência, não cobrada automaticamente): {settings.data?.commission_percent ?? 0}%
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/anuncios?status=pending_review" className={buttonVariants()}>
          Moderar anúncios
        </Link>
        <Link href="/admin/anunciantes" className={buttonVariants({ variant: "outline" })}>
          Ver anunciantes
        </Link>
        <Link href="/admin/planos" className={buttonVariants({ variant: "outline" })}>
          Gerenciar planos
        </Link>
      </div>
    </div>
  );
}
