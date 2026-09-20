import Link from "next/link";
import type { Metadata } from "next";
import { EntrarForm } from "./entrar-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; cadastro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Entrar</h1>
      {params.cadastro === "ok" && (
        <p className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Conta criada! Confirme seu e-mail (se solicitado) e faça login para continuar.
        </p>
      )}
      <p className="mt-2 text-sm text-neutral-600">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-green-700 hover:underline">
          Cadastre-se
        </Link>
      </p>

      <EntrarForm redirectTo={params.redirect} />

      <Link href="/recuperar-senha" className="mt-4 text-center text-sm text-neutral-500 hover:text-green-700">
        Esqueci minha senha
      </Link>
    </div>
  );
}
