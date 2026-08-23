import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { marques } from "@/content/marques";
import { pageMetadata } from "@/lib/seo";

const marque = marques.find((m) => m.slug === "dahua")!;

export const metadata = pageMetadata({
  title: marque.nom,
  description: marque.positionnement,
  path: "/videosurveillance/dahua",
});

export default function DahuaPage() {
  return (
    <PageShell
      kicker="Vidéosurveillance"
      title={`Caméras ${marque.nom}`}
      intro={marque.intro}
    >
      <ul className="text-blanc/75 grid gap-3 sm:grid-cols-2">
        {marque.pointsForts.map((point) => (
          <li key={point} className="border-slate/60 rounded-lg border px-4 py-3 text-sm">
            {point}
          </li>
        ))}
      </ul>
      <p className="text-blanc/70 text-sm">
        Application de consultation :{" "}
        <span className="text-teal font-mono">{marque.application}</span> · Pour qui :{" "}
        {marque.pourQui}
      </p>
      <Link href="/devis" className="text-teal text-sm font-medium hover:underline">
        Demander un devis avec {marque.nom} →
      </Link>
    </PageShell>
  );
}
