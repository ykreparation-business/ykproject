import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { secteurs } from "@/content/secteurs";

const secteur = secteurs.find((s) => s.slug === "entreprises")!;

export const metadata: Metadata = { title: secteur.titre, description: secteur.intro };

export default function EntreprisesPage() {
  return (
    <PageShell kicker="Secteur" title={secteur.titre} intro={secteur.intro}>
      <ul className="text-blanc/75 grid gap-3 sm:grid-cols-2">
        {secteur.enjeux.map((enjeu) => (
          <li key={enjeu} className="border-slate/60 rounded-lg border px-4 py-3 text-sm">
            {enjeu}
          </li>
        ))}
      </ul>
      <Link
        href="/devis"
        className="hover:bg-teal-deep bg-teal text-blanc inline-block rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
      >
        Demander un devis
      </Link>
    </PageShell>
  );
}
