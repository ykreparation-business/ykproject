export type Etape = { numero: string; titre: string; description: string };

export const etapes: Etape[] = [
  {
    numero: "01",
    titre: "Visite technique",
    description:
      "On se déplace sur site pour évaluer les points à couvrir et les contraintes du bâtiment.",
  },
  {
    numero: "02",
    titre: "Étude & devis",
    description:
      "Proposition de matériel adaptée au site et au budget, avec un devis détaillé et sans surprise.",
  },
  {
    numero: "03",
    titre: "Installation",
    description:
      "Pose du matériel, câblage ou installation sans fil selon la configuration retenue.",
  },
  {
    numero: "04",
    titre: "Configuration & formation",
    description:
      "Réglage de l'application, tests de détection, prise en main avec les utilisateurs.",
  },
  {
    numero: "05",
    titre: "Maintenance",
    description: "Suivi dans la durée et SAV local en cas de besoin.",
  },
];
