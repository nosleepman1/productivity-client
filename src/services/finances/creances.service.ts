import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  Creance,
  CreateCreanceDto,
  UpdateCreanceDto,
  QuerySuiviDto,
  ResumeSuivi,
  Paiement,
  CreatePaiementDto,
  RelanceCreance,
} from "@/types/finances";

const baseUrl = (espaceId: string) => `/espaces/${espaceId}/creances`;

/**
 * Service HTTP pour les créances d'un espace, leurs paiements et relances WhatsApp.
 */
export const creancesService = {
  /**
   * Liste paginée des créances d'un espace avec filtres de statut, tri et période.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param query - Paramètres optionnels de filtrage et pagination.
   * @returns Page de créances.
   */
  async list(
    espaceId: string,
    query?: QuerySuiviDto,
  ): Promise<Page<Creance>> {
    const { data } = await api.get<Page<Creance>>(baseUrl(espaceId), {
      params: query,
    });
    return data;
  },

  /**
   * Agrégat de suivi des créances (total à encaisser, en cours, en retard, soldées).
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @returns Résumé chiffré des créances.
   */
  async resume(espaceId: string): Promise<ResumeSuivi> {
    const { data } = await api.get<ResumeSuivi>(`${baseUrl(espaceId)}/resume`);
    return data;
  },

  /**
   * Récupère le détail d'une créance avec son historique de paiements.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la créance.
   * @returns Créance complète.
   */
  async getById(espaceId: string, id: string): Promise<Creance> {
    const { data } = await api.get<Creance>(`${baseUrl(espaceId)}/${id}`);
    return data;
  },

  /**
   * Génère le message et le lien WhatsApp (`wa.me`) de relance pour une créance.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la créance.
   * @returns Payload de relance prêt à copier ou ouvrir.
   */
  async getRelance(espaceId: string, id: string): Promise<RelanceCreance> {
    const { data } = await api.get<RelanceCreance>(
      `${baseUrl(espaceId)}/${id}/relance`,
    );
    return data;
  },

  /**
   * Crée une nouvelle créance dans l'espace.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param dto - Données validées de la créance.
   * @returns Créance créée.
   */
  async create(espaceId: string, dto: CreateCreanceDto): Promise<Creance> {
    const { data } = await api.post<Creance>(baseUrl(espaceId), dto);
    return data;
  },

  /**
   * Met à jour une créance existante.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la créance.
   * @param dto - Champs modifiés.
   * @returns Créance mise à jour.
   */
  async update(
    espaceId: string,
    id: string,
    dto: UpdateCreanceDto,
  ): Promise<Creance> {
    const { data } = await api.patch<Creance>(
      `${baseUrl(espaceId)}/${id}`,
      dto,
    );
    return data;
  },

  /**
   * Supprime une créance.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param id - Identifiant de la créance.
   */
  async remove(espaceId: string, id: string): Promise<void> {
    await api.delete(`${baseUrl(espaceId)}/${id}`);
  },

  /**
   * Enregistre un encaissement partiel ou total sur une créance.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param creanceId - Identifiant de la créance.
   * @param dto - Données du paiement.
   * @returns Paiement enregistré.
   */
  async addPaiement(
    espaceId: string,
    creanceId: string,
    dto: CreatePaiementDto,
  ): Promise<Paiement> {
    const { data } = await api.post<Paiement>(
      `${baseUrl(espaceId)}/${creanceId}/paiements`,
      dto,
    );
    return data;
  },

  /**
   * Supprime un encaissement précédemment enregistré sur une créance.
   *
   * @param espaceId - Identifiant de l'espace actif.
   * @param creanceId - Identifiant de la créance.
   * @param paiementId - Identifiant du paiement à supprimer.
   */
  async removePaiement(
    espaceId: string,
    creanceId: string,
    paiementId: string,
  ): Promise<void> {
    await api.delete(
      `${baseUrl(espaceId)}/${creanceId}/paiements/${paiementId}`,
    );
  },
};
