import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./perfil-form";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-neutral-900">Meu perfil</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        {profile && <PerfilForm profile={profile} />}
      </div>
    </div>
  );
}
