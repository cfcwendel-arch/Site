/**
 * URL pública de uma foto de anúncio. Caminhos que começam com "/" são arquivos que vêm
 * junto com o site (pasta public/); os demais estão no bucket listing-images do Supabase.
 */
export function listingImageUrl(path: string) {
  if (path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`;
}
