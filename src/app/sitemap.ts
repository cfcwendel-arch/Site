import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "approved")
    .limit(1000);

  const staticRoutes = ["", "/anuncios", "/planos", "/sobre", "/contato", "/termos", "/privacidade"].map(
    (path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() }),
  );

  const listingRoutes = (listings ?? []).map((listing) => ({
    url: `${siteUrl}/anuncios/${listing.slug}`,
    lastModified: new Date(listing.updated_at),
  }));

  return [...staticRoutes, ...listingRoutes];
}
