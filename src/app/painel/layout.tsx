import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar, type SidebarLink } from "@/components/dashboard/sidebar";

const links: SidebarLink[] = [
  { href: "/painel", label: "Visão geral", icon: "layout-dashboard" },
  { href: "/painel/anuncios", label: "Meus anúncios", icon: "list-checks" },
  { href: "/painel/anuncios/novo", label: "Novo anúncio", icon: "plus-circle" },
  { href: "/painel/assinatura", label: "Assinatura", icon: "credit-card" },
  { href: "/painel/perfil", label: "Meu perfil", icon: "user-circle" },
];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?redirect=/painel");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.status === "suspended") redirect("/conta-suspensa");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <DashboardSidebar links={links} title="Painel do anunciante" />
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
