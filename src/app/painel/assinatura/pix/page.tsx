import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PIX_RECEIVER, pixCopiaECola } from "@/lib/pix-static";
import { getSupportWhatsappLink } from "@/lib/support-whatsapp";
import { formatBRL } from "@/lib/utils";
import { CopyButton } from "@/components/dashboard/copy-button";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pagamento via Pix" };

export default async function PixPage({ searchParams }: { searchParams: Promise<{ assinatura?: string }> }) {
  const { assinatura } = await searchParams;
  if (!assinatura) notFound();

  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase.from("subscriptions").select("id, status, plans(name, price_cents)").eq("id", assinatura).maybeSingle(),
    supabase.from("profiles").select("full_name, company_name, email").eq("id", user?.id ?? "").maybeSingle(),
  ]);
  const plan = subscription?.plans;
  if (!subscription || !plan) notFound();

  const code = pixCopiaECola(plan.price_cents, `AGRO${subscription.id.replace(/-/g, "").slice(0, 12)}`);
  const qr = await QRCode.toDataURL(code, { margin: 1, width: 280, errorCorrectionLevel: "M" });

  const name = profile?.company_name || profile?.full_name;
  const whatsapp = await getSupportWhatsappLink(
    [
      `Olá! Fiz o Pix do plano ${plan.name} (${formatBRL(plan.price_cents)}) no AgroNegocia. Segue o comprovante.`,
      name ? `Nome: ${name}` : null,
      `E-mail do cadastro: ${profile?.email ?? user?.email ?? ""}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return (
    <div className="max-w-lg">
      <Link href="/painel/assinatura" className="text-sm text-green-700 hover:underline">
        ← Voltar para assinatura
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">Pagar com Pix</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Plano {plan.name} · 1 mês · <strong className="text-neutral-900">{formatBRL(plan.price_cents)}</strong>
      </p>

      <div className="mt-6 space-y-6 rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
        <ol className="space-y-1 text-sm text-neutral-700">
          <li>1. Abra o app do seu banco e escolha <strong>Pix</strong>.</li>
          <li>2. Escaneie o QR Code ou use o <strong>Pix Copia e Cola</strong> (o valor já vem preenchido).</li>
          <li>3. Depois de pagar, envie o comprovante no WhatsApp. Seu plano é liberado assim que conferirmos.</li>
        </ol>

        {/* eslint-disable-next-line @next/next/no-img-element -- QR Code gerado aqui mesmo, em data: URI */}
        <img src={qr} alt="QR Code Pix" width={240} height={240} className="mx-auto h-60 w-60" />

        <div>
          <p className="text-sm font-medium text-neutral-800">Pix Copia e Cola</p>
          <p className="mt-1 break-all rounded-md border border-neutral-200 bg-neutral-50 p-2 font-mono text-xs text-neutral-700">
            {code}
          </p>
          <div className="mt-2">
            <CopyButton value={code} label="Copiar código Pix" />
          </div>
        </div>

        <div className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">
          Prefere digitar a chave? <strong>Chave Pix (celular):</strong> {PIX_RECEIVER.keyLabel}
          <br />
          Valor: <strong>{formatBRL(plan.price_cents)}</strong>
        </div>

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", className: "w-full gap-2" })}
          >
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Enviar comprovante no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
