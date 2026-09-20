import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

export default async function PainelOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscription }, { data: listings }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, plans(name, max_listings, price_cents)")
      .eq("advertiser_id", user!.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id, title, status, price_cents, created_at")
      .eq("advertiser_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const usedSlots =
    (listings ?? []).filter((l) => ["pending_review", "approved", "paused"].includes(l.status)).length ?? 0;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-neutral-900">Visão geral</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <p className="text-lg font-semibold">{subscription.plans?.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatBRL(subscription.plans?.price_cents ?? 0)}/mês · {usedSlots}/
                  {subscription.plans?.max_listings} anúncios usados
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600">Você ainda não tem uma assinatura ativa.</p>
                <Link href="/painel/assinatura" className={`${buttonVariants({ size: "sm" })} mt-3`}>
                  Assinar um plano
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/painel/anuncios/novo" className={buttonVariants({ size: "sm" })}>
              Publicar novo anúncio
            </Link>
            <Link href="/painel/anuncios" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Ver meus anúncios
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Últimos anúncios</h2>
        {(listings?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Você ainda não publicou nenhum anúncio.</p>
        ) : (
          <div className="mt-3 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {listings!.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-neutral-900">{listing.title}</p>
                  <p className="text-sm text-neutral-500">{formatBRL(listing.price_cents)}</p>
                </div>
                <Badge variant={listing.status === "approved" ? "default" : "secondary"}>
                  {statusLabels[listing.status] ?? listing.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
