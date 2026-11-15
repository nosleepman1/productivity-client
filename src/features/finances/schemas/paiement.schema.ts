import { z } from "zod";
import type { CreatePaiementDto } from "@/types/finances";

/**
 * Construit un schéma Zod de validation de paiement borné par le reste à payer.
 *
 * @param maxMontant - Solde restant maximal autorisé en FCFA.
 * @returns Schéma Zod adapté au dossier sélectionné.
 */
export function buildPaiementFormSchema(maxMontant?: number) {
  return z.object({
    montant: z
      .number({ message: "Veuillez saisir un montant valide" })
      .int("Le montant doit être un nombre entier en FCFA")
      .positive("Le montant doit être supérieur à 0 FCFA")
      .refine(
        (val) => maxMontant === undefined || val <= maxMontant,
        maxMontant !== undefined
          ? `Le paiement ne peut pas dépasser le reste (${maxMontant.toLocaleString("fr-FR")} FCFA)`
          : "Montant invalide",
      ),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)")
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .trim()
      .max(500, "La note ne peut pas dépasser 500 caractères")
      .optional()
      .or(z.literal("")),
  });
}

/** Schéma de base sans plafond dynamique. */
export const paiementFormSchema = buildPaiementFormSchema();

/** Type inféré des données de formulaire de paiement. */
export type PaiementFormValues = z.infer<typeof paiementFormSchema>;

/**
 * Convertit les valeurs validées d'un paiement en `CreatePaiementDto` strict.
 *
 * @param values - Valeurs validées par `buildPaiementFormSchema`.
 * @returns Payload strict pour `POST .../paiements`.
 */
export function toCreatePaiementDto(
  values: PaiementFormValues,
): CreatePaiementDto {
  const dto: CreatePaiementDto = {
    montant: Math.trunc(values.montant),
  };

  const date = values.date?.trim();
  if (date) {
    dto.date = new Date(`${date}T00:00:00.000Z`).toISOString();
  }

  const note = values.note?.trim();
  if (note) {
    dto.note = note;
  }

  return dto;
}
