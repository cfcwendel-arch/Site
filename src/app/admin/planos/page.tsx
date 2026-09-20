import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Planos" };

export default async function AdminPlanosPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("plans").select("*").order("position");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Planos</h1>
        <Link href="/admin/planos/novo" className={buttonVariants()}>Novo plano</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(plans ?? []).map((plan) => (
          <div key={plan.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">{plan.name}</h2>
              <Badge variant={plan.active ? "default" : "secondary"}>{plan.active ? "Ativo" : "Inativo"}</Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{formatBRL(plan.price_cents)}/mês · {plan.max_listings} anúncios</p>
            <Link href={`/admin/planos/${plan.id}/editar`} className="mt-3 inline-block text-sm font-medium text-green-700 hover:underline">
              Editar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
