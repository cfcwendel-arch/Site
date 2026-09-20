import type { Metadata } from "next";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { subscribeToPlanAction, cancelSubscriptionAction } from "./actions";
import { subscriptionErrorMessage } from "./error-messages";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Assinatura" };

const statusLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  active: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
  past_due: "Pagamento pendente",
};

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const errorMessage = subscriptionErrorMessage(erro);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plans }, { data: subscription }] = await Promise.all([
    supabase.from("plans").select("*").eq("active", true).order("position"),
    supabase
      .from("subscriptions")
      .select("*, plans(name, price_cents)")
      .eq("advertiser_id", user!.id)
      .in("status", ["pending", "active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-neutral-900">Assinatura</h1>

      {errorMessage && (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>
      )}

      {subscription && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4">
          <div>
            <p className="font-semibold text-neutral-900">{subscription.plans?.name}</p>
            <p className="text-sm text-neutral-500">
              {formatBRL(subscription.plans?.price_cents ?? 0)}/mês
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={subscription.status === "active" ? "default" : "warning"}>
              {statusLabels[subscription.status] ?? subscription.status}
            </Badge>
            {subscription.status !== "cancelled" && (
              <form action={cancelSubscriptionAction.bind(null, subscription.id)}>
                <Button type="submit" variant="outline" size="sm">
                  Cancelar assinatura
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {!subscription && (
        <>
          <p className="mt-2 text-sm text-neutral-600">
            Escolha um plano para começar a publicar seus anúncios.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {(plans ?? []).map((plan, index) => {
              const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
              const highlighted = index === 1;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-xl border p-6",
                    highlighted ? "border-green-700 ring-1 ring-green-700" : "border-neutral-200",
                  )}
                >
                  <h2 className="text-lg font-bold text-neutral-900">{plan.name}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
                  <p className="mt-4 text-2xl font-bold text-neutral-900">
                    {formatBRL(plan.price_cents)}
                    <span className="text-sm font-normal text-neutral-500">/mês</span>
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">Até {plan.max_listings} anúncios</p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" /> {f}
                      </li>
                    ))}
                  </ul>
                  <form action={subscribeToPlanAction.bind(null, plan.id)} className="mt-4">
                    <Button type="submit" className="w-full" variant={highlighted ? "default" : "outline"}>
                      Assinar plano
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
