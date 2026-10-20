"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmPixPaymentAction } from "@/app/admin/anunciantes/actions";

export function ConfirmPixButton({ subscriptionId, planLabel }: { subscriptionId: string; planLabel: string }) {
  const [isPending, startTransition] = useTransition();

  function confirmPayment() {
    if (!confirm(`Confirmar o recebimento do Pix (${planLabel}) e liberar 1 mês?`)) return;
    startTransition(async () => {
      try {
        await confirmPixPaymentAction(subscriptionId);
        toast.success("Pix confirmado. Plano liberado por 1 mês.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível confirmar.");
      }
    });
  }

  return (
    <Button type="button" size="sm" disabled={isPending} onClick={confirmPayment}>
      {isPending ? "Confirmando..." : "Confirmar Pix recebido (+1 mês)"}
    </Button>
  );
}
