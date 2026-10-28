/**
 * Reduz a foto no próprio aparelho antes de enviar: no máximo 1600 px no lado maior, em
 * JPEG. Fotos de celular passam fácil de 5 MB (limite do armazenamento) e demoram a subir
 * no 4G; reduzidas ficam com ~200–400 KB e a qualidade continua ótima para o anúncio.
 */
const MAX_SIDE = 1600;
const QUALITY = 0.82;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PASSTHROUGH_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Formato que o navegador não abre (ex.: HEIC no Android/Windows): envia como está, se der.
    if (PASSTHROUGH_TYPES.includes(file.type) && file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(`Não foi possível ler a foto "${file.name}". Envie em JPG ou PNG.`);
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu preparar a foto.");
  ctx.fillStyle = "#fff"; // PNG com transparência vira fundo branco no JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob) throw new Error(`Não foi possível preparar a foto "${file.name}".`);
  return blob;
}
