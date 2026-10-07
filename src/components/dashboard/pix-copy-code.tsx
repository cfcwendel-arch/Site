"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PixCopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o usuário ainda pode selecionar o texto.
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-800">Pix Copia e Cola</p>
      <textarea
        readOnly
        value={code}
        rows={3}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-1 w-full resize-none rounded-md border border-neutral-300 bg-neutral-50 p-2 font-mono text-xs text-neutral-700"
      />
      <Button type="button" onClick={handleCopy} className="mt-2 w-full gap-2">
        {copied ? <Check /> : <Copy />}
        {copied ? "Código copiado!" : "Copiar código Pix"}
      </Button>
    </div>
  );
}
