"use client";

import { useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { adImageUrl } from "@/lib/ad-placements";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteAdAction, toggleAdAction, updateAdPositionAction } from "@/app/admin/publicidade/actions";
import type { Tables } from "@/lib/supabase/types";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : null;
}

export function AdList({ ads, now }: { ads: Tables<"ads">[]; now: number }) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
      }
    });
  }

  if (ads.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        Nenhum banner neste espaço.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {ads.map((ad) => {
        const start = formatDate(ad.starts_at);
        const end = formatDate(ad.ends_at);
        const expired = ad.ends_at !== null && new Date(ad.ends_at).getTime() <= now;
        const scheduled = ad.starts_at !== null && new Date(ad.starts_at).getTime() > now;
        return (
          <li key={ad.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
              <Image src={adImageUrl(ad.image_path)} alt={ad.title} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-900">{ad.title}</span>
                {!ad.active ? (
                  <Badge variant="secondary">Pausado</Badge>
                ) : expired ? (
                  <Badge variant="warning">Vencido</Badge>
                ) : scheduled ? (
                  <Badge variant="outline">Agendado</Badge>
                ) : (
                  <Badge>No ar</Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                {start || end ? `Veiculação: ${start ?? "já"} até ${end ?? "sem data de fim"}` : "Sem prazo definido"}
              </p>
              {ad.link_url && (
                <a
                  href={ad.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-green-700 hover:underline"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" /> {ad.link_url}
                </a>
              )}
            </div>
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                const value = Number(new FormData(e.currentTarget).get("position"));
                run(() => updateAdPositionAction(ad.id, value), "Ordem atualizada.");
              }}
            >
              <Input
                name="position"
                type="number"
                min={0}
                max={999}
                defaultValue={ad.position}
                className="h-8 w-16"
                aria-label="Ordem"
              />
              <Button type="submit" size="sm" variant="ghost" disabled={isPending}>
                Salvar
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => run(() => toggleAdAction(ad.id, !ad.active), ad.active ? "Banner pausado." : "Banner ativado.")}
            >
              {ad.active ? "Pausar" : "Ativar"}
            </Button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!confirm(`Excluir o banner "${ad.title}"?`)) return;
                run(() => deleteAdAction(ad.id), "Banner excluído.");
              }}
              className="text-neutral-400 hover:text-red-600"
              aria-label={`Excluir ${ad.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
