import { api } from "@/api/api";
import type { Profil, UpdateProfilDto } from "@/types/auth";

export const profilService = {
  async getMyProfil(): Promise<Profil> {
    const { data } = await api.get<Profil>("/profil/me");
    return data;
  },

  async updateMyProfil(payload: UpdateProfilDto): Promise<Profil> {
    const { data } = await api.patch<Profil>("/profil/me", payload);
    return data;
  },
};
