import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre" };

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900">Sobre a AgroNegocia</h1>
      <div className="prose prose-neutral mt-6 max-w-none text-neutral-700">
        <p>
          A AgroNegocia é um marketplace especializado na compra e venda de máquinas agrícolas e
          veículos automotivos para o agronegócio: tratores, colheitadeiras, implementos,
          pulverizadores, caminhões e muito mais.
        </p>
        <p>
          Conectamos anunciantes — revendas, concessionárias e produtores — a compradores de todo
          o Brasil. A AgroNegocia atua como plataforma intermediadora: oferecemos o espaço, a
          visibilidade e as ferramentas para o anúncio, mas a negociação e a venda acontecem
          diretamente entre comprador e vendedor.
        </p>
        <p>
          Anunciantes assinam um dos nossos planos para publicar seus anúncios na plataforma.
          Quanto maior o plano, mais anúncios simultâneos e mais visibilidade.
        </p>
      </div>
    </div>
  );
}
