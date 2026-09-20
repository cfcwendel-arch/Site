"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCategoryAction } from "@/app/admin/categorias/actions";
import type { ActionState } from "@/app/actions/auth";

export function CategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(createCategoryAction, {} as ActionState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required maxLength={80} />
      </div>
      <div>
        <Label htmlFor="icon">Ícone (lucide, ex: tractor)</Label>
        <Input id="icon" name="icon" maxLength={40} placeholder="tractor" />
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? "Criando..." : "Adicionar"}</Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
