"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/app/actions/auth";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("not_authorized");
}

export async function setAdvertiserStatusAction(profileId: string, status: "active" | "suspended") {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", profileId);
  if (error) throw new Error("Não foi possível atualizar o anunciante.");
  revalidatePath("/admin/anunciantes");
  revalidatePath(`/admin/anunciantes/${profileId}`);
}

const createAdvertiserSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo").max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um telefone válido com DDD (somente números)"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter um número"),
});

export async function createAdvertiserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = createAdvertiserSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor — não é possível criar contas direto pelo admin ainda.",
    };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName || null,
      phone: parsed.data.phone,
    },
  });

  if (createError || !created.user) {
    const isDuplicate = createError?.message.toLowerCase().includes("already");
    return { error: isDuplicate ? "Este e-mail já está cadastrado." : "Não foi possível criar o anunciante." };
  }

  // The DB trigger creates the profile row with just id/email/role; fill in the rest.
  await admin
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName || null,
      phone: parsed.data.phone,
    })
    .eq("id", created.user.id);

  revalidatePath("/admin/anunciantes");
  redirect(`/admin/anunciantes/${created.user.id}`);
}

export async function deleteAdvertiserAction(profileId: string) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) throw new Error("Não foi possível remover o anunciante.");

  revalidatePath("/admin/anunciantes");
}
