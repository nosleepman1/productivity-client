import { z } from "zod";
import type { ContactType, CreateContactDto } from "@/types/contacts";

/** Catégories métier autorisées pour un contact. */
export const CONTACT_TYPES = [
  "CLIENT",
  "FOURNISSEUR",
  "PARTENAIRE",
  "AUTRE",
] as const satisfies readonly ContactType[];

/**
 * Libellés français associés à chaque type de contact.
 */
export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  CLIENT: "Client",
  FOURNISSEUR: "Fournisseur",
  PARTENAIRE: "Partenaire",
  AUTRE: "Autre",
};

/**
 * Schéma Zod de validation pour la création ou la mise à jour d'un contact.
 * Respecte strictement les contraintes du `CreateContactDto` NestJS.
 */
export const contactFormSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom du contact est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  telephone: z
    .string()
    .trim()
    .max(30, "Le numéro de téléphone ne peut pas dépasser 30 caractères")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide")
    .max(120, "L'adresse email est trop longue")
    .optional()
    .or(z.literal("")),
  type: z.enum(CONTACT_TYPES).default("AUTRE"),
  notes: z
    .string()
    .trim()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
});

/** Type inféré des données brutes du formulaire de contact. */
export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Convertit des valeurs validées de formulaire en payload strict `CreateContactDto`
 * compatible avec `ValidationPipe({ forbidNonWhitelisted: true })`.
 *
 * @param values - Valeurs validées par `contactFormSchema`.
 * @returns Objet DTO nettoyé prêt pour l'API.
 */
export function toCreateContactDto(values: ContactFormValues): CreateContactDto {
  const dto: CreateContactDto = {
    nom: values.nom.trim(),
    type: values.type,
  };

  const telephone = values.telephone?.trim();
  if (telephone) dto.telephone = telephone;

  const email = values.email?.trim();
  if (email) dto.email = email;

  const notes = values.notes?.trim();
  if (notes) dto.notes = notes;

  return dto;
}
