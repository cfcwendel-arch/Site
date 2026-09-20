import Link from "next/link";
import type { Metadata } from "next";
import { CadastroForm } from "./cadastro-form";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Criar conta de anunciante</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-green-700 hover:underline">
          Entrar
        </Link>
      </p>

      <CadastroForm plano={params.plano} />

      <p className="mt-6 text-center text-xs text-neutral-500">
        Ao criar sua conta você concorda com os{" "}
        <Link href="/termos" className="underline">Termos de uso</Link> e a{" "}
        <Link href="/privacidade" className="underline">Política de privacidade</Link>.
      </p>
    </div>
  );
}
