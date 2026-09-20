import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo").max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um telefone válido com DDD (somente números)"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter um número"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter um número"),
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
    .regex(/^\d{10,11}$/, "Informe um WhatsApp válido com DDD (somente números)"),
});

export const leadSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um telefone válido com DDD")
    .optional()
    .or(z.literal("")),
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
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um telefone válido com DDD"),
  document: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
});
