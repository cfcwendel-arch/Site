"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useAuthState } from "@/components/site/auth-state";

/** Botões Entrar/Anunciar ou Meu painel, conforme o login. */
export function HeaderAuthButtons() {
  const { loggedIn, dashboardHref } = useAuthState();

  if (loggedIn) {
    return (
      <Link href={dashboardHref} className={buttonVariants()}>
        Meu painel
      </Link>
    );
  }

  return (
    <>
      <Link href="/entrar" className="text-sm font-medium text-neutral-700 hover:text-green-700">
        Entrar
      </Link>
      <Link href="/cadastro" className={buttonVariants()}>
        Anunciar
      </Link>
    </>
  );
}

/** Faixa do mês grátis, só para quem ainda não está logado. */
export function PromoBar() {
  const { loggedIn } = useAuthState();
  if (loggedIn) return null;

  return (
    <Link
      href="/cadastro"
      className="flex items-center justify-center gap-2 bg-brand-gold px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-gold-dark"
    >
      <Gift className="h-4 w-4 shrink-0" />
      <span>
        Primeiro mês de anúncio grátis!{" "}
        <span className="underline underline-offset-2">Aproveite e cadastre-se agora</span>
      </span>
    </Link>
  );
}
