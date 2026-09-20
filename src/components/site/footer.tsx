import Link from "next/link";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-neutral-600">
            O marketplace de máquinas e veículos do agronegócio. Conectamos quem vende com quem
            precisa produzir mais.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Navegação</h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li><Link href="/anuncios" className="hover:text-green-700">Ver anúncios</Link></li>
            <li><Link href="/planos" className="hover:text-green-700">Planos para anunciantes</Link></li>
            <li><Link href="/sobre" className="hover:text-green-700">Sobre a AgroNegocia</Link></li>
            <li><Link href="/contato" className="hover:text-green-700">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Anunciantes</h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li><Link href="/cadastro" className="hover:text-green-700">Criar conta</Link></li>
            <li><Link href="/entrar" className="hover:text-green-700">Entrar</Link></li>
            <li><Link href="/painel" className="hover:text-green-700">Painel do anunciante</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li><Link href="/termos" className="hover:text-green-700">Termos de uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-green-700">Privacidade</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} AgroNegocia. Todos os direitos reservados.</p>
          <p>Desenvolvido por PMG Code</p>
        </div>
      </div>
    </footer>
  );
}
