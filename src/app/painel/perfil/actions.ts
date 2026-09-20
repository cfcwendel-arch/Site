"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/auth";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    document: formData.get("document"),
    city: formData.get("city"),
    state: formData.get("state"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName || null,
      phone: parsed.data.phone,
      document: parsed.data.document || null,
      city: parsed.data.city || null,
      state: parsed.data.state ? parsed.data.state.toUpperCase() : null,
    })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível salvar seu perfil." };

  revalidatePath("/painel/perfil");
  return { success: true };
}
