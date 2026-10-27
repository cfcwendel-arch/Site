import "server-only";

/**
 * Pix estático (padrão BR Code do Banco Central): gera o "Pix Copia e Cola" com a chave do
 * Wendel e o valor do plano, sem gateway nem integração. O QR Code é o mesmo texto.
 * Nome e cidade só aparecem como informação; o app do banco mostra o titular da chave.
 */
export const PIX_RECEIVER = {
  key: "+5565999827374", // chave Pix (celular) do Wendel
  name: "WENDEL RODRIGUES ARAUJO",
  city: "MATO GROSSO",
  keyLabel: "(65) 99982-7374 (celular)",
} as const;

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** Remove acentos e caracteres fora do padrão do BR Code. */
function clean(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no fim do BR Code. */
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Texto do Pix Copia e Cola para um valor em centavos. `reference` identifica o pedido. */
export function pixCopiaECola(amountCents: number, reference: string) {
  const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", PIX_RECEIVER.key);
  const txid = clean(reference, 25).replace(/ /g, "") || "***";
  const payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", (amountCents / 100).toFixed(2)) +
    field("58", "BR") +
    field("59", clean(PIX_RECEIVER.name, 25)) +
    field("60", clean(PIX_RECEIVER.city, 15)) +
    field("62", field("05", txid)) +
    "6304";
  return payload + crc16(payload);
}
