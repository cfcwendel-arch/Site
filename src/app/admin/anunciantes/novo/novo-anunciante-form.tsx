"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAdvertiserAction } from "@/app/admin/anunciantes/actions";
import type { ActionState } from "@/app/actions/auth";

const initialState: ActionState = {};

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function NovoAnuncianteForm() {
  const [state, formAction, isPending] = useActionState(createAdvertiserAction, initialState);
  const [password, setPassword] = useState(generatePassword);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" name="fullName" required maxLength={120} />
      </div>
      <div>
        <Label htmlFor="companyName">Empresa (opcional)</Label>
        <Input id="companyName" name="companyName" maxLength={120} />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required maxLength={255} />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp (DDD + número)</Label>
        <Input id="phone" name="phone" required placeholder="11999999999" maxLength={11} />
      </div>
      <div>
        <Label htmlFor="password">Senha inicial</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>
            Gerar
          </Button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Anote e repasse ao anunciante — ele pode trocar depois em &quot;Esqueci minha senha&quot;.
        </p>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar anunciante"}
      </Button>
    </form>
  );
}
