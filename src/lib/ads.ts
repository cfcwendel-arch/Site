import { createClient } from "@/lib/supabase/server";
import { AD_PLACEMENTS, type Ad, type AdPlacement } from "@/lib/ad-placements";

export * from "@/lib/ad-placements";

/** Banners ativos (e dentro do período de veiculação) de um espaço, na ordem definida pelo admin. */
export async function getActiveAds(placement: AdPlacement): Promise<Ad[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("ads")
      .select("id, title, image_path, link_url")
      .eq("placement", placement)
      .eq("active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("position")
      .order("created_at", { ascending: false })
      .limit(AD_PLACEMENTS[placement].slots);
    return data ?? [];
  } catch {
    // Publicidade nunca pode derrubar a página.
    return [];
  }
}
