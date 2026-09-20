"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", listingId);
  if (error) throw new Error("Não foi possível aprovar o anúncio.");
  revalidatePath("/admin/anuncios");
}

export async function rejectListingAction(listingId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejection_reason: reason || "Não especificado" })
    .eq("id", listingId);
  if (error) throw new Error("Não foi possível recusar o anúncio.");
  revalidatePath("/admin/anuncios");
}

export async function adminDeleteListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) throw new Error("Não foi possível excluir o anúncio.");
  revalidatePath("/admin/anuncios");
}
