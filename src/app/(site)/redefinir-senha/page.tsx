import type { Metadata } from "next";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function RedefinirSenhaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Definir nova senha</h1>
      <RedefinirSenhaForm />
    </div>
  );
}
