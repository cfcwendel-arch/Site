"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSiteSettingsAction } from "./actions";
import type { ActionState } from "@/app/actions/auth";
import type { Tables } from "@/lib/supabase/types";

export function SettingsForm({ settings }: { settings: Tables<"site_settings"> | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, {} as ActionState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="commissionPercent">Comissão de referência (%)</Label>
        <Input
          id="commissionPercent"
          name="commissionPercent"
          type="number"
          min={0}
          max={100}
          step="0.1"
          defaultValue={settings?.commission_percent ?? 10}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Valor informativo interno (a receita real vem das assinaturas dos planos).
        </p>
      </div>
      <div>
        <Label htmlFor="supportEmail">E-mail de suporte</Label>
        <Input id="supportEmail" name="supportEmail" type="email" defaultValue={settings?.support_email ?? ""} />
      </div>
      <div>
        <Label htmlFor="supportPhone">WhatsApp de suporte (DDD + número)</Label>
        <Input id="supportPhone" name="supportPhone" maxLength={11} defaultValue={settings?.support_phone ?? ""} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Configurações salvas.</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
    </form>
  );
}
