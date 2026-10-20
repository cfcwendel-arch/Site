const ERROR_MESSAGES: Record<string, string> = {
  plano_invalido: "Plano inválido.",
  ja_existe: "Você já tem uma assinatura pendente ou ativa.",
  falha_iniciar: "Não foi possível iniciar a assinatura. Tente novamente.",
  cartao_ativo: "Sua assinatura no cartão já renova automaticamente — não é preciso pagar via Pix.",
  teste_usado: "O mês grátis é válido só para a primeira assinatura da conta.",
};

export function subscriptionErrorMessage(code?: string) {
  if (!code) return undefined;
  return ERROR_MESSAGES[code] ?? "Ocorreu um erro. Tente novamente.";
}
