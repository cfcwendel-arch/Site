import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PlanForm } from "@/components/admin/plan-form";
import { DeletePlanButton } from "@/components/admin/delete-plan-button";
import { updatePlanAction } from "@/app/admin/planos/actions";

export const metadata: Metadata = { title: "Editar plano" };

export default async function EditarPlanoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (!plan) notFound();

  const boundUpdate = updatePlanAction.bind(null, id);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-neutral-900">Editar plano</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <PlanForm action={boundUpdate} plan={plan} submitLabel="Salvar alterações" />
      </div>
      <div className="mt-4">
        <DeletePlanButton planId={id} />
      </div>
    </div>
  );
}
