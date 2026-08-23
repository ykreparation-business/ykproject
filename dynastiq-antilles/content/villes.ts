export type Ville = {
  slug: string;
  nom: string;
  region: "Grande-Terre" | "Basse-Terre" | "Îles du Sud";
  // Contenu réellement spécifique à la commune (quartiers, contexte local).
  // Le délai d'intervention n'est volontairement pas chiffré ici : aucun
  // délai précis n'est inventé, il est confirmé au devis.
  contenuSpecifique: string | null;
  // Position schématique sur la carte SVG de la Guadeloupe (viewBox 500x400,
  // voir components/sections/zones-carte.tsx). Approximative, à but
  // d'orientation, pas une carte géographique précise.
  mapPosition: { x: number; y: number };
};

export const villes: Ville[] = [
  {
    slug: "pointe-a-pitre",
    nom: "Pointe-à-Pitre",
    region: "Grande-Terre",
    contenuSpecifique:
      "Pointe-à-Pitre est le cœur économique et commercial de la Guadeloupe : centre-ville dense, port, marché, quartiers comme Bergevin, Chanzy ou Lauricisque. La concentration de commerces, de bureaux et de logements collectifs en fait une zone à forte densité, avec des besoins qui vont du commerce de centre-ville à l'immeuble résidentiel. La proximité du port et de zones à fort passage justifie une attention particulière à la vidéosurveillance des accès et des réserves.",
    mapPosition: { x: 236, y: 178 },
  },
  {
    slug: "les-abymes",
    nom: "Les Abymes",
    region: "Grande-Terre",
    contenuSpecifique:
      "Les Abymes est la commune la plus peuplée de Guadeloupe, avec des quartiers aussi variés que Le Raizet (proche de l'aéroport Pôle Caraïbes), Grand Camp, Dothémare ou Vieux-Bourg. Cette diversité se traduit par des projets tout aussi variés : pavillons individuels, commerces de proximité, zones d'activité près de l'aéroport. Une commune où les installations résidentielles et professionnelles se côtoient étroitement.",
    mapPosition: { x: 264, y: 164 },
  },
  {
    slug: "baie-mahault",
    nom: "Baie-Mahault",
    region: "Grande-Terre",
    contenuSpecifique:
      "Baie-Mahault, à l'isthme entre Basse-Terre et Grande-Terre, concentre la zone commerciale et industrielle de Jarry — la plus importante de l'archipel : entrepôts, enseignes, zones logistiques. C'est une commune où la vidéosurveillance de sites professionnels (entrepôts, commerces, locaux d'activité) est particulièrement pertinente, aux côtés de secteurs résidentiels plus calmes.",
    mapPosition: { x: 206, y: 168 },
  },
  {
    slug: "le-gosier",
    nom: "Le Gosier",
    region: "Grande-Terre",
    contenuSpecifique:
      "Le Gosier est une commune touristique du sud de la Grande-Terre, avec une concentration d'hôtels et de résidences le long du littoral (Bas du Fort, Petit-Havre). L'activité hôtelière et les locations saisonnières y sont importantes, ce qui rend le contrôle d'accès autonome et la vidéosurveillance des espaces communs particulièrement adaptés, en complément des installations résidentielles classiques.",
    mapPosition: { x: 282, y: 206 },
  },
  {
    slug: "sainte-anne",
    nom: "Sainte-Anne",
    region: "Grande-Terre",
    contenuSpecifique:
      "Sainte-Anne, connue pour ses plages (dont la Caravelle), combine un bourg animé et des zones résidentielles et touristiques en périphérie. Entre maisons individuelles, commerces liés au tourisme et locations saisonnières, les besoins vont de l'alarme résidentielle simple au contrôle d'accès pour les hébergements de courte durée.",
    mapPosition: { x: 342, y: 216 },
  },
  {
    slug: "saint-francois",
    nom: "Saint-François",
    region: "Grande-Terre",
    contenuSpecifique:
      "Saint-François, à l'est de la Grande-Terre, est marquée par sa marina, son golf et son activité touristique, non loin de la Pointe des Châteaux. Les besoins y concernent aussi bien les résidences secondaires et locations saisonnières que les commerces et infrastructures liées au tourisme et à la plaisance.",
    mapPosition: { x: 418, y: 192 },
  },
  {
    slug: "le-moule",
    nom: "Le Moule",
    region: "Grande-Terre",
    contenuSpecifique:
      "Le Moule, sur la côte est, garde une identité plus résidentielle et agricole, avec un front de mer prisé des surfeurs. Les projets y sont surtout d'ordre résidentiel — maisons individuelles, parfois isolées — avec une vraie sensibilité à la résistance du matériel face aux embruns de la côte au vent.",
    mapPosition: { x: 428, y: 138 },
  },
  {
    slug: "petit-bourg",
    nom: "Petit-Bourg",
    region: "Basse-Terre",
    contenuSpecifique:
      "Petit-Bourg, à l'entrée de la Basse-Terre côté isthme, est une commune étendue qui va du littoral aux premiers reliefs du Parc national. Elle mêle zones résidentielles, activité agricole et quartiers comme Vernou ou Pointe-à-Bacchus. La dispersion de l'habitat y rend la vidéosurveillance périphérique et l'alarme sans fil particulièrement utiles.",
    mapPosition: { x: 194, y: 190 },
  },
  {
    slug: "basse-terre",
    nom: "Basse-Terre",
    region: "Basse-Terre",
    contenuSpecifique:
      "Basse-Terre est la préfecture de la Guadeloupe — le siège administratif du département, au pied du volcan de la Soufrière. Le centre-ville concentre administrations, commerces et habitat ancien resserré, avec des enjeux de sécurisation de locaux professionnels et de biens en centre historique.",
    mapPosition: { x: 163, y: 302 },
  },
  {
    slug: "saint-claude",
    nom: "Saint-Claude",
    region: "Basse-Terre",
    contenuSpecifique:
      "Saint-Claude, sur les hauteurs au-dessus de Basse-Terre, est une commune résidentielle au climat plus frais, porte d'entrée vers la Soufrière. L'habitat y est souvent pavillonnaire, parfois isolé en pleine végétation, ce qui appelle une attention particulière à la portée du signal sans fil et à la protection contre l'humidité.",
    mapPosition: { x: 168, y: 282 },
  },
  {
    slug: "sainte-rose",
    nom: "Sainte-Rose",
    region: "Basse-Terre",
    contenuSpecifique:
      "Sainte-Rose, au nord de la Basse-Terre, s'étend entre littoral et forêt, avec des secteurs comme Sofaïa ou Grande Anse. Commune vaste et moins dense, elle concerne surtout des habitations individuelles et des propriétés parfois en zone rurale, où la vidéosurveillance extérieure et l'autonomie du matériel sont clés.",
    mapPosition: { x: 138, y: 100 },
  },
  {
    slug: "lamentin",
    nom: "Lamentin",
    region: "Basse-Terre",
    contenuSpecifique:
      "Lamentin, en position centrale côté Basse-Terre, garde un caractère agricole marqué (bananeraies) autour d'un bourg résidentiel. Les projets y sont principalement des maisons individuelles avec dépendances, où la surveillance du terrain et des accès extérieurs prime souvent sur l'intérieur.",
    mapPosition: { x: 128, y: 190 },
  },
  {
    slug: "capesterre-belle-eau",
    nom: "Capesterre-Belle-Eau",
    region: "Basse-Terre",
    contenuSpecifique:
      "Capesterre-Belle-Eau, au sud-est de la Basse-Terre, est connue pour son activité agricole (bananeraies) et la proximité des Chutes du Carbet. L'habitat, réparti entre le bourg et des quartiers comme Routhiers, est surtout résidentiel, avec un vrai besoin de protection contre l'humidité et les fortes précipitations propres à ce versant de l'île.",
    mapPosition: { x: 196, y: 268 },
  },
  {
    slug: "morne-a-leau",
    nom: "Morne-à-l'Eau",
    region: "Grande-Terre",
    contenuSpecifique:
      "Morne-à-l'Eau, au centre de la Grande-Terre, est notamment connue pour son cimetière en damier. Commune à dominante résidentielle et agricole, elle combine un bourg actif et des zones pavillonnaires en périphérie, avec des besoins classiques d'alarme et de vidéosurveillance pour les maisons individuelles.",
    mapPosition: { x: 300, y: 140 },
  },
  {
    slug: "port-louis",
    nom: "Port-Louis",
    region: "Grande-Terre",
    contenuSpecifique:
      "Port-Louis, au nord de la Grande-Terre, garde une identité de village de pêcheurs, avec des plages comme celle du Souffleur. Commune plus calme et moins dense, elle concerne surtout des résidences individuelles, parfois secondaires, où la surveillance à distance pendant les absences prend tout son sens.",
    mapPosition: { x: 320, y: 104 },
  },
  {
    slug: "deshaies",
    nom: "Deshaies",
    region: "Basse-Terre",
    contenuSpecifique:
      "Deshaies, à la pointe nord-ouest de la Basse-Terre, est un village côtier touristique connu pour son jardin botanique et son littoral préservé. Locations saisonnières, villas et résidences secondaires y sont fréquentes, avec un besoin marqué de contrôle d'accès autonome et de supervision à distance entre deux séjours.",
    mapPosition: { x: 110, y: 80 },
  },
  {
    slug: "bouillante",
    nom: "Bouillante",
    region: "Basse-Terre",
    contenuSpecifique:
      "Bouillante, sur la côte ouest, est connue pour son activité géothermique et ses spots de plongée près de l'îlet Pigeon. L'habitat, réparti entre bourg et hameaux côtiers, est surtout résidentiel, avec des maisons parfois isolées en bord de mer où l'exposition directe aux embruns demande un matériel bien protégé.",
    mapPosition: { x: 100, y: 178 },
  },
  {
    slug: "trois-rivieres",
    nom: "Trois-Rivières",
    region: "Basse-Terre",
    contenuSpecifique:
      "Trois-Rivières, au sud de la Basse-Terre, est le point d'embarquement vers Les Saintes et abrite un parc archéologique de roches gravées. Commune à dominante résidentielle et agricole, elle présente des besoins similaires aux communes voisines du sud Basse-Terre : maisons individuelles, souvent avec un terrain à couvrir.",
    mapPosition: { x: 176, y: 330 },
  },
  {
    slug: "marie-galante",
    nom: "Marie-Galante",
    region: "Îles du Sud",
    contenuSpecifique:
      "Marie-Galante, île ronde au sud de la Guadeloupe accessible en ferry, garde un rythme rural marqué par les distilleries de rhum traditionnelles et l'agriculture. Les projets y concernent surtout des maisons individuelles et quelques commerces locaux, avec une contrainte logistique propre aux îles du sud à intégrer dans le planning d'intervention.",
    mapPosition: { x: 430, y: 340 },
  },
  {
    slug: "les-saintes",
    nom: "Les Saintes",
    region: "Îles du Sud",
    contenuSpecifique:
      "Les Saintes, archipel au sud de la Basse-Terre (Terre-de-Haut et Terre-de-Bas), vivent du tourisme et de la pêche autour d'une baie réputée. L'habitat resserré et les hébergements touristiques appellent des installations compactes, avec là aussi une logistique d'intervention adaptée à l'insularité.",
    mapPosition: { x: 160, y: 380 },
  },
  {
    slug: "la-desirade",
    nom: "La Désirade",
    region: "Îles du Sud",
    contenuSpecifique:
      "La Désirade, petite île aride à l'est de la Grande-Terre, a un habitat dispersé et une population restreinte. Les projets y sont ponctuels et essentiellement résidentiels ; la logistique d'intervention (liaison maritime) est un paramètre à anticiper dès la prise de contact.",
    mapPosition: { x: 490, y: 165 },
  },
];

export function getVilleBySlug(slug: string): Ville | undefined {
  return villes.find((v) => v.slug === slug);
}
