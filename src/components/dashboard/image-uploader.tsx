"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadListingPhotos } from "@/lib/listing-photos-upload";
import { listingImageUrl } from "@/lib/storage";
import { deleteListingImageAction } from "@/app/painel/anuncios/actions";

const MAX_FILES = 20;

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
  const [progress, setProgress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isUploading = progress !== null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_FILES - images.length);
    if (files.length === 0) {
      toast.error(`Máximo de ${MAX_FILES} fotos por anúncio.`);
      return;
    }

    setProgress(`Enviando 0 de ${files.length}...`);
    const startPosition = images.reduce((max, img) => Math.max(max, img.position + 1), 0);
    const { uploaded, failed } = await uploadListingPhotos({
      listingId,
      uploaderId: userId,
      files,
      startPosition,
      onProgress: (done, total) => setProgress(`Enviando ${done} de ${total}...`),
    });
    setImages((prev) => [...prev, ...uploaded]);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (uploaded.length) toast.success(`${uploaded.length} foto(s) adicionada(s).`);
    if (failed.length) toast.error(`Não foi possível enviar: ${failed.join(", ")}`);
    router.refresh();
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
        {[...images].sort((a, b) => a.position - b.position).map((image, index) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200">
            <Image src={listingImageUrl(image.path)} alt="Foto do anúncio" fill sizes="150px" className="object-cover" />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-green-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Capa
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(image)}
              disabled={isPending}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white"
              aria-label="Remover foto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-green-600/50 bg-green-50 p-2 text-center text-green-800 hover:border-green-600">
          <Upload className="h-6 w-6" />
          <span className="text-xs font-semibold">{progress ?? "Adicionar fotos"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Pode escolher várias fotos de uma vez, direto da galeria do celular (até {MAX_FILES}). A
        primeira foto é a capa do anúncio. As fotos são reduzidas automaticamente.
      </p>
    </div>
  );
}
