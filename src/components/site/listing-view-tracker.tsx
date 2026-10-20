"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Conta a visualização no navegador, já que a página do anúncio sai pronta do cache. */
export function ListingViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    void createClient().rpc("increment_listing_views", { p_listing_id: listingId });
  }, [listingId]);
  return null;
}
