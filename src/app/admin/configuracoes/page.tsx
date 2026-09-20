import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
