import { z } from "zod";
import type { CreateNoteDto } from "@/types/productivity";

/**
 * Schéma Zod de validation pour la création ou l'édition d'une note / idée.
 * Conforme au `CreateNoteDto` NestJS (`forbidNonWhitelisted: true`).
 */
export const noteFormSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(1, "Le titre de la note est requis")
    .max(150, "Le titre ne peut pas dépasser 150 caractères"),
  contenu: z
    .string()
    .trim()
    .min(1, "Le contenu de la note est requis")
    .max(10000, "Le contenu ne peut pas dépasser 10 000 caractères"),
});

/** Type inféré des données du formulaire de note. */
export type NoteFormValues = z.infer<typeof noteFormSchema>;

/**
 * Transforme les valeurs validées du formulaire en `CreateNoteDto` strict.
 *
 * @param values - Valeurs validées par `noteFormSchema`.
 * @returns Payload strict prêt pour l'API.
 */
export function toCreateNoteDto(values: NoteFormValues): CreateNoteDto {
  return {
    titre: values.titre.trim(),
    contenu: values.contenu.trim(),
  };
}
