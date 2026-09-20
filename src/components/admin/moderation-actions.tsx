"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveListingAction, rejectListingAction, adminDeleteListingAction } from "@/app/admin/anuncios/actions";

export function ModerationActions({ listingId, status }: { listingId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    startTransition(async () => {
      try {
        await approveListingAction(listingId);
        toast.success("Anúncio aprovado.");
      } catch {
        toast.error("Erro ao aprovar.");
      }
    });
  }

  function reject() {
    startTransition(async () => {
      try {
        await rejectListingAction(listingId, reason);
        toast.success("Anúncio recusado.");
        setShowReject(false);
      } catch {
        toast.error("Erro ao recusar.");
      }
    });
  }

  function remove() {
    if (!confirm("Excluir este anúncio permanentemente?")) return;
    startTransition(async () => {
      await adminDeleteListingAction(listingId);
      toast.success("Anúncio excluído.");
    });
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da recusa"
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" disabled={isPending} onClick={reject}>Confirmar recusa</Button>
          <Button size="sm" variant="outline" onClick={() => setShowReject(false)}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <Button size="sm" disabled={isPending} onClick={approve}>Aprovar</Button>
      )}
      {status !== "rejected" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setShowReject(true)}>Recusar</Button>
      )}
      <Button size="sm" variant="destructive" disabled={isPending} onClick={remove}>Excluir</Button>
    </div>
  );
}
