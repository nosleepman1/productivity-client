import { z } from "zod";

export const ESPACE_TYPES = ["PERSONAL", "ENTREPRISE", "OTHER"] as const;

export const createEspaceSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(60, "Le nom ne peut pas dépasser 60 caractères"),
  description: z
    .string()
    .trim()
    .max(240, "La description ne peut pas dépasser 240 caractères")
    .optional(),
  type: z.enum(ESPACE_TYPES, {
    message: "Le type d'espace est invalide",
  }),
  couleur: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide")
    .optional(),
  icon: z.string().trim().max(40).optional(),
});

export const updateEspaceSchema = createEspaceSchema.partial();

export type CreateEspaceInput = z.infer<typeof createEspaceSchema>;
export type UpdateEspaceInput = z.infer<typeof updateEspaceSchema>;
