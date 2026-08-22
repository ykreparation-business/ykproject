export type Secteur = {
  slug:
    | "particuliers"
    | "commerces"
    | "entreprises"
    | "coproprietes"
    | "hotellerie-locations";
  nom: string;
  titre: string;
  intro: string;
  enjeux: string[];
};

export const secteurs: Secteur[] = [
  {
    slug: "particuliers",
    nom: "Particuliers",
    titre: "Vidéosurveillance et alarme pour maisons et appartements",
    intro:
      "Une installation résidentielle en Guadeloupe doit tenir compte du climat autant que de la sécurité : boîtiers résistants au sel et à l'humidité, système qui continue de fonctionner en cas de coupure secteur, et une application simple à utiliser au quotidien.",
    enjeux: [
      "Surveillance des accès (portail, entrée principale, dépendances)",
      "Alarme sans fil, facile à armer/désarmer avant de sortir",
      "Consultation à distance pendant les absences prolongées",
      "Matériel extérieur résistant au climat antillais",
    ],
  },
  {
    slug: "commerces",
    nom: "Commerces",
    titre: "Vidéosurveillance pour commerces et boutiques",
    intro:
      "Un commerce a besoin d'une couverture fiable des points sensibles (caisse, réserve, entrée) et d'un système que l'équipe peut consulter facilement sans formation poussée.",
    enjeux: [
      "Couverture de la caisse, de la réserve et des accès",
      "Enregistrement exploitable en cas de litige ou de vol",
      "Alarme anti-intrusion en dehors des heures d'ouverture",
      "Panneaux d'information conformes (voir la page vidéoprotection)",
    ],
  },
  {
    slug: "entreprises",
    nom: "Entreprises",
    titre: "Sécurité électronique pour entreprises et sites professionnels",
    intro:
      "Bureaux, ateliers, entrepôts : chaque site professionnel a un périmètre et des usages différents. L'installation est étudiée site par site, avec une attention particulière portée à la continuité de service (onduleur, bascule 4G) sur les sites sensibles.",
    enjeux: [
      "Contrôle d'accès pour les zones sensibles",
      "Vidéosurveillance périmétrique et intérieure",
      "Continuité de fonctionnement en cas de coupure secteur",
      "Gestion multi-utilisateurs de l'application (direction, sécurité)",
    ],
  },
  {
    slug: "coproprietes",
    nom: "Copropriétés",
    titre: "Vidéosurveillance et contrôle d'accès pour copropriétés",
    intro:
      "Parties communes, parkings, accès résidents : une copropriété demande une installation pensée pour un usage collectif, avec des droits d'accès différenciés et une maintenance suivie dans la durée.",
    enjeux: [
      "Vidéosurveillance des parties communes et parkings",
      "Interphonie et contrôle d'accès résidents",
      "Gestion des droits d'accès (résidents, prestataires, syndic)",
      "Contrat de maintenance adapté à un usage collectif",
    ],
  },
  {
    slug: "hotellerie-locations",
    nom: "Hôtellerie & locations",
    titre: "Sécurité électronique pour hôtellerie et locations saisonnières",
    intro:
      "Hôtels, gîtes et locations saisonnières ont des contraintes spécifiques : accès autonome pour les voyageurs, surveillance des espaces communs, et supervision à distance entre deux séjours.",
    enjeux: [
      "Contrôle d'accès autonome (digicode, badge) pour les locations courtes",
      "Vidéosurveillance des espaces communs et extérieurs",
      "Consultation à distance entre deux séjours",
      "Discrétion : aucune caméra dans les espaces privatifs des clients",
    ],
  },
];
