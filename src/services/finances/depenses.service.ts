import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  Depense,
  CreateDepenseDto,
  UpdateDepenseDto,
  QueryTransactionsDto,
} from "@/types/finances";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/depenses`;

/**
 * Service HTTP pour les dépenses d'un espace de travail donné.
 * Chaque appel est strictement scopé par `espaceId`.
 */
export const depensesService = {
  /**
   * Liste paginée des dépenses d'un espace avec tri et bornes de dates.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de pagination, tri et période.
   * @returns Page de dépenses.
   */
  async list(
    espaceId: string,
    query?: QueryTransactionsDto,
  ): Promise<Page<Depense>> {
    const { data } = await api.get<Page<Depense>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Récupère le détail d'une dépense.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dépense.
   * @returns Dépense demandée.
   */
  async getById(espaceId: string, id: string): Promise<Depense> {
    const { data } = await api.get<Depense>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Enregistre une nouvelle dépense dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées de la dépense.
   * @returns Dépense créée.
   */
  async create(espaceId: string, dto: CreateDepenseDto): Promise<Depense> {
    const { data } = await api.post<Depense>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour une dépense existante.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dépense.
   * @param dto - Champs modifiés.
   * @returns Dépense mise à jour.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateDepenseDto,
  ): Promise<Depense> {
    const { data } = await api.patch<Depense>(
      `${baseUrl(espaceId)}/${id}`,
      dto,
    );
    return data;
  },

  /**
   * Supprime une dépense.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dépense.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },
};
