import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Anunciantes" };

export default async function AnunciantesPage() {
  const supabase = await createClient();
  const { data: advertisers } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, email, phone, status, created_at")
    .eq("role", "advertiser")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Anunciantes</h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {(advertisers ?? []).map((advertiser) => (
              <tr key={advertiser.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {advertiser.company_name || advertiser.full_name || "—"}
                </td>
                <td className="px-4 py-3">{advertiser.email}</td>
                <td className="px-4 py-3">{advertiser.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={advertiser.status === "active" ? "default" : "destructive"}>
                    {advertiser.status === "active" ? "Ativo" : "Suspenso"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/anunciantes/${advertiser.id}`} className="font-medium text-green-700 hover:underline">
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(advertisers?.length ?? 0) === 0 && (
          <p className="p-6 text-sm text-neutral-500">Nenhum anunciante cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
