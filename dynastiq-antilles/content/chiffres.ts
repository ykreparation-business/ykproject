export type Chiffre = { valeur: number; suffixe: string; label: string };

// Valeurs À VALIDER par l'entreprise avant mise en production — aucun
// chiffre n'est présenté comme définitif tant qu'il n'est pas confirmé.
export const chiffres: Chiffre[] = [
  { valeur: 0, suffixe: "", label: "Sites protégés — À VALIDER" },
  { valeur: 0, suffixe: "", label: "Années d'expérience — À VALIDER" },
  { valeur: 0, suffixe: "h", label: "Délai moyen d'intervention — À VALIDER" },
];
