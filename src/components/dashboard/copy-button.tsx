"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o texto continua visível para copiar à mão.
    }
  }

  return (
    <Button type="button" onClick={copy} className="w-full gap-2">
      {copied ? <Check /> : <Copy />}
      {copied ? "Copiado!" : label}
    </Button>
  );
}
