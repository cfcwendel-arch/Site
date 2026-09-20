"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePlanAction } from "@/app/admin/planos/actions";

export function DeletePlanButton({ planId }: { planId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Excluir este plano? Só é possível se não houver assinaturas vinculadas.")) return;
    startTransition(async () => {
      try {
        await deletePlanAction(planId);
        toast.success("Plano excluído.");
        router.push("/admin/planos");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir plano.");
      }
    });
  }

  return (
    <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
      Excluir plano
    </Button>
  );
}
