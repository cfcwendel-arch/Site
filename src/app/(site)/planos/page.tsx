import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Planos para anunciantes" };

export default async function PlanosPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("position");

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Planos para anunciantes</h1>
        <p className="mt-3 text-neutral-600">
          Escolha o plano ideal para o seu volume de máquinas e veículos. Sem contrato de
          fidelidade, cancele quando quiser.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {(plans ?? []).map((plan, index) => {
          const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
          const highlighted = index === 1;
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-xl border p-6",
                highlighted ? "border-green-700 shadow-lg ring-1 ring-green-700" : "border-neutral-200",
              )}
            >
              {highlighted && (
                <span className="mb-3 w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  Mais popular
                </span>
              )}
              <h2 className="text-lg font-bold text-neutral-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
              <p className="mt-4 text-3xl font-bold text-neutral-900">
                {formatBRL(plan.price_cents)}
                <span className="text-sm font-normal text-neutral-500">/mês</span>
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Até {plan.max_listings} anúncios ativos
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/cadastro?plano=${plan.slug}`}
                className={cn(buttonVariants({ variant: highlighted ? "default" : "outline" }), "mt-6")}
              >
                Assinar {plan.name}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-medium text-green-700 hover:underline">
          Entrar e assinar
        </Link>
      </p>
    </div>
  );
}
