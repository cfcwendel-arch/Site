import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ListingForm } from "@/components/dashboard/listing-form";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { ListingActions } from "@/components/dashboard/listing-actions";
import { updateListingAction } from "@/app/painel/anuncios/actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Editar anúncio" };

const statusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "No ar",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

export default async function AdminEditarAnuncioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; publicado?: string; fotos_falharam?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirect=/admin/anuncios");

  const [{ data: listing }, { data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, profiles(company_name, full_name, email)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id,name").order("position"),
    supabase.from("listing_images").select("id,path,position").eq("listing_id", id).order("position"),
  ]);
  if (!listing) notFound();

  const owner = listing.profiles;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Editar anúncio</h1>
          <p className="text-sm text-neutral-500">
            Anunciante: {owner?.company_name || owner?.full_name || owner?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={listing.status === "approved" ? "default" : "secondary"}>
            {statusLabels[listing.status] ?? listing.status}
          </Badge>
          {listing.status === "approved" && (
            <Link href={`/anuncios/${listing.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Ver no site
            </Link>
          )}
        </div>
      </div>

      {(search.created || search.publicado) && (
        <p className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
          ✅ Anúncio publicado e já está no ar!
          {search.fotos_falharam
            ? ` Atenção: ${search.fotos_falharam} foto(s) não subiram — adicione de novo abaixo.`
            : " Se quiser, adicione ou troque fotos abaixo."}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 font-semibold text-neutral-900">Fotos</h2>
        <ImageUploader listingId={id} userId={user.id} initialImages={images ?? []} />
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <ListingForm
          action={updateListingAction.bind(null, id)}
          categories={categories ?? []}
          submitLabel="Salvar alterações"
          defaults={{
            title: listing.title,
            categoryId: listing.category_id ?? undefined,
            description: listing.description ?? undefined,
            priceCents: listing.price_cents,
            condition: listing.condition,
            brand: listing.brand ?? undefined,
            model: listing.model ?? undefined,
            year: listing.year,
            hoursUsed: listing.hours_used,
            mileageKm: listing.mileage_km,
            city: listing.city ?? undefined,
            state: listing.state ?? undefined,
            whatsapp: listing.whatsapp ?? undefined,
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 font-semibold text-neutral-900">Gerenciar anúncio</h2>
        <ListingActions listingId={id} status={listing.status} afterDeleteHref="/admin/anuncios?status=" />
      </div>
    </div>
  );
}
