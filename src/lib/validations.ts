import { z } from "zod";

/** Telefone com DDD em qualquer formato: "(65) 99999-9999" vira "65999999999". */
export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""))
  .pipe(z.string().regex(/^\d{10,11}$/, "Informe o WhatsApp com DDD, ex: (65) 99999-9999"));

/** E-mail sem espaços e em minúsculas (o celular costuma pôr maiúscula na primeira letra). */
const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido").max(255);

// Cadastro simples a pedido do cliente: senha com no mínimo 6 caracteres, sem exigências extras.
export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome").max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(72),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha"),
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Título muito curto").max(140),
  categoryId: z.string().uuid("Selecione uma categoria"),
  description: z.string().trim().min(20, "Descreva melhor o item (mín. 20 caracteres)").max(4000),
  priceCents: z.coerce.number().int().min(0, "Preço inválido").max(999_999_999),
  condition: z.enum(["novo", "usado"]),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  model: z.string().trim().max(80).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  hoursUsed: z.coerce.number().int().min(0).max(1_000_000).optional(),
  mileageKm: z.coerce.number().int().min(0).max(10_000_000).optional(),
  city: z.string().trim().min(2, "Informe a cidade").max(120),
  state: z.string().trim().length(2, "Use a sigla do estado (ex: SP)"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um WhatsApp válido com DDD (ex: 65 99999-9999)"),
});

export const leadSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  phone: z.literal("").or(phoneSchema).optional(),
  message: z.string().trim().min(5, "Escreva uma mensagem").max(2000),
  // Honeypot field: real users never fill this; bots that auto-fill every input do.
  website: z.string().max(0, "").optional().or(z.literal("")),
});

export const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  priceCents: z.coerce.number().int().min(0).max(999_999_999),
  billingInterval: z.enum(["monthly", "yearly"]),
  maxListings: z.coerce.number().int().min(1).max(10_000),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: phoneSchema,
  document: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
});
