import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  Dette,
  CreateDetteDto,
  UpdateDetteDto,
  QuerySuiviDto,
  ResumeSuivi,
  Paiement,
  CreatePaiementDto,
} from "@/types/finances";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/dettes`;

/**
 * Service HTTP pour les dettes d'un espace de travail donné et leurs paiements.
 */
export const dettesService = {
  /**
   * Liste paginée des dettes d'un espace avec filtres de statut, tri et période.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de filtrage et pagination.
   * @returns Page de dettes.
   */
  async list(espaceId: string, query?: QuerySuiviDto): Promise<Page<Dette>> {
    const { data } = await api.get<Page<Dette>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Agrégat de suivi des dettes (total restant, en cours, en retard, soldées).
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @returns Résumé chiffré des dettes.
   */
  async resume(espaceId: string): Promise<ResumeSuivi> {
    const { data } = await api.get<ResumeSuivi>(`${baseUrl(espaceId)}/resume`);
    return data;
  },

  /**
   * Récupère le détail d'une dette avec son historique de paiements.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dette.
   * @returns Dette complète.
   */
  async getById(espaceId: string, id: string): Promise<Dette> {
    const { data } = await api.get<Dette>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Crée une nouvelle dette dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées de la dette.
   * @returns Dette créée.
   */
  async create(espaceId: string, dto: CreateDetteDto): Promise<Dette> {
    const { data } = await api.post<Dette>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour une dette existante.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dette.
   * @param dto - Champs modifiés.
   * @returns Dette mise à jour.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateDetteDto,
  ): Promise<Dette> {
    const { data } = await api.patch<Dette>(
      `${baseUrl(espaceId)}/${id}`,
      dto,
    );
    return data;
  },

  /**
   * Supprime une dette.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la dette.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },

  /**
   * Enregistre un paiement partiel ou total sur une dette.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param detteId - Identifiant de la dette.
   * @param dto - Données du paiement.
   * @returns Paiement enregistré.
   */
  async addPaiement(
    espaceId: string,
    detteId: string,
    dto: CreatePaiementDto,
  ): Promise<Paiement> {
    const { data } = await api.post<Paiement>(
      `${baseUrl(espaceId)}/${detteId}/paiements`,
      dto,
    );
    return data;
  },

  /**
   * Annule un paiement précédemment enregistré sur une dette.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param detteId - Identifiant de la dette.
   * @param paiementId - Identifiant du paiement à supprimer.
   */
  async removePaiement(
    espaceId: string,
    detteId: string,
    paiementId: string,
  ): Promise<void> {
    await api.delete(
      `${baseUrl(espaceId)}/${detteId}/paiements/${paiementId}`,
    );
  },
};
