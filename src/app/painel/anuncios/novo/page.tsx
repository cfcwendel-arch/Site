import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/dashboard/listing-form";
import { createListingAction } from "@/app/painel/anuncios/actions";

export const metadata: Metadata = { title: "Novo anúncio" };

export default async function NovoAnuncioPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name").order("position");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-neutral-900">Novo anúncio</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Após criar o anúncio, você poderá adicionar fotos. Todo anúncio passa por análise antes de
        ficar visível publicamente.
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <ListingForm action={createListingAction} categories={categories ?? []} submitLabel="Criar anúncio" />
      </div>
    </div>
  );
}
