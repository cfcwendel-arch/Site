import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/dashboard/listing-form";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { ListingActions } from "@/components/dashboard/listing-actions";
import { updateListingAction } from "@/app/painel/anuncios/actions";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Editar anúncio" };

const statusLabels: Record<string, string> = {
  pending_review: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  sold: "Vendido",
  paused: "Pausado",
};

export default async function EditarAnuncioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: listing }, { data: categories }, { data: images }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("position"),
    supabase.from("listing_images").select("id,path,position").eq("listing_id", id).order("position"),
  ]);

  if (!listing) notFound();

  const boundUpdate = updateListingAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Editar anúncio</h1>
        <Badge variant={listing.status === "approved" ? "default" : "secondary"}>
          {statusLabels[listing.status] ?? listing.status}
        </Badge>
      </div>

      {search.created && (
        <p className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Anúncio criado! Adicione fotos abaixo para aumentar suas chances de venda.
        </p>
      )}

      {listing.status === "rejected" && listing.rejection_reason && (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
          Motivo da recusa: {listing.rejection_reason}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 font-semibold text-neutral-900">Fotos</h2>
        <ImageUploader listingId={id} userId={user.id} initialImages={images ?? []} />
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <ListingForm
          action={boundUpdate}
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
        <ListingActions listingId={id} status={listing.status} />
      </div>
    </div>
  );
}
