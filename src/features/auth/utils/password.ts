export const PASSWORD_RULES = [
  { id: "len", label: "8+ caractères", test: (v: string) => v.length >= 8 },
  { id: "lower", label: "1 minuscule", test: (v: string) => /[a-z]/.test(v) },
  { id: "upper", label: "1 majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { id: "digit", label: "1 chiffre", test: (v: string) => /\d/.test(v) },
  {
    id: "special",
    label: "1 spécial",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

export function isStrongPassword(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
