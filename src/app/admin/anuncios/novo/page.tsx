import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/dashboard/listing-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createListingAsAdminAction } from "@/app/admin/anuncios/actions";

export const metadata: Metadata = { title: "Novo anúncio" };

export default async function AdminNovoAnuncioPage({
  searchParams,
}: {
  searchParams: Promise<{ anunciante?: string }>;
}) {
  const { anunciante } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        Preencha os dados e clique em “Publicar”. O anúncio já entra no ar aprovado. Na próxima
        tela você adiciona as fotos.
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <ListingForm action={createListingAsAdminAction} categories={categories ?? []} submitLabel="Publicar anúncio">
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
        </ListingForm>
      </div>
    </div>
  );
}
