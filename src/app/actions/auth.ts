"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema, signInSchema, requestPasswordResetSchema, updatePasswordSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

export type ActionState = { error?: string; success?: boolean };

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getClientIp();
  const { success } = rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);
  if (!success) return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        company_name: parsed.data.companyName || null,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/painel`,
    },
  });

  if (error) {
    return { error: error.message.includes("already registered") ? "Este e-mail já está cadastrado." : "Não foi possível criar sua conta." };
  }

  // Persist the extra profile fields (the DB trigger only sets id/email/role on signup).
  const { data: userResult } = await supabase.auth.getUser();
  if (userResult.user) {
    await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        company_name: parsed.data.companyName || null,
        phone: parsed.data.phone,
      })
      .eq("id", userResult.user.id);
  }

  const plano = formData.get("plano");
  redirect(userResult.user ? `/painel${plano ? `?plano=${plano}` : ""}` : "/entrar?cadastro=ok");
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getClientIp();
  const email = String(formData.get("email") ?? "");
  const { success } = rateLimit(`signin:${ip}:${email.toLowerCase()}`, 8, 10 * 60 * 1000);
  if (!success) return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const isUnconfirmed =
      error.code === "email_not_confirmed" || error.message.toLowerCase().includes("not confirmed");
    return {
      error: isUnconfirmed
        ? "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada (e o spam) do e-mail cadastrado."
        : "E-mail ou senha incorretos.",
    };
  }

  const redirectTo = String(formData.get("redirectTo") || "");
  redirect(redirectTo || "/painel");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const { success } = rateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
  if (!success) return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };

  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "E-mail inválido" };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`,
  });

  // Always report success, regardless of whether the e-mail exists, to avoid
  // leaking which addresses are registered.
  return { success: true };
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Não foi possível atualizar a senha. Solicite um novo link." };

  redirect("/painel");
}
