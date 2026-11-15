export type LangueProfil = "fr" | "en" | "wo";
export type ThemeProfil = "clair" | "sombre" | "systeme";

export interface Profil {
  telephone: string | null;
  langue: LangueProfil;
  fuseauHoraire: string;
  theme: ThemeProfil;
  notifications: boolean;
  rappelsQuotidiens: boolean;
  biographie: string | null;
  dateNaissance: string | null;
  updatedAt: string;
}

export interface UpdateProfilDto {
  telephone?: string | null;
  langue?: LangueProfil;
  fuseauHoraire?: string;
  theme?: ThemeProfil;
  notifications?: boolean;
  rappelsQuotidiens?: boolean;
  biographie?: string | null;
  dateNaissance?: string | null;
}
