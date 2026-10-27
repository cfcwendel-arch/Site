import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** Símbolo da AgroNegocia: sol nascendo atrás de um broto, sobre as linhas da lavoura. */
export function LogoMark({ className }: { className?: string }) {
  // IDs únicos: o símbolo aparece mais de uma vez na mesma página (topo e rodapé).
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b7238" />
          <stop offset="1" stopColor="#06491f" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect width="120" height="120" rx="30" />
        </clipPath>
      </defs>
      <rect width="120" height="120" rx="30" fill={`url(#bg-${id})`} />
      <g clipPath={`url(#clip-${id})`}>
        <circle cx="60" cy="70" r="35" fill="#e9a006" />
        <path d="M0 70 Q60 60 120 70 V120 H0 Z" fill="#0f8a43" />
        <path d="M53 70 C44 88 28 106 10 126 L24 126 C38 108 50 90 56 70 Z" fill="#fff" />
        <path d="M58.5 69 C56 90 52 108 48 126 L58 126 C59 108 60 90 61.5 69 Z" fill="#fff" opacity="0.92" />
        <path d="M64 70 C70 90 82 108 96 126 L110 126 C92 106 76 88 67 70 Z" fill="#fff" />
        <path d="M60 68 L60 50" stroke="#06491f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M60 60 C51 61 44 55 43 46 C52 46 59 52 60 60 Z" fill="#06491f" />
        <path d="M60 53 C69 54 76 48 77 39 C68 39 61 45 60 53 Z" fill="#06491f" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  compact = true,
}: {
  className?: string;
  /** Corta a frase em uma linha — use false onde há espaço para quebrar (ex.: rodapé). */
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="AgroNegocia — página inicial">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight">
          <span className="text-brand-green">Agro</span>
          <span className="text-brand-gold">Negocia</span>
        </span>
        <span
          className={cn(
            "block font-semibold uppercase text-neutral-500",
            compact
              ? "max-w-[220px] truncate text-[9px] tracking-[0.06em]"
              : "max-w-[260px] text-[10px] tracking-[0.08em]",
          )}
        >
          Máquinas · Veículos · Implementos
        </span>
      </span>
    </Link>
  );
}
