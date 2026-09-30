import Link from "next/link";
import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = true,
}: {
  className?: string;
  /** Truncates the tagline to one line — use false where there's room to wrap (e.g. the footer). */
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white">
          <Tractor className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight">
          <span className="text-brand-green">Agro</span>
          <span className="text-brand-gold">Negocia</span>
        </span>
        <span
          className={cn(
            "block text-[10px] font-semibold uppercase tracking-widest text-neutral-500",
            compact ? "max-w-[190px] truncate" : "max-w-[220px]",
          )}
        >
          Compra e venda de veículos e implementos agrícolas
        </span>
      </span>
    </Link>
  );
}
