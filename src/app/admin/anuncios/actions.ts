"use server";

import { revalidatePath } from "next/cache";
import { refreshPublicSite } from "@/lib/public-cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listingFields, parseListingForm } from "@/lib/listing-form-data";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

export async function approveListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", listingId);
  if (error) throw new Error("Não foi possível aprovar o anúncio.");
  revalidatePath("/admin/anuncios");
  refreshPublicSite("listings");
}

export async function rejectListingAction(listingId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejection_reason: reason || "Não especificado" })
    .eq("id", listingId);
  if (error) throw new Error("Não foi possível recusar o anúncio.");
  revalidatePath("/admin/anuncios");
  refreshPublicSite("listings");
}

export async function adminDeleteListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) throw new Error("Não foi possível excluir o anúncio.");
  revalidatePath("/admin/anuncios");
  refreshPublicSite("listings");
}

/** Admin publica um anúncio em nome de um anunciante (ou da própria AgroNegocia), já aprovado. */
export async function createListingAsAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const advertiserId = String(formData.get("advertiserId") ?? "");
  if (!advertiserId) return { error: "Escolha o anunciante." };

  const parsed = parseListingForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/admin/anuncios/novo");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return { error: "Apenas o admin pode publicar por aqui." };

  const { data: advertiser } = await supabase.from("profiles").select("id").eq("id", advertiserId).maybeSingle();
  if (!advertiser) return { error: "Anunciante não encontrado." };

  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ advertiser_id: advertiserId, slug, status: "approved", ...listingFields(parsed.data) })
    .select("id")
    .single();
  if (error || !listing) return { error: "Não foi possível criar o anúncio." };

  revalidatePath("/admin/anuncios");
  refreshPublicSite("listings");
  redirect(`/admin/anuncios/${listing.id}/editar?created=1`);
}
