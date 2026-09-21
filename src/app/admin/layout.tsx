import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar, type SidebarLink } from "@/components/dashboard/sidebar";

const links: SidebarLink[] = [
  { href: "/admin", label: "Visão geral", icon: "layout-dashboard" },
  { href: "/admin/anunciantes", label: "Anunciantes", icon: "users" },
  { href: "/admin/anuncios", label: "Anúncios", icon: "list-checks" },
  { href: "/admin/planos", label: "Planos", icon: "credit-card" },
  { href: "/admin/categorias", label: "Categorias", icon: "tag" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <DashboardSidebar links={links} title="Painel administrativo" />
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
