import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden="true">
          <path
            d="M12 21c-4.5-1-8-4.8-8-10 0-3 1-6 3-8 1 3 2.5 4.5 5 5.5-1-2-1-4 0-6 3 1.5 5 4 5 8 0 5.2-3.5 9-5 10.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 21V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight">
          <span className="text-green-700">Agro</span>
          <span className="text-neutral-900">Negocia</span>
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Máquinas e Veículos
        </span>
      </span>
    </Link>
  );
}
