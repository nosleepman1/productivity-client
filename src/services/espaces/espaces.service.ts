import { api } from "@/api/api";
import type { Page } from "@/types/common/pagination.types";
import type {
  CreateEspaceDto,
  Espace,
  QueryEspacesDto,
  UpdateEspaceDto,
} from "@/types/espaces";

export const espacesService = {
  async getAll(query: QueryEspacesDto = {}): Promise<Page<Espace>> {
    const { data } = await api.get<Page<Espace>>("/espaces", {
      params: query,
    });
    return data;
  },

  async getOne(id: string): Promise<Espace> {
    const { data } = await api.get<Espace>(`/espaces/${id}`);
    return data;
  },

  async create(payload: CreateEspaceDto): Promise<Espace> {
    const { data } = await api.post<Espace>("/espaces", payload);
    return data;
  },

  async update(id: string, payload: UpdateEspaceDto): Promise<Espace> {
    const { data } = await api.patch<Espace>(`/espaces/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/espaces/${id}`);
  },
};
