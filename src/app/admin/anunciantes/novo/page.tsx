import type { Metadata } from "next";
import { NovoAnuncianteForm } from "./novo-anunciante-form";

export const metadata: Metadata = { title: "Novo anunciante" };

export default function NovoAnuncianteAdminPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-neutral-900">Novo anunciante</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Cria a conta direto, já com e-mail confirmado (o anunciante não precisa passar pelo
        cadastro público).
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <NovoAnuncianteForm />
      </div>
    </div>
  );
}
