import { z } from "zod";
import type { CreateRevenuDto, CreateDepenseDto } from "@/types/finances";

/**
 * Schéma Zod commun aux formulaires de revenu et de dépense.
 * Les montants sont des entiers strictement positifs en FCFA.
 */
export const transactionFormSchema = z.object({
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de l'opération est requise (AAAA-MM-JJ)"),
  categorie: z.string().trim().optional(),
  moyenPaiement: z.string().trim().optional(),
  projetId: z.string().trim().optional().nullable(),
});

/** Type inféré des valeurs du formulaire de transaction (revenu ou dépense). */
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

/**
 * Transforme les valeurs validées d'un formulaire de transaction en DTO strict
 * pour les endpoints `revenus` ou `depenses`.
 *
 * @param values - Valeurs validées par `transactionFormSchema`.
 * @returns Payload strict sans propriétés superflues.
 */
export function toTransactionDto(
  values: TransactionFormValues,
): CreateRevenuDto & CreateDepenseDto {
  const dto: CreateRevenuDto & CreateDepenseDto = {
    montant: Math.trunc(values.montant),
    description: values.description.trim(),
    date: new Date(`${values.date.trim()}T00:00:00.000Z`).toISOString(),
  };

  if (values.categorie) {
    dto.categorie = values.categorie;
  }
  if (values.moyenPaiement) {
    dto.moyenPaiement = values.moyenPaiement;
  }
  if (values.projetId !== undefined) {
    dto.projetId = values.projetId || null;
  }

  return dto;
}
