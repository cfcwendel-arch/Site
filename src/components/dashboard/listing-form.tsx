"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/actions/auth";

const states = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

type Category = { id: string; name: string };

export type ListingFormDefaults = {
  title?: string;
  categoryId?: string;
  description?: string;
  priceCents?: number;
  condition?: string;
  brand?: string;
  model?: string;
  year?: number | null;
  hoursUsed?: number | null;
  mileageKm?: number | null;
  city?: string;
  state?: string;
  whatsapp?: string;
};

export function ListingForm({
  action,
  categories,
  defaults,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  defaults?: ListingFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Título do anúncio</Label>
          <Input id="title" name="title" required maxLength={140} defaultValue={defaults?.title} />
        </div>

        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select id="categoryId" name="categoryId" required defaultValue={defaults?.categoryId ?? ""}>
            <option value="" disabled>Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="condition">Condição</Label>
          <Select id="condition" name="condition" required defaultValue={defaults?.condition ?? "usado"}>
            <option value="novo">Novo</option>
            <option value="usado">Usado</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="priceReais">Preço (R$)</Label>
          <Input
            id="priceReais"
            name="priceReais"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={defaults?.priceCents !== undefined ? defaults.priceCents / 100 : undefined}
          />
          <p className="mt-1 text-xs text-neutral-500">Informe em reais, ex: 150000.00</p>
        </div>

        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" maxLength={80} defaultValue={defaults?.brand} />
        </div>
        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" name="model" maxLength={80} defaultValue={defaults?.model} />
        </div>
        <div>
          <Label htmlFor="year">Ano</Label>
          <Input id="year" name="year" type="number" min={1900} max={2100} defaultValue={defaults?.year ?? undefined} />
        </div>
        <div>
          <Label htmlFor="hoursUsed">Horas de uso (máquinas)</Label>
          <Input id="hoursUsed" name="hoursUsed" type="number" min={0} defaultValue={defaults?.hoursUsed ?? undefined} />
        </div>
        <div>
          <Label htmlFor="mileageKm">Km rodados (veículos)</Label>
          <Input id="mileageKm" name="mileageKm" type="number" min={0} defaultValue={defaults?.mileageKm ?? undefined} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp (DDD + número)</Label>
          <Input id="whatsapp" name="whatsapp" placeholder="11999999999" maxLength={11} required defaultValue={defaults?.whatsapp} />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" required maxLength={120} defaultValue={defaults?.city} />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Select id="state" name="state" required defaultValue={defaults?.state ?? ""}>
            <option value="" disabled>UF</option>
            {states.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" required maxLength={4000} rows={6} defaultValue={defaults?.description} />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Alterações salvas com sucesso.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
