"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function HeaderMobileMenu({
  navLinks,
  isAuthenticated,
  dashboardHref,
}: {
  navLinks: { href: string; label: string }[];
  isAuthenticated: boolean;
  dashboardHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-3">
              {isAuthenticated ? (
                <Link href={dashboardHref} onClick={() => setOpen(false)} className={buttonVariants()}>
                  Meu painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/entrar"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Entrar
                  </Link>
                  <Link href="/cadastro" onClick={() => setOpen(false)} className={buttonVariants()}>
                    Anunciar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
