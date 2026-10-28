"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingFields, type Category, type ListingFormDefaults } from "@/components/dashboard/listing-form";
import { uploadListingPhotos } from "@/lib/listing-photos-upload";

const MAX_PHOTOS = 20;

type Picked = { file: File; url: string };

/**
 * Criar anúncio numa tela só: dados + fotos e um botão "Publicar". Antes eram duas etapas
 * (criar e depois, em outra tela, adicionar fotos) e muita gente parava na primeira.
 */
export function NewListingForm({
  categories,
  createAction,
  doneHref,
  submitLabel = "Publicar anúncio",
  defaults,
  children,
}: {
  /** Valores já preenchidos (ex.: WhatsApp e cidade do perfil). */
  defaults?: ListingFormDefaults;
  categories: Category[];
  createAction: (formData: FormData) => Promise<{ error?: string; listingId?: string; uploaderId?: string }>;
  /** Para onde ir depois de publicar; ":id" é trocado pelo id do anúncio. */
  doneHref: string;
  submitLabel?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const busy = status !== null;

  // Libera as prévias da memória quando a tela fecha.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(list)
      .filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name))
      .slice(0, room)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...picked]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function makeCover(index: number) {
    setPhotos((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("Salvando os dados do anúncio...");

    const result = await createAction(new FormData(event.currentTarget));
    if (result.error || !result.listingId || !result.uploaderId) {
      setStatus(null);
      setError(result.error ?? "Não foi possível criar o anúncio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let failed: string[] = [];
    if (photos.length > 0) {
      setStatus(`Enviando fotos: 0 de ${photos.length}...`);
      const res = await uploadListingPhotos({
        listingId: result.listingId,
        uploaderId: result.uploaderId,
        files: photos.map((p) => p.file),
        startPosition: 0,
        onProgress: (done, total) => setStatus(`Enviando fotos: ${done} de ${total}...`),
      });
      failed = res.failed;
    }

    const href = doneHref.replace(":id", result.listingId);
    const sep = href.includes("?") ? "&" : "?";
    router.push(`${href}${sep}publicado=1${failed.length ? `&fotos_falharam=${failed.length}` : ""}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      {children}

      <section>
        <h2 className="text-base font-semibold text-neutral-900">1. Fotos</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Escolha as fotos direto da galeria do celular (pode marcar várias de uma vez). A primeira
          é a capa — toque na ⭐ para trocar.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) antes do envio */}
              <img src={p.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-green-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Capa
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  disabled={busy}
                  className="absolute bottom-1 left-1 rounded-full bg-black/70 p-1.5 text-white"
                  aria-label="Usar como capa"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                disabled={busy}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white"
                aria-label="Remover foto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-green-600/50 bg-green-50 p-2 text-center text-green-800 hover:border-green-600">
              <Camera className="h-7 w-7" />
              <span className="text-xs font-semibold">{photos.length ? "Mais fotos" : "Adicionar fotos"}</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={busy}
                onChange={(e) => addPhotos(e.target.files)}
              />
            </label>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">2. Dados da máquina</h2>
        <ListingFields categories={categories} defaults={defaults} />
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {status ?? submitLabel}
        </Button>
        {busy && <p className="mt-2 text-center text-xs text-neutral-500">Não feche esta tela até terminar.</p>}
      </div>
    </form>
  );
}
