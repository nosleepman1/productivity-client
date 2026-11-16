import { z } from "zod";

const utf8ByteLength = (value: string) => new TextEncoder().encode(value).length;

const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email est requis")
  .email("L'email doit être valide");

const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Le code doit contenir exactement 6 chiffres");

export const strongPasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .refine(
    (val) => utf8ByteLength(val) <= 72,
    "Le mot de passe doit contenir au plus 72 octets",
  )
  .refine(
    (val) => /[a-z]/.test(val),
    "Le mot de passe doit contenir au moins une minuscule",
  )
  .refine(
    (val) => /[A-Z]/.test(val),
    "Le mot de passe doit contenir au moins une majuscule",
  )
  .refine(
    (val) => /\d/.test(val),
    "Le mot de passe doit contenir au moins un chiffre",
  )
  .refine(
    (val) => /[^A-Za-z0-9]/.test(val),
    "Le mot de passe doit contenir au moins un caractère spécial",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  email: emailSchema,
  password: strongPasswordSchema,
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  nouveauMotDePasse: strongPasswordSchema,
});

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function extractFieldErrors<T extends string>(
  error: z.ZodError,
): FieldErrors<T> {
  const result: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as T | undefined;
    if (key && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
