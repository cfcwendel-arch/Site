"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/categorias/actions";
import type { Tables } from "@/lib/supabase/types";

export function CategoryList({ categories }: { categories: Tables<"categories">[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria?")) return;
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
        toast.success("Categoria excluída.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
      }
    });
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {categories.map((category) => (
        <li key={category.id} className="flex items-center justify-between px-4 py-3">
          <span>{category.name}</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDelete(category.id)}
            className="text-neutral-400 hover:text-red-600"
            aria-label={`Excluir ${category.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
