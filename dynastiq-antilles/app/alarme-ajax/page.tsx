import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { ajax } from "@/content/marques";

export const metadata: Metadata = {
  title: "Alarme sans fil Ajax",
  description:
    "Installation d'alarme sans fil Ajax en Guadeloupe : hub, détecteurs, MotionCam, pilotage par application.",
};

export default function AlarmeAjaxPage() {
  return (
    <PageShell kicker="Pilier" title="Alarme sans fil Ajax" intro={ajax.intro}>
      <div className="grid gap-4 sm:grid-cols-2">
        {ajax.points.map((point) => (
          <div key={point.titre} className="border-slate/60 rounded-xl border p-5">
            <p className="font-display font-semibold">{point.titre}</p>
            <p className="text-blanc/70 mt-2 text-sm">{point.description}</p>
          </div>
        ))}
      </div>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">Une alarme Ajax pour ton bien ? Parlons-en.</p>
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
