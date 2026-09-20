"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setAdvertiserStatusAction(profileId: string, status: "active" | "suspended") {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", profileId);
  if (error) throw new Error("Não foi possível atualizar o anunciante.");
  revalidatePath("/admin/anunciantes");
  revalidatePath(`/admin/anunciantes/${profileId}`);
}
