import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Gauge, Calendar, MessageCircle } from "lucide-react";
import { getListingBySlug } from "@/lib/listings";
import { listingImageUrl } from "@/lib/storage";
import { formatBRL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LeadForm } from "@/components/site/lead-form";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description?.slice(0, 160),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) notFound();

  const supabase = await createClient();
  void supabase.rpc("increment_listing_views", { p_listing_id: listing.id });

  const images = [...listing.listing_images].sort((a, b) => a.position - b.position);
  const seller = listing.profiles;
  const whatsappLink = listing.whatsapp
    ? `https://wa.me/55${listing.whatsapp}?text=${encodeURIComponent(
        `Olá, tenho interesse no anúncio "${listing.title}" no AgroNegocia.`,
      )}`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-100">
            {images[0] ? (
              <Image
                src={listingImageUrl(images[0].path)}
                alt={listing.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">Sem foto</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                  <Image src={listingImageUrl(img.path)} alt={listing.title} fill sizes="150px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={listing.condition === "novo" ? "default" : "secondary"}>
                {listing.condition === "novo" ? "Novo" : "Usado"}
              </Badge>
              {listing.categories?.name && <Badge variant="outline">{listing.categories.name}</Badge>}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-neutral-900">{listing.title}</h1>
            <p className="mt-2 text-3xl font-bold text-green-700">{formatBRL(listing.price_cents)}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-4">
              {listing.brand && (
                <div>
                  <dt className="text-xs text-neutral-500">Marca</dt>
                  <dd className="font-medium">{listing.brand}</dd>
                </div>
              )}
              {listing.model && (
                <div>
                  <dt className="text-xs text-neutral-500">Modelo</dt>
                  <dd className="font-medium">{listing.model}</dd>
                </div>
              )}
              {listing.year && (
                <div>
                  <dt className="flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar className="h-3.5 w-3.5" /> Ano
                  </dt>
                  <dd className="font-medium">{listing.year}</dd>
                </div>
              )}
              {listing.hours_used !== null && listing.hours_used !== undefined && (
                <div>
                  <dt className="flex items-center gap-1 text-xs text-neutral-500">
                    <Gauge className="h-3.5 w-3.5" /> Horas de uso
                  </dt>
                  <dd className="font-medium">{listing.hours_used}h</dd>
                </div>
              )}
              {listing.mileage_km !== null && listing.mileage_km !== undefined && (
                <div>
                  <dt className="flex items-center gap-1 text-xs text-neutral-500">
                    <Gauge className="h-3.5 w-3.5" /> Km rodados
                  </dt>
                  <dd className="font-medium">{listing.mileage_km} km</dd>
                </div>
              )}
              {(listing.city || listing.state) && (
                <div>
                  <dt className="flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin className="h-3.5 w-3.5" /> Localização
                  </dt>
                  <dd className="font-medium">{[listing.city, listing.state].filter(Boolean).join(" - ")}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6">
              <h2 className="font-semibold text-neutral-900">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700">{listing.description}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="font-semibold text-neutral-900">
              {seller?.company_name || seller?.full_name || "Anunciante"}
            </h3>
            {(seller?.city || seller?.state) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" />
                {[seller?.city, seller?.state].filter(Boolean).join(" - ")}
              </p>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`${buttonVariants()} mt-4 w-full gap-2`}
              >
                <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
              </a>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-neutral-900">Enviar mensagem</h3>
            <LeadForm listingId={listing.id} listingTitle={listing.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
