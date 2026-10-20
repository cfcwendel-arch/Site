import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_TAGS } from "@/lib/public-cache";

export const getActivePlans = unstable_cache(
  async () => {
    const { data } = await createPublicClient().from("plans").select("*").eq("active", true).order("position");
    return data ?? [];
  },
  ["active-plans"],
  { tags: [PUBLIC_TAGS.plans], revalidate: 300 },
);

export const getPublicSettings = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("site_settings")
      .select("support_email, support_phone")
      .maybeSingle();
    return data;
  },
  ["public-settings"],
  { tags: [PUBLIC_TAGS.settings], revalidate: 300 },
);
