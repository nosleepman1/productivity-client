import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  CreateTacheDto,
  QueryTachesDto,
  Tache,
  UpdateTacheDto,
} from "@/types/productivity";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/taches`;

/**
 * Service HTTP pour la gestion des tâches d'un espace de travail.
 */
export const tachesService = {
  /**
   * Liste paginée des tâches d'un espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de pagination et tri.
   */
  async list(espaceId: string, query?: QueryTachesDto): Promise<Page<Tache>> {
    const { data } = await api.get<Page<Tache>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Récupère le détail d'une tâche.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la tâche.
   */
  async getById(espaceId: string, id: string): Promise<Tache> {
    const { data } = await api.get<Tache>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Crée une nouvelle tâche dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées de la tâche.
   */
  async create(espaceId: string, dto: CreateTacheDto): Promise<Tache> {
    const { data } = await api.post<Tache>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour partiellement une tâche (ex: bascule `estTerminee`).
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la tâche.
   * @param dto - Champs modifiés.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateTacheDto,
  ): Promise<Tache> {
    const { data } = await api.patch<Tache>(
      `${baseUrl(espaceId)}/${id}`,
      dto,
    );
    return data;
  },

  /**
   * Supprime une tâche.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la tâche.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },
};
