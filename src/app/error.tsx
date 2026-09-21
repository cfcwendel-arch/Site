"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Algo deu errado</h1>
      <p className="max-w-md text-sm text-neutral-600">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente em instantes.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Link href="/" className="text-sm font-medium text-green-700 hover:underline self-center">
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
