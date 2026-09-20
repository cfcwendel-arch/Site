"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "./actions";
import type { ActionState } from "@/app/actions/auth";
import type { Tables } from "@/lib/supabase/types";

const initialState: ActionState = {};

export function PerfilForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" name="fullName" required defaultValue={profile.full_name ?? ""} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="companyName">Empresa</Label>
        <Input id="companyName" name="companyName" defaultValue={profile.company_name ?? ""} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp</Label>
        <Input id="phone" name="phone" required defaultValue={profile.phone ?? ""} maxLength={11} />
      </div>
      <div>
        <Label htmlFor="document">CPF/CNPJ</Label>
        <Input id="document" name="document" defaultValue={profile.document ?? ""} maxLength={20} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} maxLength={120} />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" defaultValue={profile.state ?? ""} maxLength={2} />
        </div>
      </div>
      <div>
        <Label>E-mail</Label>
        <Input value={profile.email} disabled />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Perfil atualizado com sucesso.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
