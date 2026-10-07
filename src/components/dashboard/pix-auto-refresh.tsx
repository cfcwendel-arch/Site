"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Recarrega a tela do Pix periodicamente para mostrar a confirmação assim que o pagamento cair. */
export function PixAutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
