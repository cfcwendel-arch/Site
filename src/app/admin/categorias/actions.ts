"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;

  if (name.length < 2) return { error: "Informe um nome válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), icon });
  if (error) return { error: "Não foi possível criar a categoria." };

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error("Não foi possível excluir (pode haver anúncios nesta categoria).");
  revalidatePath("/admin/categorias");
}
