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

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4">
        <Logo />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = iconMap[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium",
                active ? "bg-green-50 text-green-800" : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="border-t border-neutral-200 p-3">
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
