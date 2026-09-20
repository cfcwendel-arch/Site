import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Meus anúncios" };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "warning"> = {
  pending_review: "warning",
  approved: "default",
  rejected: "destructive",
  sold: "secondary",
  paused: "secondary",
};

const statusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

export default async function MeusAnunciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, slug, status, price_cents, created_at, views")
    .eq("advertiser_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Meus anúncios</h1>
        <Link href="/painel/anuncios/novo" className={buttonVariants()}>
          Novo anúncio
        </Link>
      </div>

      {(listings?.length ?? 0) === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Você ainda não publicou nenhum anúncio.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Anúncio</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Visualizações</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {listings!.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{listing.title}</td>
                  <td className="px-4 py-3">{formatBRL(listing.price_cents)}</td>
                  <td className="px-4 py-3">{listing.views}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[listing.status] ?? "secondary"}>
                      {statusLabels[listing.status] ?? listing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/painel/anuncios/${listing.id}/editar`}
                      className="font-medium text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
