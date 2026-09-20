"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteListingAction, setListingStatusAction } from "@/app/painel/anuncios/actions";

export function ListingActions({ listingId, status }: { listingId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatus(newStatus: "paused" | "approved" | "sold") {
    startTransition(async () => {
      try {
        await setListingStatusAction(listingId, newStatus);
        toast.success("Status atualizado.");
        router.refresh();
      } catch {
        toast.error("Não foi possível atualizar o status.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este anúncio? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deleteListingAction(listingId);
      router.push("/painel/anuncios");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "approved" && (
        <Button type="button" variant="outline" disabled={isPending} onClick={() => handleStatus("paused")}>
          Pausar anúncio
        </Button>
      )}
      {status === "paused" && (
        <Button type="button" variant="outline" disabled={isPending} onClick={() => handleStatus("approved")}>
          Reativar anúncio
        </Button>
      )}
      {(status === "approved" || status === "paused") && (
        <Button type="button" variant="secondary" disabled={isPending} onClick={() => handleStatus("sold")}>
          Marcar como vendido
        </Button>
      )}
      <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
        Excluir anúncio
      </Button>
    </div>
  );
}
