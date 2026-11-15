import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  Revenu,
  CreateRevenuDto,
  UpdateRevenuDto,
  QueryTransactionsDto,
} from "@/types/finances";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/revenus`;

/**
 * Service HTTP pour les revenus d'un espace de travail donné.
 * Chaque appel est strictement scopé par `espaceId`.
 */
export const revenusService = {
  /**
   * Liste paginée des revenus d'un espace avec tri et bornes de dates.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de pagination, tri et période.
   * @returns Page de revenus.
   */
  async list(
    espaceId: string,
    query?: QueryTransactionsDto,
  ): Promise<Page<Revenu>> {
    const { data } = await api.get<Page<Revenu>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Récupère le détail d'un revenu.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du revenu.
   * @returns Revenu demandé.
   */
  async getById(espaceId: string, id: string): Promise<Revenu> {
    const { data } = await api.get<Revenu>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Enregistre un nouveau revenu dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées du revenu.
   * @returns Revenu créé.
   */
  async create(espaceId: string, dto: CreateRevenuDto): Promise<Revenu> {
    const { data } = await api.post<Revenu>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour un revenu existant.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du revenu.
   * @param dto - Champs modifiés.
   * @returns Revenu mis à jour.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateRevenuDto,
  ): Promise<Revenu> {
    const { data } = await api.patch<Revenu>(`${baseUrl(espaceId)}/${id}`, dto);
    return data;
  },

  /**
   * Supprime un revenu.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant du revenu.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },
};
