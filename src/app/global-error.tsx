"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", padding: "48px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Algo deu errado</h1>
        <p style={{ color: "#666", marginTop: "8px" }}>
          Ocorreu um erro inesperado. Tente novamente em instantes.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "16px",
            padding: "10px 20px",
            background: "#15803d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
