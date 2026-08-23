import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import { PageShell } from "@/components/ui/page-shell";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const description =
  "Interphonie, digicode et contrôle d'accès pour maisons, commerces, entreprises et copropriétés en Guadeloupe.";

export const metadata = pageMetadata({
  title: "Contrôle d'accès & interphonie",
  description,
  path: "/controle-acces",
});

const solutions = [
  {
    titre: "Interphonie",
    description:
      "Audio ou vidéo, pour identifier un visiteur avant d'ouvrir — à l'entrée d'une maison, d'un commerce ou d'un immeuble.",
  },
  {
    titre: "Digicode",
    description:
      "Code d'accès simple pour un usage collectif (copropriété, local commun), sans gestion de badges individuels.",
  },
  {
    titre: "Contrôle d'accès par badge",
    description:
      "Droits d'accès individuels et traçabilité des entrées — pertinent pour les entreprises et sites avec plusieurs zones.",
  },
  {
    titre: "Serrures connectées",
    description:
      "Accès autonome pour les locations courtes ou saisonnières, sans remise de clé physique.",
  },
];

export default function ControleAccesPage() {
  return (
    <PageShell
      kicker="Pilier"
      title="Contrôle d'accès & interphonie"
      intro="Savoir qui entre, quand, et pouvoir gérer les accès sans reprendre l'installation à chaque changement — du digicode simple au contrôle d'accès par badge pour les sites à plusieurs zones."
    >
      <JsonLd
        data={serviceJsonLd({
          name: "Contrôle d'accès & interphonie",
          description,
          path: "/controle-acces",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Contrôle d'accès & interphonie", path: "/controle-acces" },
        ])}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {solutions.map((solution) => (
          <div key={solution.titre} className="border-slate/60 rounded-xl border p-5">
            <p className="font-display font-semibold">{solution.titre}</p>
            <p className="text-blanc/70 mt-2 text-sm">{solution.description}</p>
          </div>
        ))}
      </div>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">
          Un projet de contrôle d&apos;accès ? Décris-nous le site.
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
