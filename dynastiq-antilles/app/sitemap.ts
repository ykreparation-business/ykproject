import type { MetadataRoute } from "next";
import { articles } from "@/content/blog";
import { site } from "@/content/site";
import { villes } from "@/content/villes";

const staticRoutes = [
  "",
  "/videosurveillance",
  "/videosurveillance/hikvision",
  "/videosurveillance/dahua",
  "/videosurveillance/safire",
  "/alarme-ajax",
  "/controle-acces",
  "/telesurveillance",
  "/secteurs/particuliers",
  "/secteurs/commerces",
  "/secteurs/entreprises",
  "/secteurs/coproprietes",
  "/secteurs/hotellerie-locations",
  "/realisations",
  "/tarifs",
  "/faq",
  "/a-propos",
  "/contact",
  "/devis",
  "/blog",
  "/videoprotection-obligations",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/cgv",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const villeEntries: MetadataRoute.Sitemap = villes.map((v) => ({
    url: `${site.siteUrl}/zones/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${site.siteUrl}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticEntries, ...villeEntries, ...articleEntries];
}
