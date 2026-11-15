import { z } from "zod";
import type { CreateDetteDto, CreateCreanceDto } from "@/types/finances";

/** Expression régulière de validation d'un UUID v4. */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schéma Zod de validation pour la création ou l'édition d'une dette ou créance.
 * Conforme aux DTOs `CreateDetteDto` et `CreateCreanceDto` du backend NestJS.
 */
export const suiviFormSchema = z.object({
  montant: z
    .number({ message: "Veuillez saisir un montant valide" })
    .int("Le montant doit être un nombre entier en FCFA")
    .positive("Le montant doit être supérieur à 0 FCFA")
    .max(1_000_000_000_000, "Montant hors limite"),
  description: z
    .string()
    .trim()
    .min(1, "La description est requise")
    .max(255, "La description ne peut pas dépasser 255 caractères"),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)")
    .optional()
    .or(z.literal("")),
  datePromise: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date promise invalide (AAAA-MM-JJ)")
    .optional()
    .or(z.literal("")),
  contactId: z
    .string()
    .trim()
    .regex(UUID_V4_REGEX, "Identifiant de contact invalide")
    .optional()
    .or(z.literal("")),
});

/** Type inféré du formulaire de dette ou créance. */
export type SuiviFormValues = z.infer<typeof suiviFormSchema>;

/**
 * Convertit les valeurs validées d'un formulaire de suivi en DTO strict
 * (`CreateDetteDto` / `CreateCreanceDto`).
 *
 * @param values - Valeurs validées par `suiviFormSchema`.
 * @param includeNullables - Si `true` (mode édition), envoie `null` pour dissocier datePromise/contactId.
 * @returns Payload strict accepté par le backend.
 */
export function toSuiviDto(
  values: SuiviFormValues,
  includeNullables = false,
): CreateDetteDto & CreateCreanceDto {
  const dto: CreateDetteDto & CreateCreanceDto = {
    montant: Math.trunc(values.montant),
    description: values.description.trim(),
  };

  const date = values.date?.trim();
  if (date) {
    dto.date = new Date(`${date}T00:00:00.000Z`).toISOString();
  }

  const datePromise = values.datePromise?.trim();
  if (datePromise) {
    dto.datePromise = new Date(`${datePromise}T00:00:00.000Z`).toISOString();
  } else if (includeNullables) {
    dto.datePromise = null;
  }

  const contactId = values.contactId?.trim();
  if (contactId) {
    dto.contactId = contactId;
  } else if (includeNullables) {
    dto.contactId = null;
  }

  return dto;
}
