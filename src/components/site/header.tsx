import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";
import { HeaderMobileMenu } from "@/components/site/header-mobile-menu";
import { WhatsAppIcon, whatsappLink } from "@/components/site/whatsapp-icon";
import { Gift } from "lucide-react";

const navLinks = [
  { href: "/anuncios", label: "Anúncios" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

async function getSupportWhatsapp() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("support_phone").maybeSingle();
    return whatsappLink(data?.support_phone, "Olá! Vim pelo site AgroNegocia.");
  } catch {
    return null;
  }
}

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
  const [{ user, role }, whatsappHref] = await Promise.all([getHeaderAuthState(), getSupportWhatsapp()]);
  const dashboardHref = role === "admin" ? "/admin" : "/painel";

  const whatsappButton = whatsappHref && (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com a gente no WhatsApp"
      title="Fale com a gente no WhatsApp"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  );

  return (
    <>
      {!user && (
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
      )}
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
            {whatsappButton}
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

          <div className="flex items-center gap-2 md:hidden">
            {whatsappButton}
            <HeaderMobileMenu navLinks={navLinks} isAuthenticated={!!user} dashboardHref={dashboardHref} />
          </div>
        </div>
      </header>
    </>
  );
}
