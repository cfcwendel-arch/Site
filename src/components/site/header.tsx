import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { HeaderMobileMenu } from "@/components/site/header-mobile-menu";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { AuthStateProvider } from "@/components/site/auth-state";
import { HeaderAuthButtons, PromoBar } from "@/components/site/header-auth";
import { getSupportWhatsappLink } from "@/lib/support-whatsapp";

const navLinks = [
  { href: "/anuncios", label: "Anúncios" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

// O cabeçalho não lê cookies no servidor: o login é resolvido no navegador
// (AuthStateProvider), então as páginas públicas podem sair prontas do cache.
export async function SiteHeader() {
  const whatsappHref = await getSupportWhatsappLink("Olá! Vim pelo site AgroNegocia.");

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
    <AuthStateProvider>
      <PromoBar />
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
            <HeaderAuthButtons />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {whatsappButton}
            <HeaderMobileMenu navLinks={navLinks} />
          </div>
        </div>
      </header>
    </AuthStateProvider>
  );
}
