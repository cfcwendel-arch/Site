"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { planSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

function parsePlanForm(formData: FormData) {
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    priceCents: Math.round(Number(formData.get("priceReais") ?? 0) * 100),
    billingInterval: formData.get("billingInterval"),
    maxListings: formData.get("maxListings"),
    description: formData.get("description"),
    active: formData.get("active") === "on",
  });

  return { parsed, features };
}

export async function createPlanAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { parsed, features } = parsePlanForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const slug = `${slugify(parsed.data.name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("plans").insert({
    name: parsed.data.name,
    slug,
    price_cents: parsed.data.priceCents,
    billing_interval: parsed.data.billingInterval,
    max_listings: parsed.data.maxListings,
    description: parsed.data.description || null,
    features,
    active: parsed.data.active,
  });

  if (error) return { error: "Não foi possível criar o plano." };

  revalidatePath("/admin/planos");
  redirect("/admin/planos");
}

export async function updatePlanAction(planId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { parsed, features } = parsePlanForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("plans")
    .update({
      name: parsed.data.name,
      price_cents: parsed.data.priceCents,
      billing_interval: parsed.data.billingInterval,
      max_listings: parsed.data.maxListings,
      description: parsed.data.description || null,
      features,
      active: parsed.data.active,
    })
    .eq("id", planId);

  if (error) return { error: "Não foi possível salvar o plano." };

  revalidatePath("/admin/planos");
  return { success: true };
}

export async function deletePlanAction(planId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw new Error("Não foi possível excluir o plano (pode haver assinaturas vinculadas).");
  revalidatePath("/admin/planos");
}
