import Image from "next/image";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { adImageUrl, type Ad } from "@/lib/ad-placements";
import { cn } from "@/lib/utils";

type AdVariant = "card" | "side" | "wide";

const aspectByVariant: Record<AdVariant, string> = {
  card: "aspect-[4/3]",
  side: "aspect-square",
  wide: "aspect-[4/1] sm:aspect-[6/1]",
};

const sizesByVariant: Record<AdVariant, string> = {
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
  side: "(max-width: 1024px) 100vw, 33vw",
  wide: "(max-width: 1024px) 100vw, 66vw",
};

/** Etiqueta que deixa claro para o usuário que aquilo é publicidade, não conteúdo do site. */
export function AdLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800",
        className,
      )}
    >
      Publicidade
    </span>
  );
}

export function AdBanner({ ad, variant = "card", className }: { ad: Ad; variant?: AdVariant; className?: string }) {
  const content = (
    <>
      <div className={cn("relative w-full overflow-hidden bg-neutral-100", aspectByVariant[variant])}>
        <Image
          src={adImageUrl(ad.image_path)}
          alt={ad.title}
          fill
          sizes={sizesByVariant[variant]}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <AdLabel className="absolute left-1.5 top-1.5 shadow-sm" />
      </div>
      {variant !== "wide" && (
        <p className="truncate px-2 py-1.5 text-xs font-medium text-neutral-700">{ad.title}</p>
      )}
    </>
  );

  const wrapperClass = cn(
    "group block overflow-hidden rounded-lg border border-amber-200/70 bg-white transition-shadow hover:shadow-md",
    className,
  );

  if (!ad.link_url) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return (
    <a href={ad.link_url} target="_blank" rel="sponsored noopener noreferrer" className={wrapperClass}>
      {content}
    </a>
  );
}

/** Espaço livre: convida novos anunciantes sem pesar visualmente a página. */
export function AdPlaceholder({ variant = "card", className }: { variant?: AdVariant; className?: string }) {
  return (
    <Link
      href="/contato"
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 bg-white p-3 text-center text-neutral-500 transition-colors hover:border-green-600 hover:text-green-700",
        aspectByVariant[variant],
        className,
      )}
    >
      <Megaphone className="h-5 w-5" />
      <span className="text-xs font-semibold">Anuncie aqui</span>
      <span className="text-[11px]">Fale com a gente</span>
    </Link>
  );
}
