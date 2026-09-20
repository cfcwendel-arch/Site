import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";
import { HeaderMobileMenu } from "@/components/site/header-mobile-menu";

const navLinks = [
  { href: "/anuncios", label: "Anúncios" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const dashboardHref = role === "admin" ? "/admin" : "/painel";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={dashboardHref} className={buttonVariants()}>
              Meu painel
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="text-sm font-medium text-neutral-700 hover:text-green-700">
                Entrar
              </Link>
              <Link href="/cadastro" className={buttonVariants()}>
                Anunciar
              </Link>
            </>
          )}
        </div>

        <HeaderMobileMenu navLinks={navLinks} isAuthenticated={!!user} dashboardHref={dashboardHref} />
      </div>
    </header>
  );
}
