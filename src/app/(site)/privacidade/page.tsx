import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900">Política de privacidade</h1>
      <div className="prose prose-neutral mt-6 max-w-none space-y-4 text-neutral-700">
        <p>
          Coletamos os dados que você informa ao criar sua conta (nome, e-mail, telefone,
          empresa), os dados dos anúncios que você publica e as mensagens de contato enviadas por
          compradores interessados, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <p>
          Seus dados de contato são exibidos publicamente apenas quando você opta por incluí-los
          em um anúncio (ex: WhatsApp). Mensagens de compradores são enviadas apenas para o
          anunciante do item e para a equipe da AgroNegocia.
        </p>
        <p>
          Não vendemos seus dados pessoais a terceiros. Dados de pagamento das assinaturas são
          processados diretamente pelo Mercado Pago e não são armazenados em nossos servidores.
        </p>
        <p>
          Você pode solicitar a exclusão da sua conta e dos seus dados a qualquer momento pelos
          canais de contato disponíveis no site.
        </p>
      </div>
    </div>
  );
}
