import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Menu do celular feito com <details>/<summary> do próprio HTML: abre e fecha sem
 * JavaScript. As páginas públicas saem prontas do cache com uma CSP que não permite os
 * scripts embutidos do Next, então um menu que dependesse de JS não abria no celular.
 */
export function HeaderMobileMenu({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  return (
    <details className="group md:hidden">
      <summary
        aria-label="Abrir menu"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 [&::-webkit-details-marker]:hidden"
      >
        <Menu className="h-5 w-5 group-open:hidden" />
        <X className="hidden h-5 w-5 group-open:block" />
      </summary>

      <div className="absolute inset-x-0 top-16 z-50 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg">
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-3">
            <Link href="/painel" className={buttonVariants({ variant: "outline" })}>
              Entrar / Meu painel
            </Link>
            <Link href="/cadastro" className={buttonVariants()}>
              Anunciar
            </Link>
          </div>
        </nav>
      </div>
    </details>
  );
}
