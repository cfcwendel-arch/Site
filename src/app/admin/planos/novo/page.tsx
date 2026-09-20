import type { Metadata } from "next";
import { PlanForm } from "@/components/admin/plan-form";
import { createPlanAction } from "@/app/admin/planos/actions";

export const metadata: Metadata = { title: "Novo plano" };

export default function NovoPlanoPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-neutral-900">Novo plano</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <PlanForm action={createPlanAction} submitLabel="Criar plano" />
      </div>
    </div>
  );
}
