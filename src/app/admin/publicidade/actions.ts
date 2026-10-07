"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AD_PLACEMENT_KEYS } from "@/lib/ad-placements";

// Apenas o admin consegue gravar na tabela `ads` e no bucket `ad-images` — reforçado pelo
// RLS no banco. As actions só validam a entrada e repassam.

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v ? new Date(`${v}T00:00:00-03:00`).toISOString() : null));

const adSchema = z.object({
  title: z.string().trim().min(2, "Informe um título.").max(120),
  imagePath: z.string().trim().min(1, "Envie uma imagem."),
  linkUrl: z
    .string()
    .trim()
    .transform((v) => v || null)
    .refine((v) => v === null || /^https?:\/\/\S+$/i.test(v), "O link precisa começar com http:// ou https://"),
  placement: z.enum(AD_PLACEMENT_KEYS as [string, ...string[]]),
  position: z.coerce.number().int().min(0).max(999),
  startsAt: optionalDate,
  endsAt: optionalDate,
});

export type CreateAdInput = z.input<typeof adSchema>;

function revalidateAdPages() {
  revalidatePath("/admin/publicidade");
  revalidatePath("/");
  revalidatePath("/anuncios", "layout");
}

export async function createAdAction(input: CreateAdInput): Promise<{ error?: string }> {
  const parsed = adSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const { title, imagePath, linkUrl, placement, position, startsAt, endsAt } = parsed.data;

  if (startsAt && endsAt && endsAt <= startsAt) {
    return { error: "A data de término precisa ser depois da data de início." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ads").insert({
    title,
    image_path: imagePath,
    link_url: linkUrl,
    placement,
    position,
    starts_at: startsAt,
    ends_at: endsAt,
  });
  if (error) return { error: "Não foi possível salvar o banner." };

  revalidateAdPages();
  return {};
}

export async function toggleAdAction(adId: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("ads").update({ active }).eq("id", adId);
  if (error) throw new Error("Não foi possível atualizar o banner.");
  revalidateAdPages();
}

export async function updateAdPositionAction(adId: string, position: number) {
  if (!Number.isInteger(position) || position < 0 || position > 999) {
    throw new Error("Posição inválida.");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("ads").update({ position }).eq("id", adId);
  if (error) throw new Error("Não foi possível atualizar a posição.");
  revalidateAdPages();
}

export async function deleteAdAction(adId: string) {
  const supabase = await createClient();
  const { data: ad, error } = await supabase.from("ads").delete().eq("id", adId).select("image_path").maybeSingle();
  if (error || !ad) throw new Error("Não foi possível excluir o banner.");
  await supabase.storage.from("ad-images").remove([ad.image_path]);
  revalidateAdPages();
}

/** Limpa uma imagem enviada cujo cadastro falhou. */
export async function discardAdImageAction(path: string) {
  const supabase = await createClient();
  await supabase.storage.from("ad-images").remove([path]);
}
