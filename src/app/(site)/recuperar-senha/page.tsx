import type { Metadata } from "next";
import { RecuperarSenhaForm } from "./recuperar-senha-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Recuperar senha</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>
      <RecuperarSenhaForm />
    </div>
  );
}
