export type Marque = {
  slug: "hikvision" | "dahua" | "safire";
  nom: string;
  positionnement: string;
  pointsForts: string[];
  application: string;
  pourQui: string;
  intro: string;
};

// Comparatif honnête, non commercial. Positionnements généraux du marché —
// à ajuster si l'expérience terrain de l'installateur diffère.
export const marques: Marque[] = [
  {
    slug: "hikvision",
    nom: "Hikvision",
    positionnement: "Le plus large catalogue, du résidentiel au très haute résolution.",
    pointsForts: [
      "Gamme très étendue (résolution, focale, IA embarquée)",
      "Détection intelligente mature (véhicule, personne, franchissement de ligne)",
      "Écosystème NVR/DVR éprouvé",
    ],
    application: "Hik-Connect",
    pourQui:
      "Commerces et entreprises qui veulent une gamme évolutive avec beaucoup d'options.",
    intro:
      "Hikvision est l'un des plus gros fabricants mondiaux de vidéosurveillance. Le catalogue est le plus large du marché : caméras d'entrée de gamme jusqu'à des modèles avec détection IA embarquée (reconnaissance de véhicule, de silhouette, franchissement de ligne). C'est un choix pertinent quand le projet doit pouvoir évoluer dans le temps sans changer d'écosystème.",
  },
  {
    slug: "dahua",
    nom: "Dahua",
    positionnement:
      "Bon rapport qualité-prix, solide en installations moyennes à grandes.",
    pointsForts: [
      "Rapport qualité-prix reconnu sur les gammes pro",
      "Bonne tenue en basse lumière (gamme Full Color / Starlight)",
      "Compatible avec de nombreux protocoles ouverts (ONVIF)",
    ],
    application: "gDMSS / DMSS",
    pourQui:
      "Commerces, entrepôts et copropriétés cherchant un bon compromis budget/qualité.",
    intro:
      "Dahua est le deuxième grand fabricant du secteur, avec une réputation solide de rapport qualité-prix sur les gammes professionnelles. Ses caméras basse lumière (Full Color, Starlight) sont particulièrement adaptées aux extérieurs mal éclairés — un point pertinent pour les parkings et arrière-cours en Guadeloupe.",
  },
  {
    slug: "safire",
    nom: "Safire",
    positionnement: "Marque de distribution professionnelle, positionnement accessible.",
    pointsForts: [
      "Bon compromis pour les budgets contraints",
      "Compatible avec les standards ONVIF",
      "Interface simple, orientée petites et moyennes installations",
    ],
    application: "Safire View",
    pourQui: "Particuliers et petits commerces avec un nombre de caméras limité.",
    intro:
      "Safire est une marque de distribution professionnelle, positionnée sur des installations plus simples et des budgets plus serrés. Elle convient bien aux projets résidentiels ou aux petits commerces qui n'ont pas besoin des fonctions IA avancées des gammes haut de gamme.",
  },
];

export const ajax = {
  nom: "Ajax",
  intro:
    "Ajax est un système d'alarme sans fil conçu pour une installation propre (pas de saignées, pas de câblage à tirer) et un pilotage entièrement depuis l'application mobile.",
  points: [
    {
      titre: "Sans fil, protocole Jeweller",
      description:
        "Communication chiffrée entre les détecteurs et le hub, portée longue, sans les contraintes d'un câblage filaire — pertinent pour les bâtiments existants.",
    },
    {
      titre: "Autonomie longue",
      description:
        "Les détecteurs fonctionnent plusieurs années sur pile, avec un report d'état de batterie visible dans l'application.",
    },
    {
      titre: "MotionCam",
      description:
        "Le détecteur de mouvement MotionCam prend une photo au moment de la détection, envoyée directement dans l'application pour lever le doute en cas d'alerte.",
    },
    {
      titre: "Pilotage à distance",
      description:
        "Armement, désarmement et consultation de l'historique depuis l'appli, où que tu sois.",
    },
    {
      titre: "Extensible",
      description:
        "Le système grandit avec le bâtiment : ajout de détecteurs, sirènes ou accessoires sans reprendre l'installation existante.",
    },
  ],
} as const;
