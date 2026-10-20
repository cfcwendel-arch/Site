import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

/** Tags do cache de dados públicos (ver src/lib/listings.ts, ads.ts, site-data.ts). */
export const PUBLIC_TAGS = {
  listings: "public:listings",
  categories: "public:categories",
  ads: "public:ads",
  plans: "public:plans",
  settings: "public:settings",
} as const;

/**
 * Depois de qualquer mudança que apareça no site público (moderação, banner, plano,
 * configuração...), descarta o cache para a próxima visita já ver o dado novo.
 */
export function refreshPublicSite(...tags: (keyof typeof PUBLIC_TAGS)[]) {
  const keys = tags.length ? tags : (Object.keys(PUBLIC_TAGS) as (keyof typeof PUBLIC_TAGS)[]);
  for (const key of keys) revalidateTag(PUBLIC_TAGS[key], { expire: 0 });
  revalidatePath("/", "layout");
}
