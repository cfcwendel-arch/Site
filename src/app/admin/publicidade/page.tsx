import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AD_PLACEMENTS, AD_PLACEMENT_KEYS } from "@/lib/ads";
import { AdCreateForm } from "@/components/admin/ad-create-form";
import { AdList } from "@/components/admin/ad-list";

export const metadata: Metadata = { title: "Publicidade" };

export default async function AdminPublicidadePage() {
  const supabase = await createClient();
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .order("placement")
    .order("position")
    .order("created_at", { ascending: false });

  const now = new Date().getTime();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-neutral-900">Publicidade</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Cadastre, troque ou remova os banners de publicidade do site sem precisar mexer no código.
        Todos aparecem com a etiqueta “Publicidade”, separados dos anúncios dos clientes.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-neutral-900">Novo banner</h2>
        <AdCreateForm placements={AD_PLACEMENT_KEYS.map((key) => ({ key, label: AD_PLACEMENTS[key].label }))} />
      </div>

      <div className="mt-8 space-y-8">
        {AD_PLACEMENT_KEYS.map((key) => {
          const items = (ads ?? []).filter((ad) => ad.placement === key);
          const activeCount = items.filter((ad) => ad.active).length;
          return (
            <section key={key}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold text-neutral-900">{AD_PLACEMENTS[key].label}</h2>
                <span className="text-xs text-neutral-500">
                  {activeCount} ativo(s) · {AD_PLACEMENTS[key].slots} espaço(s) exibido(s)
                </span>
              </div>
              <div className="mt-3">
                <AdList ads={items} now={now} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
