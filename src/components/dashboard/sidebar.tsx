"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { signOutAction } from "@/app/actions/auth";
import {
  LogOut,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  CreditCard,
  UserCircle,
  Users,
  Tag,
  Settings,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Server Components can't pass component/function references as props to
// Client Components across the RSC boundary — only plain serializable data.
// Layouts pass an icon *name*; this map resolves it to the actual component
// here on the client side.
const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "list-checks": ListChecks,
  "plus-circle": PlusCircle,
  "credit-card": CreditCard,
  "user-circle": UserCircle,
  users: Users,
  tag: Tag,
  settings: Settings,
  megaphone: Megaphone,
} satisfies Record<string, LucideIcon>;

export type SidebarIconName = keyof typeof iconMap;
export type SidebarLink = { href: string; label: string; icon: SidebarIconName };

export function DashboardSidebar({
  links,
  title,
}: {
  links: SidebarLink[];
  title: string;
}) {
  const pathname = usePathname();
  // Marca só o item mais específico que corresponde à página atual.
  const activeHref = links
    .map((l) => l.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    // Celular: barra no topo com o menu rolando na horizontal. Computador: menu lateral.
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-neutral-200 bg-white md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 md:block md:border-b md:border-neutral-200 md:p-4">
        <Logo />
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-neutral-500 md:mt-2 md:block">{title}</p>
        <form action={signOutAction} className="md:hidden">
          <button type="submit" className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-neutral-600">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible md:p-3">
        {links.map((link) => {
          const active = link.href === activeHref;
          const Icon = iconMap[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              // Sem pré-carregar todas as páginas do menu em segundo plano: cada uma consulta
              // o banco, e a tela de carregamento já aparece na hora ao clicar.
              prefetch={false}
              className={cn(
                "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium",
                active ? "bg-green-50 text-green-800" : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="hidden border-t border-neutral-200 p-3 md:block">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </form>
    </aside>
  );
}
