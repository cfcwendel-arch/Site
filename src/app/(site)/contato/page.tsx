import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contato" };

export default async function ContatoPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900">Fale conosco</h1>
      <p className="mt-3 text-neutral-600">
        Dúvidas sobre planos, anúncios ou sua conta? Entre em contato pelos canais abaixo.
      </p>

      <div className="mt-8 space-y-4">
        {settings?.support_email && (
          <a
            href={`mailto:${settings.support_email}`}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:border-green-600"
          >
            <Mail className="h-5 w-5 text-green-700" />
            <span>{settings.support_email}</span>
          </a>
        )}
        {settings?.support_phone && (
          <a
            href={`https://wa.me/55${settings.support_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:border-green-600"
          >
            <Phone className="h-5 w-5 text-green-700" />
            <span>{settings.support_phone}</span>
          </a>
        )}
        {!settings?.support_email && !settings?.support_phone && (
          <p className="text-sm text-neutral-500">
            Canais de atendimento em breve. Configure-os no painel admin em Configurações.
          </p>
        )}
      </div>
    </div>
  );
}
