import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { getVilleBySlug, villes } from "@/content/villes";
import { site } from "@/content/site";
import { breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return villes.map((v) => ({ ville: v.slug }));
}

export async function generateMetadata(
  props: PageProps<"/zones/[ville]">,
): Promise<Metadata> {
  const { ville: villeSlug } = await props.params;
  const ville = getVilleBySlug(villeSlug);
  if (!ville) return {};
  const path = `/zones/${ville.slug}`;
  const description = `${site.nom} installe vidéosurveillance, alarme Ajax et contrôle d'accès à ${ville.nom}, Guadeloupe.`;
  return {
    title: `Vidéosurveillance & alarme à ${ville.nom}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `Vidéosurveillance & alarme à ${ville.nom} — ${site.nom}`,
      description,
      url: `${site.siteUrl}${path}`,
      siteName: site.nom,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function VillePage(props: PageProps<"/zones/[ville]">) {
  const { ville: villeSlug } = await props.params;
  const ville = getVilleBySlug(villeSlug);
  if (!ville) notFound();

  return (
    <PageShell
      kicker={`Zone d'intervention · ${ville.region}`}
      title={`Vidéosurveillance & alarme à ${ville.nom}`}
      intro={
        ville.contenuSpecifique ??
        `${site.nom} intervient à ${ville.nom} pour l'installation et la maintenance de vidéosurveillance, d'alarme sans fil Ajax et de contrôle d'accès.`
      }
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Zones d'intervention", path: "/#zones" },
          { name: ville.nom, path: `/zones/${ville.slug}` },
        ])}
      />

      {!ville.contenuSpecifique ? (
        <TodoNote>
          Contenu spécifique à {ville.nom} à rédiger (quartiers desservis, contexte local,
          délai d&apos;intervention réel) — voir content/villes.ts.
        </TodoNote>
      ) : null}

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">Un projet à {ville.nom} ?</p>
        <Link
          href="/devis"
          className="hover:bg-teal-deep bg-teal rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Demander un devis
        </Link>
      </div>
    </PageShell>
  );
}
