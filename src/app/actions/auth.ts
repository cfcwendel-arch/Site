"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
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

  const { email, password } = parsed.data;
  const profileData = {
    full_name: parsed.data.fullName,
    company_name: parsed.data.companyName || null,
    phone: parsed.data.phone,
  };
  const alreadyRegistered = "Este e-mail já está cadastrado. Entre com sua senha ou use “Esqueci minha senha”.";

  // Sem confirmação de e-mail (pedido do cliente): a conta já nasce confirmada e o
  // anunciante entra na hora. Com a chave de serviço, cria pelo Admin API; sem ela, usa o
  // cadastro normal (o gatilho auto_confirm_user no banco confirma a conta).
  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    admin = null;
  }

  const supabase = await createClient();

  if (admin) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: profileData,
    });
    if (error || !created.user) {
      const exists = error?.code === "email_exists" || error?.message.toLowerCase().includes("already");
      return { error: exists ? alreadyRegistered : "Não foi possível criar sua conta. Tente novamente." };
    }
    await admin.from("profiles").update(profileData).eq("id", created.user.id);
  } else {
    const siteUrl = await getSiteUrl();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: profileData, emailRedirectTo: `${siteUrl}/auth/callback?next=/painel` },
    });
    // Falha só no envio do e-mail de confirmação não impede a conta de existir.
    if (error && !error.message.toLowerCase().includes("email")) {
      return {
        error: error.message.toLowerCase().includes("already") ? alreadyRegistered : "Não foi possível criar sua conta.",
      };
    }
  }

  // Entra direto, sem precisar abrir e-mail nenhum.
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect("/entrar?cadastro=ok");

  const plano = formData.get("plano");
  redirect(`/painel/assinatura${plano ? `?plano=${plano}` : ""}`);
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
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) redirect(redirectTo);

  // Admin vai direto para o /admin (antes passava pelo /painel e era redirecionado).
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  redirect(profile?.role === "admin" ? "/admin" : "/painel");
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
  const siteUrl = await getSiteUrl();
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
