import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/site/listing-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getApprovedListings, getCategories } from "@/lib/listings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Anúncios de máquinas e veículos",
};

const states = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.categoria === "string" ? params.categoria : undefined;
  const state = typeof params.estado === "string" ? params.estado : undefined;
  const condition = typeof params.condicao === "string" ? params.condicao : undefined;
  const page = params.pagina ? Number(params.pagina) : 1;

  const [{ listings, total, pageSize }, categories] = await Promise.all([
    getApprovedListings({ q, category, state, condition, page }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, categoria: category, estado: state, condicao: condition, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    const qs = next.toString();
    return qs ? `/anuncios?${qs}` : "/anuncios";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900">Anúncios</h1>
      <p className="mt-1 text-sm text-neutral-600">{total} resultado(s) encontrado(s)</p>

      <form className="mt-6 grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input name="q" placeholder="Buscar..." defaultValue={q} className="lg:col-span-2" />
        <Select name="categoria" defaultValue={category ?? ""}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </Select>
        <Select name="estado" defaultValue={state ?? ""}>
          <option value="">Todos os estados</option>
          {states.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </Select>
        <Select name="condicao" defaultValue={condition ?? ""}>
          <option value="">Novo ou usado</option>
          <option value="novo">Novo</option>
          <option value="usado">Usado</option>
        </Select>
        <Button type="submit" className="sm:col-span-2 lg:col-span-5">Filtrar</Button>
      </form>

      {listings.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          Nenhum anúncio encontrado com esses filtros.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ pagina: p === 1 ? undefined : String(p) })}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium",
                p === page
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
