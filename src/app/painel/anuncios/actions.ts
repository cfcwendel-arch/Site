"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

function parseListingForm(formData: FormData) {
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
    whatsapp: formData.get("whatsapp"),
  });
}

export async function createListingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseListingForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 8)}`;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      advertiser_id: user.id,
      title: parsed.data.title,
      slug,
      category_id: parsed.data.categoryId,
      description: parsed.data.description,
      price_cents: parsed.data.priceCents,
      condition: parsed.data.condition,
      brand: parsed.data.brand || null,
      model: parsed.data.model || null,
      year: parsed.data.year ?? null,
      hours_used: parsed.data.hoursUsed ?? null,
      mileage_km: parsed.data.mileageKm ?? null,
      city: parsed.data.city,
      state: parsed.data.state.toUpperCase(),
      whatsapp: parsed.data.whatsapp,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("no_active_subscription")) {
      return { error: "Você precisa de uma assinatura ativa para publicar anúncios." };
    }
    if (error.message.includes("plan_limit_reached")) {
      return { error: "Você atingiu o limite de anúncios do seu plano." };
    }
    return { error: "Não foi possível criar o anúncio." };
  }

  revalidatePath("/painel/anuncios");
  redirect(`/painel/anuncios/${listing.id}/editar?created=1`);
}

export async function updateListingAction(
  listingId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseListingForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({
      title: parsed.data.title,
      category_id: parsed.data.categoryId,
      description: parsed.data.description,
      price_cents: parsed.data.priceCents,
      condition: parsed.data.condition,
      brand: parsed.data.brand || null,
      model: parsed.data.model || null,
      year: parsed.data.year ?? null,
      hours_used: parsed.data.hoursUsed ?? null,
      mileage_km: parsed.data.mileageKm ?? null,
      city: parsed.data.city,
      state: parsed.data.state.toUpperCase(),
      whatsapp: parsed.data.whatsapp,
    })
    .eq("id", listingId);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/anuncios");
  revalidatePath(`/painel/anuncios/${listingId}/editar`);
  return { success: true };
}

export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", listingId);
  revalidatePath("/painel/anuncios");
}

export async function setListingStatusAction(listingId: string, status: "paused" | "approved" | "sold") {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  revalidatePath("/painel/anuncios");
  if (error) throw new Error("Não foi possível atualizar o status do anúncio.");
}

export async function deleteListingImageAction(imageId: string, path: string) {
  const supabase = await createClient();
  await supabase.storage.from("listing-images").remove([path]);
  await supabase.from("listing_images").delete().eq("id", imageId);
  revalidatePath("/painel/anuncios");
}
