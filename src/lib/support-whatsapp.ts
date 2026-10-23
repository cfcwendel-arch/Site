import { whatsappLink } from "@/components/site/whatsapp-icon";
import { getPublicSettings } from "@/lib/site-data";

// WhatsApp do Wendel; o telefone de Admin → Configurações, quando preenchido, tem prioridade.
const DEFAULT_SUPPORT_WHATSAPP = "65999827374";

/** Link do WhatsApp da AgroNegocia (usado no topo do site e no pagamento via Pix). */
export async function getSupportWhatsappLink(message: string) {
  try {
    const settings = await getPublicSettings();
    return whatsappLink(settings?.support_phone || DEFAULT_SUPPORT_WHATSAPP, message);
  } catch {
    return whatsappLink(DEFAULT_SUPPORT_WHATSAPP, message);
  }
}
