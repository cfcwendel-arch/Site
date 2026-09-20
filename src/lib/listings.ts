import { createClient } from "@/lib/supabase/server";

export type ListingFilters = {
  q?: string;
  category?: string;
  state?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
};

const PAGE_SIZE = 12;

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("position");
  return data ?? [];
}

export async function getApprovedListings(filters: ListingFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("listings")
    .select("*, categories(name, slug), listing_images(path, position)", { count: "exact" })
    .eq("status", "approved");

  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    query = query.eq("category_id", category?.id ?? "00000000-0000-0000-0000-000000000000");
  }
  if (filters.state) query = query.eq("state", filters.state.toUpperCase());
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.minPrice !== undefined) query = query.gte("price_cents", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_cents", filters.maxPrice);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  return { listings: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getFeaturedListings(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, categories(name, slug), listing_images(path, position)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getListingBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "*, categories(name, slug), listing_images(id, path, position), profiles(full_name, company_name, city, state, created_at)",
    )
    .eq("slug", slug)
    .maybeSingle();
  return data;
}
