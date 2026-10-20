import { createClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/components/site/whatsapp-icon";

// WhatsApp do Wendel; o telefone de Admin → Configurações, quando preenchido, tem prioridade.
const DEFAULT_SUPPORT_WHATSAPP = "6599827374";

/** Link do WhatsApp da AgroNegocia (usado no topo do site e no pagamento via Pix). */
export async function getSupportWhatsappLink(message: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("support_phone").maybeSingle();
    return whatsappLink(data?.support_phone || DEFAULT_SUPPORT_WHATSAPP, message);
  } catch {
    return whatsappLink(DEFAULT_SUPPORT_WHATSAPP, message);
  }
}
