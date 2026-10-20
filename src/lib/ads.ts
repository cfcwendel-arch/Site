import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_TAGS } from "@/lib/public-cache";
import { AD_PLACEMENTS, type Ad, type AdPlacement } from "@/lib/ad-placements";

export * from "@/lib/ad-placements";

/** Banners ativos (e dentro do período de veiculação) de um espaço, na ordem definida pelo admin. */
async function fetchActiveAds(placement: AdPlacement): Promise<Ad[]> {
  try {
    const supabase = createPublicClient();
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

export const getActiveAds = unstable_cache(fetchActiveAds, ["active-ads"], {
  tags: [PUBLIC_TAGS.ads],
  revalidate: 60,
});
