import type { Metadata } from "next";
import { site } from "@/content/site";

// Construit une Metadata cohérente (canonical + Open Graph + Twitter card)
// pour une page statique. path commence par "/".
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${site.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — ${site.nom}`,
      description,
      url,
      siteName: site.nom,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.nom}`,
      description,
    },
  };
}

// Dépend entièrement de content/site.ts : une fois les champs "À CONFIRMER"
// remplacés par les vraies valeurs, ce JSON-LD reflète automatiquement les
// bonnes informations. Aucune coordonnée géographique (geo) n'est incluse
// tant que l'adresse réelle n'est pas connue — mieux vaut l'omettre qu'en
// inventer une.
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    name: site.nom,
    description: site.baseline,
    url: site.siteUrl,
    telephone: site.telephoneHref.replace("tel:", ""),
    email: site.email,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Guadeloupe",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "Guadeloupe",
      addressCountry: "GP",
    },
  };
}

export function serviceJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    url: `${site.siteUrl}${path}`,
    provider: {
      "@type": "LocalBusiness",
      name: site.nom,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Guadeloupe",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.siteUrl}${item.path}`,
    })),
  };
}
