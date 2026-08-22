// Constantes globales du site. Modifiable sans toucher aux composants.
// Champs marqués "À CONFIRMER" : à remplacer par les vraies valeurs de
// l'entreprise avant mise en production (voir README pour la procédure).

export const site = {
  nom: "Dynastiq Antilles",
  baseline: "Vidéosurveillance & alarme, installées et suivies en Guadeloupe", // À CONFIRMER
  telephone: "0590 00 00 00", // À CONFIRMER
  telephoneHref: "tel:+590590000000", // À CONFIRMER
  whatsapp: "https://wa.me/590690000000", // À CONFIRMER
  email: "contact@dynastiq-antilles.example", // À CONFIRMER
  adresse: "Adresse à confirmer, Guadeloupe", // À CONFIRMER
  siret: "000 000 000 00000", // À CONFIRMER
  zones: "toute la Guadeloupe", // À CONFIRMER
  horaires: "Lundi–vendredi 8h–18h, samedi 9h–13h", // À CONFIRMER
  assurance: "Assurance responsabilité civile professionnelle — À CONFIRMER",
  certifs: [
    // Aucune certification, agrément CNAPS ou label APSAD n'est affirmé
    // tant qu'il n'est pas confirmé et sourcé par l'entreprise.
  ] as const,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dynastiq-antilles.example",
} as const;
