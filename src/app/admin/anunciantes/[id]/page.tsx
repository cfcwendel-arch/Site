import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import { AdvertiserStatusToggle } from "@/components/admin/advertiser-status-toggle";
import { AdvertiserDeleteButton } from "@/components/admin/advertiser-delete-button";

export const metadata: Metadata = { title: "Detalhes do anunciante" };

const listingStatusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

export default async function AdvertiserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: advertiser }, { data: listings }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).eq("role", "advertiser").maybeSingle(),
    supabase.from("listings").select("id, title, status, price_cents, created_at").eq("advertiser_id", id).order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("*, plans(name, price_cents)")
      .eq("advertiser_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!advertiser) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {advertiser.company_name || advertiser.full_name}
          </h1>
          <p className="text-sm text-neutral-500">{advertiser.email} · {advertiser.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdvertiserStatusToggle profileId={advertiser.id} status={advertiser.status} />
          <AdvertiserDeleteButton
            profileId={advertiser.id}
            name={advertiser.company_name || advertiser.full_name || advertiser.email}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-neutral-900">Dados</h2>
          <dl className="mt-2 space-y-1 text-neutral-600">
            <div><dt className="inline font-medium">CPF/CNPJ: </dt><dd className="inline">{advertiser.document || "—"}</dd></div>
            <div><dt className="inline font-medium">Cidade: </dt><dd className="inline">{[advertiser.city, advertiser.state].filter(Boolean).join(" - ") || "—"}</dd></div>
            <div><dt className="inline font-medium">Cadastrado em: </dt><dd className="inline">{new Date(advertiser.created_at).toLocaleDateString("pt-BR")}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-neutral-900">Assinaturas</h2>
          {(subscriptions?.length ?? 0) === 0 ? (
            <p className="mt-2 text-neutral-500">Nenhuma assinatura.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {subscriptions!.map((sub) => (
                <li key={sub.id} className="flex items-center justify-between">
                  <span>{sub.plans?.name} — {formatBRL(sub.plans?.price_cents ?? 0)}/mês</span>
                  <Badge variant={sub.status === "active" ? "default" : "secondary"}>{sub.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold text-neutral-900">Anúncios ({listings?.length ?? 0})</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(listings ?? []).map((listing) => (
                <tr key={listing.id}>
                  <td className="px-4 py-3">{listing.title}</td>
                  <td className="px-4 py-3">{formatBRL(listing.price_cents)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{listingStatusLabels[listing.status] ?? listing.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(listings?.length ?? 0) === 0 && <p className="p-4 text-sm text-neutral-500">Nenhum anúncio.</p>}
        </div>
      </div>
    </div>
  );
}
