import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { DashboardSidebar, type SidebarLink } from "@/components/dashboard/sidebar";

const links: SidebarLink[] = [
  { href: "/admin", label: "Visão geral", icon: "layout-dashboard" },
  { href: "/admin/anunciantes", label: "Anunciantes", icon: "users" },
  { href: "/admin/anuncios/novo", label: "Novo anúncio", icon: "plus-circle" },
  { href: "/admin/anuncios", label: "Anúncios", icon: "list-checks" },
  { href: "/admin/publicidade", label: "Publicidade", icon: "megaphone" },
  { href: "/admin/planos", label: "Planos", icon: "credit-card" },
  { href: "/admin/categorias", label: "Categorias", icon: "tag" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) redirect("/entrar?redirect=/admin");
  if (profile?.role !== "admin" || profile.status !== "active") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      <DashboardSidebar links={links} title="Painel administrativo" />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
