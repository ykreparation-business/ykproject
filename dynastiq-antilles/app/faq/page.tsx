import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { faq } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur l'installation de vidéosurveillance et d'alarme en Guadeloupe.",
};

export default function FaqPage() {
  return (
    <PageShell kicker="FAQ" title="Questions fréquentes">
      <div className="divide-slate/60 divide-y">
        {faq.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="hover:text-teal flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.question}
              <span
                aria-hidden
                className="text-blanc/40 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-blanc/70 mt-3 text-sm leading-relaxed">{item.reponse}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
