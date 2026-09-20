import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatBRL, cn } from "@/lib/utils";
import { ModerationActions } from "@/components/admin/moderation-actions";
import Link from "next/link";

export const metadata: Metadata = { title: "Moderação de anúncios" };

const statusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

const tabs = [
  { value: "pending_review", label: "Em análise" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Recusados" },
  { value: "", label: "Todos" },
];

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status ?? "pending_review";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("id, title, price_cents, status, created_at, profiles(company_name, full_name, email)")
    .order("created_at", { ascending: false });

  if (activeStatus) query = query.eq("status", activeStatus);

  const { data: listings } = await query;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Moderação de anúncios</h1>

      <div className="mt-4 flex gap-2 border-b border-neutral-200">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/anuncios?status=${tab.value}` : "/admin/anuncios?status="}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              activeStatus === tab.value
                ? "border-green-700 text-green-800"
                : "border-transparent text-neutral-500 hover:text-neutral-800",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {(listings ?? []).map((listing) => (
          <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <div>
              <p className="font-medium text-neutral-900">{listing.title}</p>
              <p className="text-sm text-neutral-500">
                {formatBRL(listing.price_cents)} · {listing.profiles?.company_name || listing.profiles?.full_name} ({listing.profiles?.email})
              </p>
              <Badge variant="secondary" className="mt-1">{statusLabels[listing.status] ?? listing.status}</Badge>
            </div>
            <ModerationActions listingId={listing.id} status={listing.status} />
          </div>
        ))}
        {(listings?.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
            Nenhum anúncio nesta categoria.
          </p>
        )}
      </div>
    </div>
  );
}
