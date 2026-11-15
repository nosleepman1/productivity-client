import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  CreateProjetDto,
  Projet,
  QueryProjetsDto,
  UpdateProjetDto,
} from "@/types/productivity";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/projets`;

/**
 * Service HTTP pour la gestion des projets d'un espace de travail.
 */
export const projetsService = {
  /**
   * Liste paginée des projets d'un espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de pagination et tri.
   */
  async list(
    espaceId: string,
    query?: QueryProjetsDto,
  ): Promise<Page<Projet>> {
    const { data } = await api.get<Page<Projet>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Récupère le détail d'un projet.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du projet.
   */
  async getById(espaceId: string, id: string): Promise<Projet> {
    const { data } = await api.get<Projet>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Crée un nouveau projet dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées du projet.
   */
  async create(espaceId: string, dto: CreateProjetDto): Promise<Projet> {
    const { data } = await api.post<Projet>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour partiellement un projet.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du projet.
   * @param dto - Champs modifiés.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateProjetDto,
  ): Promise<Projet> {
    const { data } = await api.patch<Projet>(
      `${baseUrl(espaceId)}/${id}`,
      dto,
    );
    return data;
  },

  /**
   * Supprime un projet.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du projet.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },
};
