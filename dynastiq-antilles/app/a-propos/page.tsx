import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `${site.nom}, installateur de vidéosurveillance et d'alarme en Guadeloupe.`,
};

export default function AProposPage() {
  return (
    <PageShell
      kicker="À propos"
      title={site.nom}
      intro={`${site.nom} installe et configure des systèmes de vidéosurveillance, d'alarme sans fil et de contrôle d'accès en Guadeloupe, pour les particuliers, commerces, entreprises, copropriétés et l'hôtellerie.`}
    >
      <p className="text-blanc/75">
        Chaque installation est étudiée pour le bâtiment et le climat antillais : boîtiers
        et visserie adaptés à la corrosion saline, indices de protection IP66/IP67 pour
        l&apos;extérieur, protection contre la foudre et les coupures secteur. Le matériel
        est choisi pour le site, pas l&apos;inverse — installateur et intégrateur, pas
        revendeur de boîtes.
      </p>

      <TodoNote>
        Historique de l&apos;entreprise, années d&apos;expérience, nombre de sites
        protégés et présentation de l&apos;équipe à confirmer et sourcer avant publication
        — voir content/site.ts.
      </TodoNote>
    </PageShell>
  );
}
