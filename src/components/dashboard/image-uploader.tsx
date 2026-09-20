"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listingImageUrl } from "@/lib/storage";
import { deleteListingImageAction } from "@/app/painel/anuncios/actions";

const MAX_FILES = 12;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ListingImage = { id: string; path: string; position: number };

export function ImageUploader({
  listingId,
  userId,
  initialImages,
}: {
  listingId: string;
  userId: string;
  initialImages: ListingImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > MAX_FILES) {
      toast.error(`Máximo de ${MAX_FILES} fotos por anúncio.`);
      return;
    }

    setIsUploading(true);
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`Arquivo muito grande (máx. 5MB): ${file.name}`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${userId}/${listingId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        toast.error(`Falha ao enviar ${file.name}`);
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("listing_images")
        .insert({ listing_id: listingId, path, position: images.length })
        .select("id, path, position")
        .single();

      if (insertError || !inserted) {
        toast.error(`Falha ao registrar ${file.name}`);
        continue;
      }

      setImages((prev) => [...prev, inserted]);
    }
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(image: ListingImage) {
    startTransition(async () => {
      await deleteListingImageAction(image.id, image.path);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200">
            <Image src={listingImageUrl(image.path)} alt="Foto do anúncio" fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(image)}
              disabled={isPending}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover foto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 text-neutral-500 hover:border-green-600 hover:text-green-700">
          <Upload className="h-5 w-5" />
          <span className="text-xs">{isUploading ? "Enviando..." : "Adicionar"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-neutral-500">JPG, PNG ou WebP, até 5MB cada, máx. {MAX_FILES} fotos.</p>
    </div>
  );
}
