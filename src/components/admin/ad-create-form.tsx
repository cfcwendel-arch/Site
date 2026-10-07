"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createAdAction, discardAdImageAction } from "@/app/admin/publicidade/actions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function AdCreateForm({ placements }: { placements: { key: string; label: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) return setError("Envie a imagem do banner.");
    if (!ALLOWED_TYPES.includes(file.type)) return setError("Use JPG, PNG, WebP ou GIF.");
    if (file.size > MAX_SIZE) return setError("Imagem muito grande (máx. 5MB).");

    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) return setError("Falha ao enviar a imagem.");

      const result = await createAdAction({
        title: String(formData.get("title") ?? ""),
        imagePath: path,
        linkUrl: String(formData.get("linkUrl") ?? ""),
        placement: String(formData.get("placement") ?? ""),
        position: String(formData.get("position") ?? "0"),
        startsAt: String(formData.get("startsAt") ?? ""),
        endsAt: String(formData.get("endsAt") ?? ""),
      });

      if (result.error) {
        await discardAdImageAction(path);
        return setError(result.error);
      }

      toast.success("Banner publicado.");
      formRef.current?.reset();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="ad-title">Título / anunciante</Label>
        <Input id="ad-title" name="title" required maxLength={120} placeholder="Ex: Peças Agrícolas Silva" />
      </div>
      <div>
        <Label htmlFor="ad-placement">Onde exibir</Label>
        <Select id="ad-placement" name="placement" defaultValue={placements[0]?.key}>
          {placements.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="ad-position">Ordem (menor aparece primeiro)</Label>
        <Input id="ad-position" name="position" type="number" min={0} max={999} defaultValue={0} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="ad-link">Link ao clicar (opcional)</Label>
        <Input id="ad-link" name="linkUrl" type="url" placeholder="https://site-do-anunciante.com.br ou https://wa.me/55..." />
      </div>
      <div>
        <Label htmlFor="ad-start">Início (opcional)</Label>
        <Input id="ad-start" name="startsAt" type="date" />
      </div>
      <div>
        <Label htmlFor="ad-end">Fim (opcional)</Label>
        <Input id="ad-end" name="endsAt" type="date" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="ad-image">Imagem</Label>
        <Input id="ad-image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
        <p className="mt-1 text-xs text-neutral-500">
          Tamanhos sugeridos: vitrine e lista 800×600 · lateral 600×600 · faixa entre fotos 1200×200. Até 5MB.
        </p>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Publicar banner"}</Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
