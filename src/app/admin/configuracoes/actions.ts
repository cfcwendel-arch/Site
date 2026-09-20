"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/actions/auth";

export async function updateSiteSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const commissionPercent = Number(formData.get("commissionPercent") ?? 0);
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  const supportPhone = String(formData.get("supportPhone") ?? "").trim();

  if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
    return { error: "Comissão inválida (0 a 100)." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      commission_percent: commissionPercent,
      support_email: supportEmail || null,
      support_phone: supportPhone || null,
    })
    .eq("id", true);

  if (error) return { error: "Não foi possível salvar as configurações." };

  revalidatePath("/admin/configuracoes");
  revalidatePath("/contato");
  return { success: true };
}
