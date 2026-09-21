"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteAdvertiserAction } from "@/app/admin/anunciantes/actions";

export function AdvertiserDeleteButton({ profileId, name }: { profileId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (
      !confirm(
        `Remover permanentemente "${name}"? Isso apaga a conta, os anúncios e o histórico de assinatura. Não pode ser desfeito.`,
      )
    )
      return;

    startTransition(async () => {
      try {
        await deleteAdvertiserAction(profileId);
        toast.success("Anunciante removido.");
        router.push("/admin/anunciantes");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível remover o anunciante.");
      }
    });
  }

  return (
    <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
      Remover anunciante
    </Button>
  );
}
