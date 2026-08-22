import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { formules } from "@/content/tarifs";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Formules et fourchettes de prix pour l'installation de vidéosurveillance et d'alarme en Guadeloupe.",
};

export default function TarifsPage() {
  return (
    <PageShell
      kicker="Tarifs"
      title="Formules & fourchettes de prix"
      intro="Chaque projet est différent : le prix dépend du nombre de points à couvrir, du matériel choisi et de la configuration du site. Voici la structure des formules ; le montant exact est confirmé après étude."
    >
      <TodoNote>
        Fourchettes de prix à confirmer avec l&apos;entreprise avant mise en production —
        voir content/tarifs.ts. Aucun montant n&apos;est inventé.
      </TodoNote>

      <div className="grid gap-6 sm:grid-cols-3">
        {formules.map((formule) => (
          <div
            key={formule.nom}
            className="border-slate/60 flex flex-col rounded-xl border p-6"
          >
            <p className="font-display text-lg font-semibold">{formule.nom}</p>
            <p className="text-blanc/60 mt-1 text-sm">{formule.pourQui}</p>
            <ul className="text-blanc/75 mt-4 flex-1 space-y-2 text-sm">
              {formule.inclus.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            <p className="text-amber mt-6 font-mono text-sm">{formule.fourchette}</p>
          </div>
        ))}
      </div>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">Obtiens un chiffrage précis pour ton projet.</p>
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
