import { z } from "zod";
import type { CreateTacheDto } from "@/types/productivity";

/**
 * Schéma Zod de validation pour la création ou l'édition d'une tâche.
 * Conforme au `CreateTacheDto` NestJS (`forbidNonWhitelisted: true`).
 */
export const tacheFormSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(1, "Le titre de la tâche est requis")
    .max(150, "Le titre ne peut pas dépasser 150 caractères"),
  description: z
    .string()
    .trim()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional()
    .default(""),
  dateLimite: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date limite est requise (AAAA-MM-JJ)"),
  heureLimite: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide")
    .optional()
    .or(z.literal("")),
  priorite: z
    .enum(["BASSE", "MOYENNE", "HAUTE", "URGENTE"])
    .default("MOYENNE"),
  projetId: z.string().optional().nullable(),
  rappelActif: z.boolean().default(true),
  syncCalendrier: z.boolean().default(false),
  estTerminee: z.boolean().default(false),
});

/** Type inféré des données du formulaire de tâche. */
export type TacheFormValues = z.infer<typeof tacheFormSchema>;

/**
 * Transforme les valeurs validées du formulaire en `CreateTacheDto` strict.
 *
 * @param values - Valeurs validées par `tacheFormSchema`.
 * @returns Payload strict prêt pour l'API.
 */
export function toCreateTacheDto(values: TacheFormValues): CreateTacheDto {
  const isoDate = values.heureLimite
    ? new Date(`${values.dateLimite}T${values.heureLimite}:00`).toISOString()
    : new Date(`${values.dateLimite}T00:00:00.000Z`).toISOString();

  return {
    titre: values.titre.trim(),
    description: (values.description ?? "").trim(),
    dateLimite: isoDate,
    priorite: values.priorite,
    projetId: values.projetId || null,
    rappelActif: values.rappelActif,
    syncCalendrier: values.syncCalendrier,
    estTerminee: values.estTerminee,
  };
}
