import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { NewListingForm } from "@/components/dashboard/new-listing-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createListingForAdvertiserAction } from "@/app/admin/anuncios/actions";

export const metadata: Metadata = { title: "Novo anúncio" };

export default async function AdminNovoAnuncioPage({
  searchParams,
}: {
  searchParams: Promise<{ anunciante?: string }>;
}) {
  const { anunciante } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: categories }, { data: advertisers }] = await Promise.all([
    supabase.from("categories").select("id,name").order("position"),
    supabase
      .from("profiles")
      .select("id, full_name, company_name, email, role")
      .order("company_name", { ascending: true, nullsFirst: false }),
  ]);

  const options = (advertisers ?? []).map((p) => ({
    id: p.id,
    label:
      p.id === user?.id
        ? "AgroNegocia (eu mesmo)"
        : [p.company_name, p.full_name].filter(Boolean).join(" — ") || p.email,
  }));
  const selected = options.some((o) => o.id === anunciante) ? anunciante : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-neutral-900">Novo anúncio</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Escolha o anunciante, adicione as fotos, preencha os dados e clique em “Publicar anúncio”.
        O anúncio já entra no ar aprovado.
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <NewListingForm
          categories={categories ?? []}
          createAction={createListingForAdvertiserAction}
          doneHref="/admin/anuncios/:id/editar"
        >
          <div>
            <Label htmlFor="advertiserId">Anunciante (de quem é a máquina)</Label>
            <Select id="advertiserId" name="advertiserId" required defaultValue={selected ?? ""}>
              <option value="" disabled>
                Selecione...
              </option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-neutral-500">
              O anunciante ainda não tem conta?{" "}
              <Link href="/admin/anunciantes/novo" className="font-medium text-green-700 hover:underline">
                Cadastrar anunciante
              </Link>
            </p>
          </div>
        </NewListingForm>
      </div>
    </div>
  );
}
