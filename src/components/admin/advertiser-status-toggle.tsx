"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setAdvertiserStatusAction } from "@/app/admin/anunciantes/actions";

export function AdvertiserStatusToggle({ profileId, status }: { profileId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = status === "active" ? "suspended" : "active";
    startTransition(async () => {
      try {
        await setAdvertiserStatusAction(profileId, next);
        toast.success(next === "active" ? "Anunciante reativado." : "Anunciante suspenso.");
      } catch {
        toast.error("Não foi possível atualizar o anunciante.");
      }
    });
  }

  return (
    <Button type="button" variant={status === "active" ? "destructive" : "default"} disabled={isPending} onClick={toggle}>
      {status === "active" ? "Suspender anunciante" : "Reativar anunciante"}
    </Button>
  );
}
