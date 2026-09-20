import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoryCreateForm } from "@/components/admin/category-create-form";
import { CategoryList } from "@/components/admin/category-list";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("position");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-neutral-900">Categorias</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <CategoryCreateForm />
      </div>
      <div className="mt-6">
        <CategoryList categories={categories ?? []} />
      </div>
    </div>
  );
}
