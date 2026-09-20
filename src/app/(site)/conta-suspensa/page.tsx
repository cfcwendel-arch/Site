import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conta suspensa" };

export default function ContaSuspensaPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Sua conta está suspensa</h1>
      <p className="mt-3 text-neutral-600">
        Entre em contato com o suporte da AgroNegocia para entender o motivo e regularizar sua
        conta.
      </p>
    </div>
  );
}
