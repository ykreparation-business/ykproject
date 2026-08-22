import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { realisations } from "@/content/realisations";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Études de cas d'installations de vidéosurveillance et d'alarme en Guadeloupe.",
};

export default function RealisationsPage() {
  return (
    <PageShell
      kicker="Études de cas"
      title="Réalisations"
      intro="Quelques exemples de sites accompagnés — contexte, matériel posé, résultat."
    >
      <TodoNote>
        Ces trois cas sont des exemples de structure, à remplacer par de vraies études de
        cas (avec l&apos;accord du client pour la publication) — voir
        content/realisations.ts.
      </TodoNote>

      <div className="grid gap-6 sm:grid-cols-3">
        {realisations.map((cas) => (
          <article key={cas.slug} className="border-slate/60 rounded-xl border p-5">
            <h2 className="font-display font-semibold">{cas.titre}</h2>
            <p className="text-blanc/70 mt-3 text-sm">{cas.contexte}</p>
            <p className="text-blanc/50 mt-4 font-mono text-xs tracking-widest uppercase">
              Matériel
            </p>
            <ul className="text-blanc/75 mt-1 space-y-1 text-sm">
              {cas.materiel.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            <p className="text-teal mt-4 text-sm">{cas.resultat}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
