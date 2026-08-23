export type PointAntilles = {
  titre: string;
  probleme: string;
  reponse: string;
};

export const pointsAntilles: PointAntilles[] = [
  {
    titre: "Corrosion saline",
    probleme: "L'air marin attaque rapidement les boîtiers et la visserie standard.",
    reponse:
      "Boîtiers et visserie adaptés à la corrosion saline, emplacements étudiés pour limiter l'exposition directe aux embruns.",
  },
  {
    titre: "Cyclones",
    probleme: "Vents violents, projections, pluies intenses en saison cyclonique.",
    reponse:
      "Indices de protection IP66/IP67 en extérieur, fixations renforcées, procédure de mise en sécurité du matériel avant l'arrivée d'un système.",
  },
  {
    titre: "Foudre & surtensions",
    probleme:
      "Les orages fréquents exposent les équipements électroniques aux surtensions.",
    reponse: "Parafoudres sur les lignes sensibles, protection dédiée des lignes PoE.",
  },
  {
    titre: "Coupures secteur",
    probleme:
      "Les coupures électriques ne préviennent pas — un système sans autonomie s'arrête net.",
    reponse:
      "Onduleur, autonomie batterie sur les points sensibles, bascule 4G en option pour rester joignable.",
  },
  {
    titre: "Chaleur & humidité",
    probleme:
      "La chaleur et l'humidité réduisent la durée de vie des équipements mal dimensionnés.",
    reponse:
      "Ventilation des baies techniques, dimensionnement des disques d'enregistrement adapté au climat.",
  },
];
