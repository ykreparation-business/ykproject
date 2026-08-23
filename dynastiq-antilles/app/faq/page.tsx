import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { PageShell } from "@/components/ui/page-shell";
import { faq } from "@/content/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Questions fréquentes sur l'installation de vidéosurveillance et d'alarme en Guadeloupe.",
  path: "/faq",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.reponse,
    },
  })),
};

export default function FaqPage() {
  return (
    <PageShell kicker="FAQ" title="Questions fréquentes">
      <JsonLd data={faqJsonLd} />
      <FaqList items={faq} />
    </PageShell>
  );
}
