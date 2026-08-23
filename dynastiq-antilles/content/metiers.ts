export type Metier = {
  titre: string;
  description: string;
  href: string;
};

export const metiers: Metier[] = [
  {
    titre: "Vidéosurveillance",
    description:
      "Caméras extérieures et intérieures, enregistrement local, consultation à distance.",
    href: "/videosurveillance",
  },
  {
    titre: "Alarme sans fil Ajax",
    description: "Détection, sirène, pilotage par application, sans câblage à tirer.",
    href: "/alarme-ajax",
  },
  {
    titre: "Contrôle d'accès & interphonie",
    description: "Digicode, badge, interphonie audio ou vidéo, serrures connectées.",
    href: "/controle-acces",
  },
  {
    titre: "Maintenance & SAV",
    description: "Suivi après installation, intervention locale, contrat adapté au site.",
    href: "/tarifs",
  },
];
