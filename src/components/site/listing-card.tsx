import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import { listingImageUrl } from "@/lib/storage";

type ListingCardData = {
  slug: string;
  title: string;
  price_cents: number;
  condition: string;
  city: string | null;
  state: string | null;
  categories: { name: string } | null;
  listing_images: { path: string; position: number }[];
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = [...listing.listing_images].sort((a, b) => a.position - b.position)[0];

  return (
    <Link
      href={`/anuncios/${listing.slug}`}
      className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {cover ? (
          <Image
            src={listingImageUrl(cover.path)}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Sem foto
          </div>
        )}
        <Badge className="absolute left-2 top-2" variant={listing.condition === "novo" ? "default" : "secondary"}>
          {listing.condition === "novo" ? "Novo" : "Usado"}
        </Badge>
      </div>
      <div className="p-4">
        {listing.categories?.name && (
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">
            {listing.categories.name}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-semibold text-neutral-900">{listing.title}</h3>
        <p className="mt-2 text-lg font-bold text-neutral-900">{formatBRL(listing.price_cents)}</p>
        {(listing.city || listing.state) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {[listing.city, listing.state].filter(Boolean).join(" - ")}
          </p>
        )}
      </div>
    </Link>
  );
}
