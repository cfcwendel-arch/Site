/**
 * Espaços de publicidade do site. Cada anúncio publicitário (banner) é cadastrado
 * pelo admin em /admin/publicidade e aparece no espaço escolhido — trocar, incluir ou
 * remover um banner não exige mexer no código.
 */
export const AD_PLACEMENTS = {
  home: { label: "Tela inicial (vitrine de 20 espaços)", slots: 20 },
  listing_side: { label: "Página do produto — ao lado das fotos", slots: 2 },
  listing_inline: { label: "Página do produto — entre as fotos e a descrição", slots: 1 },
  listing_grid: { label: "Lista de anúncios — entre os produtos", slots: 3 },
} as const;

export type AdPlacement = keyof typeof AD_PLACEMENTS;

export const AD_PLACEMENT_KEYS = Object.keys(AD_PLACEMENTS) as AdPlacement[];

export function isAdPlacement(value: string): value is AdPlacement {
  return value in AD_PLACEMENTS;
}

export type Ad = {
  id: string;
  title: string;
  image_path: string;
  link_url: string | null;
};

export function adImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-images/${path}`;
}
