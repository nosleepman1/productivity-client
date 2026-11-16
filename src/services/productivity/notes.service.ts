import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  CreateNoteDto,
  Note,
  QueryNotesDto,
  UpdateNoteDto,
} from "@/types/productivity";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/notes`;

/**
 * Service HTTP pour la gestion des notes et idées d'un espace de travail.
 */
export const notesService = {
  /**
   * Liste paginée des notes d'un espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de pagination et tri.
   */
  async list(espaceId: string, query?: QueryNotesDto): Promise<Page<Note>> {
    const { data } = await api.get<Page<Note>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Récupère le détail d'une note.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la note.
   */
  async getById(espaceId: string, id: string): Promise<Note> {
    const { data } = await api.get<Note>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Crée une nouvelle note dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées de la note.
   */
  async create(espaceId: string, dto: CreateNoteDto): Promise<Note> {
    const { data } = await api.post<Note>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour partiellement une note.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la note.
   * @param dto - Champs modifiés.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const { data } = await api.patch<Note>(`${baseUrl(espaceId)}/${id}`, dto);
    return data;
  },

  /**
   * Supprime une note.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la note.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },
};
