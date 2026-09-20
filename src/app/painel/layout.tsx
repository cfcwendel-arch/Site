import { redirect } from "next/navigation";
import { LayoutDashboard, ListChecks, PlusCircle, CreditCard, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar, type SidebarLink } from "@/components/dashboard/sidebar";

const links: SidebarLink[] = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/anuncios", label: "Meus anúncios", icon: ListChecks },
  { href: "/painel/anuncios/novo", label: "Novo anúncio", icon: PlusCircle },
  { href: "/painel/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/painel/perfil", label: "Meu perfil", icon: UserCircle },
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
