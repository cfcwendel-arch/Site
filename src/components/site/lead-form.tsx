"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitLead } from "@/app/(site)/anuncios/[slug]/actions";

export function LeadForm({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitLead(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSent(true);
      toast.success("Mensagem enviada! O anunciante vai receber seu contato.");
    });
  }

  if (sent) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
        Mensagem enviada com sucesso. O anunciante entrará em contato em breve.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      {/* Honeypot: hidden from real users, filled in by naive bots */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Não preencha</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required maxLength={120} />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp / Telefone</Label>
        <Input id="phone" name="phone" placeholder="11999999999" maxLength={11} />
      </div>
      <div>
        <Label htmlFor="email">E-mail (opcional)</Label>
        <Input id="email" name="email" type="email" maxLength={255} />
      </div>
      <div>
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          defaultValue={`Olá, tenho interesse no anúncio "${listingTitle}".`}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}
