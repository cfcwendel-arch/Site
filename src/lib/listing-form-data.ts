import { listingSchema } from "@/lib/validations";

/**
 * Preço digitado do jeito brasileiro: "98.900", "98.900,00", "98900" ou "98900,50".
 * Antes o campo era numérico e "98.900" virava 98,9 (o ponto de milhar era lido como
 * vírgula decimal) — os anúncios saíam com o preço mil vezes menor.
 */
export function parsePriceReais(raw: string) {
  const v = raw.replace(/[R$\s]/g, "");
  if (!v) return NaN;
  if (v.includes(",")) return Number(v.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(v)) return Number(v.replace(/\./g, ""));
  return Number(v);
}

/** Lê o formulário de anúncio (painel do anunciante e admin). */
export function parseListingForm(formData: FormData) {
  const priceReais = parsePriceReais(String(formData.get("priceReais") ?? ""));
  const priceCents = Number.isFinite(priceReais) ? Math.round(priceReais * 100) : NaN;

  return listingSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    priceCents,
    condition: formData.get("condition"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    hoursUsed: formData.get("hoursUsed") || undefined,
    mileageKm: formData.get("mileageKm") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    whatsapp: String(formData.get("whatsapp") ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""),
  });
}

export type ParsedListing = NonNullable<ReturnType<typeof parseListingForm>["data"]>;

/** Campos da tabela listings a partir do formulário validado. */
export function listingFields(data: ParsedListing) {
  return {
    title: data.title,
    category_id: data.categoryId,
    description: data.description,
    price_cents: data.priceCents,
    condition: data.condition,
    brand: data.brand || null,
    model: data.model || null,
    year: data.year ?? null,
    hours_used: data.hoursUsed ?? null,
    mileage_km: data.mileageKm ?? null,
    city: data.city,
    state: data.state.toUpperCase(),
    whatsapp: data.whatsapp,
  };
}
