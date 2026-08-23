import { DevisForm } from "@/components/sections/devis-form";
import { PageShell } from "@/components/ui/page-shell";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Demander un devis",
  description: `Demande un devis gratuit à ${site.nom} pour ton projet de vidéosurveillance ou d'alarme.`,
  path: "/devis",
});

export default function DevisPage() {
  return (
    <PageShell
      kicker="Devis"
      title="Demander un devis"
      intro="4 questions rapides. Devis gratuit, sans engagement."
    >
      <DevisForm />
    </PageShell>
  );
}
