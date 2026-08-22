export type Ville = {
  slug: string;
  nom: string;
  region: "Grande-Terre" | "Basse-Terre" | "Îles du Sud";
  // Contenu réellement spécifique à la commune (quartiers, contexte local,
  // délai d'intervention). null = pas encore rédigé -> la page affiche un
  // TODO visible plutôt qu'un texte générique. À compléter en Phase 6,
  // commune par commune, avec un vrai contenu local (pas un template).
  contenuSpecifique: string | null;
};

// À REMPLIR EN PHASE 6 : chaque commune doit avoir ~200 mots propres
// (quartiers desservis, contexte local, délai d'intervention réel).
export const villes: Ville[] = [
  {
    slug: "pointe-a-pitre",
    nom: "Pointe-à-Pitre",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "les-abymes",
    nom: "Les Abymes",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "baie-mahault",
    nom: "Baie-Mahault",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "le-gosier",
    nom: "Le Gosier",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "sainte-anne",
    nom: "Sainte-Anne",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "saint-francois",
    nom: "Saint-François",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  { slug: "le-moule", nom: "Le Moule", region: "Grande-Terre", contenuSpecifique: null },
  {
    slug: "petit-bourg",
    nom: "Petit-Bourg",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "basse-terre",
    nom: "Basse-Terre",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "saint-claude",
    nom: "Saint-Claude",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "sainte-rose",
    nom: "Sainte-Rose",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  { slug: "lamentin", nom: "Lamentin", region: "Basse-Terre", contenuSpecifique: null },
  {
    slug: "capesterre-belle-eau",
    nom: "Capesterre-Belle-Eau",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "morne-a-leau",
    nom: "Morne-à-l'Eau",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "port-louis",
    nom: "Port-Louis",
    region: "Grande-Terre",
    contenuSpecifique: null,
  },
  { slug: "deshaies", nom: "Deshaies", region: "Basse-Terre", contenuSpecifique: null },
  {
    slug: "bouillante",
    nom: "Bouillante",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "trois-rivieres",
    nom: "Trois-Rivières",
    region: "Basse-Terre",
    contenuSpecifique: null,
  },
  {
    slug: "marie-galante",
    nom: "Marie-Galante",
    region: "Îles du Sud",
    contenuSpecifique: null,
  },
  {
    slug: "les-saintes",
    nom: "Les Saintes",
    region: "Îles du Sud",
    contenuSpecifique: null,
  },
  {
    slug: "la-desirade",
    nom: "La Désirade",
    region: "Îles du Sud",
    contenuSpecifique: null,
  },
];

export function getVilleBySlug(slug: string): Ville | undefined {
  return villes.find((v) => v.slug === slug);
}
