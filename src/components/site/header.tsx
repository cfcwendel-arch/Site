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

async function getHeaderAuthState() {
  try {
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

    return { user, role };
  } catch (err) {
    // Never swallow Next.js's own internal control-flow signals (redirect(),
    // notFound(), the DYNAMIC_SERVER_USAGE bailout during static generation) —
    // only degrade gracefully on a genuine Supabase/network failure.
    const digest = (err as { digest?: string } | null)?.digest;
    if (typeof digest === "string" && (digest.startsWith("NEXT_") || digest === "DYNAMIC_SERVER_USAGE")) {
      throw err;
    }
    console.error("Erro ao carregar sessão no cabeçalho", err);
    return { user: null, role: null };
  }
}

export async function SiteHeader() {
  const { user, role } = await getHeaderAuthState();
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
