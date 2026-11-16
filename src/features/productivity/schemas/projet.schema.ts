import { z } from "zod";
import type { CreateProjetDto } from "@/types/productivity";

/**
 * Schéma Zod de validation pour la création ou l'édition d'un projet.
 * Conforme au `CreateProjetDto` NestJS (`forbidNonWhitelisted: true`).
 */
export const projetFormSchema = z
  .object({
    titre: z
      .string()
      .trim()
      .min(1, "Le titre du projet est requis")
      .max(150, "Le titre ne peut pas dépasser 150 caractères"),
    description: z
      .string()
      .trim()
      .max(2000, "La description ne peut pas dépasser 2000 caractères")
      .optional()
      .default(""),
    dateDebut: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de début est requise (AAAA-MM-JJ)"),
    dateFin: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date de fin invalide (AAAA-MM-JJ)")
      .optional()
      .or(z.literal("")),
    rappelActif: z.boolean().default(false),
    syncCalendrier: z.boolean().default(false),
    estTermine: z.boolean().default(false),
  })
  .refine(
    (data) => !data.dateFin || data.dateFin >= data.dateDebut,
    {
      message: "La date de fin doit être postérieure ou égale à la date de début",
      path: ["dateFin"],
    },
  );

/** Type inféré des données du formulaire de projet. */
export type ProjetFormValues = z.infer<typeof projetFormSchema>;

/**
 * Transforme les valeurs validées du formulaire en `CreateProjetDto` strict.
 *
 * @param values - Valeurs validées par `projetFormSchema`.
 * @returns Payload strict prêt pour `POST` ou `PATCH`.
 */
export function toCreateProjetDto(
  values: ProjetFormValues,
  includeNullables = false,
): CreateProjetDto {
  const dto: CreateProjetDto = {
    titre: values.titre.trim(),
    description: (values.description ?? "").trim(),
    dateDebut: new Date(`${values.dateDebut}T00:00:00.000Z`).toISOString(),
    rappelActif: values.rappelActif,
    syncCalendrier: values.syncCalendrier,
    estTermine: values.estTermine,
  };

  const dateFin = values.dateFin?.trim();
  if (dateFin) {
    dto.dateFin = new Date(`${dateFin}T00:00:00.000Z`).toISOString();
  } else if (includeNullables) {
    dto.dateFin = null;
  }

  return dto;
}
