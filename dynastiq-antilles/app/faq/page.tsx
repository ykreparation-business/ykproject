import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { FaqList } from "@/components/ui/faq-list";
import { faq } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur l'installation de vidéosurveillance et d'alarme en Guadeloupe.",
};

export default function FaqPage() {
  return (
    <PageShell kicker="FAQ" title="Questions fréquentes">
      <FaqList items={faq} />
    </PageShell>
  );
}
