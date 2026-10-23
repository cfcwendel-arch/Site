"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { refreshPublicSite } from "@/lib/public-cache";
import { createClient } from "@/lib/supabase/server";
import { listingFields, parseListingForm } from "@/lib/listing-form-data";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

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
      slug,
      ...listingFields(parsed.data),
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
  refreshPublicSite("listings");
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
    .update(listingFields(parsed.data))
    .eq("id", listingId);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/anuncios");
  refreshPublicSite("listings");
  revalidatePath(`/painel/anuncios/${listingId}/editar`);
  revalidatePath(`/admin/anuncios/${listingId}/editar`);
  return { success: true };
}

export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", listingId);
  revalidatePath("/painel/anuncios");
  refreshPublicSite("listings");
}

export async function setListingStatusAction(listingId: string, status: "paused" | "approved" | "sold") {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  revalidatePath("/painel/anuncios");
  refreshPublicSite("listings");
  if (error) throw new Error("Não foi possível atualizar o status do anúncio.");
}

export async function deleteListingImageAction(imageId: string, path: string) {
  const supabase = await createClient();
  await supabase.storage.from("listing-images").remove([path]);
  await supabase.from("listing_images").delete().eq("id", imageId);
  revalidatePath("/painel/anuncios");
  refreshPublicSite("listings");
}
