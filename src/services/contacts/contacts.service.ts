import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
  QueryContactsDto,
} from "@/types/contacts";

const BASE = "/contacts";

/**
 * Service HTTP pour la gestion du carnet de contacts de l'utilisateur.
 * Les contacts sont rattachés à l'utilisateur authentifié et partagés entre espaces.
 */
export const contactsService = {
  /**
   * Liste paginée des contacts avec filtres de recherche et type.
   *
   * @param query - Paramètres optionnels de pagination, tri, type et recherche.
   * @returns Page de contacts correspondants.
   */
  async list(query?: QueryContactsDto): Promise<Page<Contact>> {
    const { data } = await api.get<Page<Contact>>(BASE, { params: query });
    return data;
  },

  /**
   * Récupère un contact par son identifiant.
   *
   * @param id - Identifiant UUID du contact.
   * @returns Détails du contact.
   */
  async getById(id: string): Promise<Contact> {
    const { data } = await api.get<Contact>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Crée un nouveau contact dans le carnet de l'utilisateur.
   *
   * @param dto - Données validées du contact.
   * @returns Contact créé.
   */
  async create(dto: CreateContactDto): Promise<Contact> {
    const { data } = await api.post<Contact>(BASE, dto);
    return data;
  },

  /**
   * Met à jour partiellement un contact existant.
   *
   * @param id - Identifiant UUID du contact.
   * @param dto - Champs à modifier.
   * @returns Contact mis à jour.
   */
  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const { data } = await api.patch<Contact>(`${BASE}/${id}`, dto);
    return data;
  },

  /**
   * Supprime un contact existant.
   *
   * @param id - Identifiant UUID du contact.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },
};
