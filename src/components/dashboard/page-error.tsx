"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Erro dentro do painel/admin: mantém o menu na tela e oferece recarregar só esta parte. */
export function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md rounded-lg border border-neutral-200 bg-white p-6">
      <h1 className="text-lg font-bold text-neutral-900">Não foi possível carregar esta página</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Pode ter sido uma falha rápida de conexão. Tente de novo; se continuar, atualize a página
        (Ctrl+F5 no computador).
      </p>
      <div className="mt-4 flex gap-3">
        <Button
          onClick={() => {
            router.refresh();
            reset();
          }}
        >
          Tentar de novo
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Atualizar página
        </Button>
      </div>
    </div>
  );
}
