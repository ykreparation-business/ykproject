import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { marques } from "@/content/marques";

export const metadata: Metadata = {
  title: "Vidéosurveillance",
  description:
    "Installation et configuration de caméras de vidéosurveillance en Guadeloupe — Hikvision, Dahua, Safire.",
};

export default function VideosurveillancePage() {
  return (
    <PageShell
      kicker="Pilier"
      title="Vidéosurveillance : caméras & enregistrement"
      intro="Nous installons et configurons des systèmes de vidéosurveillance adaptés au bâtiment et au budget — caméras extérieures et intérieures, enregistreur local, application de consultation à distance. Installateur et intégrateur, pas revendeur de boîtes : le matériel est choisi pour le site, pas l'inverse."
    >
      <section>
        <h2 className="font-display text-xl font-semibold">
          Ce que couvre l&apos;installation
        </h2>
        <ul className="text-blanc/75 mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Étude des points à couvrir et des angles de champ",
            "Choix de caméras adaptées (résolution, focale, vision nocturne)",
            "Enregistreur (NVR/DVR) avec durée de rétention définie",
            "Configuration de l'application de consultation à distance",
            "Câblage PoE ou installation sans fil selon le site",
            "Protection contre le climat antillais (IP66/IP67, parafoudre)",
          ].map((item) => (
            <li
              key={item}
              className="border-slate/60 rounded-lg border px-4 py-3 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Les marques que nous installons
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {marques.map((marque) => (
            <Link
              key={marque.slug}
              href={`/videosurveillance/${marque.slug}`}
              className="border-slate/60 hover:border-teal block rounded-xl border p-5 transition-colors"
            >
              <p className="font-display text-lg font-semibold">{marque.nom}</p>
              <p className="text-blanc/70 mt-2 text-sm">{marque.positionnement}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">
          Un projet de vidéosurveillance ? Décris-nous le site.
        </p>
        <Link
          href="/devis"
          className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Demander un devis
        </Link>
      </div>
    </PageShell>
  );
}
