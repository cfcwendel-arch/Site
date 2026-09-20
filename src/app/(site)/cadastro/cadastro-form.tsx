"use client";

import { useActionState } from "react";
import { signUpAction, type ActionState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function CadastroForm({ plano }: { plano?: string }) {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="plano" value={plano ?? ""} />
      <div>
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" name="fullName" required maxLength={120} autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="companyName">Empresa (opcional)</Label>
        <Input id="companyName" name="companyName" maxLength={120} autoComplete="organization" />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp (DDD + número)</Label>
        <Input id="phone" name="phone" required placeholder="11999999999" maxLength={11} autoComplete="tel" />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <p className="mt-1 text-xs text-neutral-500">Mín. 8 caracteres, com maiúscula, minúscula e número.</p>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
