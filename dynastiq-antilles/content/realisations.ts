export type Realisation = {
  slug: string;
  titre: string;
  contexte: string;
  materiel: string[];
  resultat: string;
};

// À REMPLACER PAR DE VRAIS CHANTIERS. Aucun nom de client n'est inventé —
// ces trois cas sont des exemples de structure de contenu (contexte,
// matériel, résultat), à remplacer par de vraies études de cas une fois
// l'accord du client obtenu pour la publication.
export const realisations: Realisation[] = [
  {
    slug: "commerce-baie-mahault",
    titre: "Commerce — Baie-Mahault",
    contexte:
      "Boutique en zone commerciale, entrée unique, réserve à l'arrière, historique de démarque inconnue non expliquée.",
    materiel: [
      "4 caméras extérieures/intérieures",
      "Enregistreur avec 30 jours de rétention",
    ],
    resultat: "Couverture complète de la caisse, de la réserve et des accès.",
  },
  {
    slug: "villa-sainte-anne",
    titre: "Villa — Sainte-Anne",
    contexte:
      "Maison individuelle avec piscine et dépendance, propriétaire absent une partie de l'année.",
    materiel: [
      "Alarme Ajax (hub + détecteurs + sirène)",
      "2 caméras extérieures étanches IP66",
    ],
    resultat: "Surveillance à distance pendant les absences prolongées.",
  },
  {
    slug: "entrepot-jarry",
    titre: "Entrepôt — Jarry",
    contexte:
      "Site logistique, plusieurs accès, besoin de contrôle d'accès pour le personnel et les livreurs.",
    materiel: [
      "Contrôle d'accès par badge",
      "8 caméras périmétriques",
      "Onduleur + bascule 4G",
    ],
    resultat: "Traçabilité des accès et continuité de service en cas de coupure secteur.",
  },
];
