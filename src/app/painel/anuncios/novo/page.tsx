import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { NewListingForm } from "@/components/dashboard/new-listing-form";
import { createOwnListingAction } from "@/app/painel/anuncios/actions";

export const metadata: Metadata = { title: "Novo anúncio" };

export default async function NovoAnuncioPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id,name").order("position"),
    supabase.from("profiles").select("phone, city, state").eq("id", user?.id ?? "").maybeSingle(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-neutral-900">Novo anúncio</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Adicione as fotos, preencha os dados e toque em <strong>Publicar anúncio</strong>. Seu anúncio
        passa por uma rápida análise e aparece no site assim que for aprovado.
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <NewListingForm
          categories={categories ?? []}
          createAction={createOwnListingAction}
          doneHref="/painel/anuncios"
          defaults={{
            whatsapp: profile?.phone ?? undefined,
            city: profile?.city ?? undefined,
            state: profile?.state ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
