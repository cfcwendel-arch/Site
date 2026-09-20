const ERROR_MESSAGES: Record<string, string> = {
  plano_invalido: "Plano inválido.",
  ja_existe: "Você já tem uma assinatura pendente ou ativa.",
  falha_iniciar: "Não foi possível iniciar a assinatura. Tente novamente.",
  mp_indisponivel: "Mercado Pago não configurado ou indisponível no momento.",
};

export function subscriptionErrorMessage(code?: string) {
  if (!code) return undefined;
  return ERROR_MESSAGES[code] ?? "Ocorreu um erro. Tente novamente.";
}
