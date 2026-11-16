export type LangueProfil = "fr" | "en" | "ar" | "wo";
export type ThemeProfil = "clair" | "sombre" | "systeme";
export type ActiviteProfil =
  | "SALARIE"
  | "ENTREPRENEUR"
  | "COMMERCANT"
  | "FREELANCE"
  | "ETUDIANT"
  | "AUTRE";
export type ObjectifPrincipalProfil =
  | "MAITRISER_DEPENSES"
  | "EPARGNER"
  | "DEVELOPPER_ACTIVITE"
  | "ORGANISER_PROJETS"
  | "REMBOURSER_DETTES";

export interface Profil {
  telephone: string | null;
  langue: LangueProfil;
  fuseauHoraire: string;
  theme: ThemeProfil;
  notifications: boolean;
  rappelsQuotidiens: boolean;
  biographie: string | null;
  dateNaissance: string | null;
  heureLever: string;
  heureDescente: string;
  heureCoucher: string;
  activite: ActiviteProfil | null;
  objectifPrincipal: ObjectifPrincipalProfil | null;
  budgetMensuelCible: number | null;
  onboardingTermine: boolean;
  calendrierToken: string | null;
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
  heureLever?: string;
  heureDescente?: string;
  heureCoucher?: string;
  activite?: ActiviteProfil | null;
  objectifPrincipal?: ObjectifPrincipalProfil | null;
  budgetMensuelCible?: number | null;
  onboardingTermine?: boolean;
}
