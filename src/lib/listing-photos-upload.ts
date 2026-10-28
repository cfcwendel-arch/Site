"use client";

import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

export type UploadedPhoto = { id: string; path: string; position: number };

/**
 * Envia as fotos de um anúncio, uma por vez e na ordem escolhida (a primeira é a capa):
 * reduz no aparelho, sobe para o Storage e registra em listing_images com a posição certa.
 * Antes a posição era calculada de um estado antigo e todas ficavam na posição 0.
 */
export async function uploadListingPhotos({
  listingId,
  uploaderId,
  files,
  startPosition,
  onProgress,
}: {
  listingId: string;
  /** Pasta no Storage: precisa ser o id de quem está logado (regra do bucket). */
  uploaderId: string;
  files: File[];
  startPosition: number;
  onProgress?: (done: number, total: number) => void;
}) {
  const supabase = createClient();
  const uploaded: UploadedPhoto[] = [];
  const failed: string[] = [];

  for (const [index, file] of files.entries()) {
    try {
      const blob = await compressImage(file);
      const path = `${uploaderId}/${listingId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, blob, { cacheControl: "31536000", upsert: false, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("listing_images")
        .insert({ listing_id: listingId, path, position: startPosition + uploaded.length })
        .select("id, path, position")
        .single();
      if (error || !data) throw error ?? new Error("insert");
      uploaded.push(data);
    } catch (err) {
      failed.push(err instanceof Error && err.message.startsWith("Não foi possível") ? err.message : file.name);
    }
    onProgress?.(index + 1, files.length);
  }

  return { uploaded, failed };
}
