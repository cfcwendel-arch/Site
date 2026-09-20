import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900">Termos de uso</h1>
      <div className="prose prose-neutral mt-6 max-w-none space-y-4 text-neutral-700">
        <p>
          A AgroNegocia é uma plataforma de anúncios classificados que conecta anunciantes de
          máquinas agrícolas e veículos automotivos a potenciais compradores. A AgroNegocia não é
          parte na compra e venda entre usuários, não intermedia pagamentos entre comprador e
          vendedor e não se responsabiliza pelas condições, procedência, estado de conservação ou
          veracidade dos itens anunciados.
        </p>
        <p>
          Para publicar anúncios, o anunciante deve assinar um dos planos disponíveis. A cobrança
          é recorrente (mensal) e processada via Mercado Pago. O acesso à publicação de anúncios
          fica condicionado ao pagamento em dia da assinatura.
        </p>
        <p>
          Todo anúncio publicado passa por moderação e pode ser recusado ou removido pela equipe
          da AgroNegocia caso viole estas condições, contenha informações falsas ou itens não
          permitidos.
        </p>
        <p>
          O anunciante é o único responsável pela veracidade das informações, fotos e condições do
          item anunciado, bem como pelo cumprimento das leis aplicáveis à venda de máquinas e
          veículos.
        </p>
        <p>
          A AgroNegocia pode suspender contas e anúncios que violem estes termos, sem aviso prévio,
          a seu critério.
        </p>
      </div>
    </div>
  );
}
