import { z } from "zod";

export const PROFIL_LANGUES = ["fr", "en", "ar", "wo"] as const;
export const PROFIL_THEMES = ["clair", "sombre", "systeme"] as const;

export const updateProfilSchema = z.object({
  telephone: z
    .string()
    .trim()
    .max(30, "Numéro trop long")
    .nullable()
    .optional(),
  langue: z.enum(PROFIL_LANGUES).optional(),
  fuseauHoraire: z.string().trim().min(2).max(60).optional(),
  theme: z.enum(PROFIL_THEMES).optional(),
  notifications: z.boolean().optional(),
  rappelsQuotidiens: z.boolean().optional(),
  biographie: z
    .string()
    .trim()
    .max(500, "La biographie ne peut pas dépasser 500 caractères")
    .nullable()
    .optional(),
});

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>;
