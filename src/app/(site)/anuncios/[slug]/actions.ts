"use server";

import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

export async function submitLead(formData: FormData) {
  const ip = await getClientIp();
  const { success } = rateLimit(`lead:${ip}`, 5, 10 * 60 * 1000);
  if (!success) {
    return { error: "Muitas mensagens enviadas. Tente novamente em alguns minutos." };
  }

  const raw = {
    listingId: formData.get("listingId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    website: formData.get("website"), // honeypot
  };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  if (parsed.data.website) {
    // Honeypot triggered — silently succeed so bots don't learn to skip the field.
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    listing_id: parsed.data.listingId,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
  });

  if (error) {
    return { error: "Não foi possível enviar sua mensagem. Tente novamente." };
  }

  return { success: true };
}
