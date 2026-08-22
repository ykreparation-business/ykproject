export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; links: NavLink[] };

export const navGroups: NavGroup[] = [
  {
    label: "Vidéosurveillance",
    links: [
      { label: "Vue d'ensemble", href: "/videosurveillance" },
      { label: "Hikvision", href: "/videosurveillance/hikvision" },
      { label: "Dahua", href: "/videosurveillance/dahua" },
      { label: "Safire", href: "/videosurveillance/safire" },
    ],
  },
  {
    label: "Alarme & accès",
    links: [
      { label: "Alarme sans fil Ajax", href: "/alarme-ajax" },
      { label: "Contrôle d'accès & interphonie", href: "/controle-acces" },
      { label: "Télésurveillance", href: "/telesurveillance" },
    ],
  },
  {
    label: "Secteurs",
    links: [
      { label: "Particuliers", href: "/secteurs/particuliers" },
      { label: "Commerces", href: "/secteurs/commerces" },
      { label: "Entreprises", href: "/secteurs/entreprises" },
      { label: "Copropriétés", href: "/secteurs/coproprietes" },
      { label: "Hôtellerie & locations", href: "/secteurs/hotellerie-locations" },
    ],
  },
];

export const topLevelLinks: NavLink[] = [
  { label: "Réalisations", href: "/realisations" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "FAQ", href: "/faq" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks: NavGroup[] = [
  ...navGroups,
  {
    label: "Entreprise",
    links: [
      { label: "Réalisations", href: "/realisations" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "FAQ", href: "/faq" },
      { label: "À propos", href: "/a-propos" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Demander un devis", href: "/devis" },
    ],
  },
  {
    label: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
      { label: "CGV", href: "/cgv" },
    ],
  },
];
