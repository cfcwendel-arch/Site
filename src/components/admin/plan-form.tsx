"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/actions/auth";
import type { Tables } from "@/lib/supabase/types";

export function PlanForm({
  action,
  plan,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  plan?: Tables<"plans">;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  const features = Array.isArray(plan?.features) ? (plan.features as string[]) : [];

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do plano</Label>
        <Input id="name" name="name" required defaultValue={plan?.name} maxLength={80} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priceReais">Preço mensal (R$)</Label>
          <Input
            id="priceReais"
            name="priceReais"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={plan ? plan.price_cents / 100 : undefined}
          />
        </div>
        <div>
          <Label htmlFor="maxListings">Máx. de anúncios</Label>
          <Input id="maxListings" name="maxListings" type="number" min={1} required defaultValue={plan?.max_listings} />
        </div>
      </div>
      <div>
        <Label htmlFor="billingInterval">Recorrência</Label>
        <Select id="billingInterval" name="billingInterval" defaultValue={plan?.billing_interval ?? "monthly"}>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Descrição curta</Label>
        <Input id="description" name="description" maxLength={500} defaultValue={plan?.description ?? ""} />
      </div>
      <div>
        <Label htmlFor="features">Recursos (um por linha)</Label>
        <Textarea id="features" name="features" rows={5} defaultValue={features.join("\n")} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" name="active" defaultChecked={plan?.active ?? true} className="h-4 w-4" />
        <Label htmlFor="active">Plano ativo (visível para anunciantes)</Label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Plano salvo com sucesso.</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : submitLabel}</Button>
    </form>
  );
}
