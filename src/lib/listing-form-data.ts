import { listingSchema } from "@/lib/validations";

/** Lê o formulário de anúncio (painel do anunciante e admin). */
export function parseListingForm(formData: FormData) {
  const priceReais = Number(formData.get("priceReais") ?? 0);
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
