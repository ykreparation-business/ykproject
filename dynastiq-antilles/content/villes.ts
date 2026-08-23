export type Ville = {
  slug: string;
  nom: string;
  region: "Grande-Terre" | "Basse-Terre" | "Îles du Sud";
  // Contenu réellement spécifique à la commune (quartiers, contexte local,
  // délai d'intervention). null = pas encore rédigé -> la page affiche un
  // TODO visible plutôt qu'un texte générique. À compléter en Phase 6,
  // commune par commune, avec un vrai contenu local (pas un template).
  contenuSpecifique: string | null;
  // Position schématique sur la carte SVG de la Guadeloupe (viewBox 500x400,
  // voir components/sections/zones-carte.tsx). Approximative, à but
  // d'orientation, pas une carte géographique précise.
  mapPosition: { x: number; y: number };
};

// À REMPLIR EN PHASE 6 : chaque commune doit avoir ~200 mots propres
// (quartiers desservis, contexte local, délai d'intervention réel).
export const villes: Ville[] = [
  {
    slug: "pointe-a-pitre",
    nom: "Pointe-à-Pitre",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 236, y: 178 },
  },
  {
    slug: "les-abymes",
    nom: "Les Abymes",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 264, y: 164 },
  },
  {
    slug: "baie-mahault",
    nom: "Baie-Mahault",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 206, y: 168 },
  },
  {
    slug: "le-gosier",
    nom: "Le Gosier",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 282, y: 206 },
  },
  {
    slug: "sainte-anne",
    nom: "Sainte-Anne",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 342, y: 216 },
  },
  {
    slug: "saint-francois",
    nom: "Saint-François",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 418, y: 192 },
  },
  {
    slug: "le-moule",
    nom: "Le Moule",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 428, y: 138 },
  },
  {
    slug: "petit-bourg",
    nom: "Petit-Bourg",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 194, y: 190 },
  },
  {
    slug: "basse-terre",
    nom: "Basse-Terre",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 163, y: 302 },
  },
  {
    slug: "saint-claude",
    nom: "Saint-Claude",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 168, y: 282 },
  },
  {
    slug: "sainte-rose",
    nom: "Sainte-Rose",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 138, y: 100 },
  },
  {
    slug: "lamentin",
    nom: "Lamentin",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 128, y: 190 },
  },
  {
    slug: "capesterre-belle-eau",
    nom: "Capesterre-Belle-Eau",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 196, y: 268 },
  },
  {
    slug: "morne-a-leau",
    nom: "Morne-à-l'Eau",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 300, y: 140 },
  },
  {
    slug: "port-louis",
    nom: "Port-Louis",
    region: "Grande-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 320, y: 104 },
  },
  {
    slug: "deshaies",
    nom: "Deshaies",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 110, y: 80 },
  },
  {
    slug: "bouillante",
    nom: "Bouillante",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 100, y: 178 },
  },
  {
    slug: "trois-rivieres",
    nom: "Trois-Rivières",
    region: "Basse-Terre",
    contenuSpecifique: null,
    mapPosition: { x: 176, y: 330 },
  },
  {
    slug: "marie-galante",
    nom: "Marie-Galante",
    region: "Îles du Sud",
    contenuSpecifique: null,
    mapPosition: { x: 430, y: 340 },
  },
  {
    slug: "les-saintes",
    nom: "Les Saintes",
    region: "Îles du Sud",
    contenuSpecifique: null,
    mapPosition: { x: 160, y: 380 },
  },
  {
    slug: "la-desirade",
    nom: "La Désirade",
    region: "Îles du Sud",
    contenuSpecifique: null,
    mapPosition: { x: 490, y: 165 },
  },
];

export function getVilleBySlug(slug: string): Ville | undefined {
  return villes.find((v) => v.slug === slug);
}
