import { AjaxEnBref } from "@/components/sections/ajax-en-bref";
import { Antilles } from "@/components/sections/antilles";
import { ChiffresSection } from "@/components/sections/chiffres-section";
import { Comparatif } from "@/components/sections/comparatif";
import { CtaContact } from "@/components/sections/cta-contact";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { InteractivePlan } from "@/components/sections/interactive-plan";
import { MarquesMarquee } from "@/components/sections/marques-marquee";
import { Metiers } from "@/components/sections/metiers";
import { Process } from "@/components/sections/process";
import { RealisationsSection } from "@/components/sections/realisations-section";
import { ZonesCarte } from "@/components/sections/zones-carte";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarquesMarquee />

      <section className="border-slate/60 bg-nuit-deep border-b">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal>
            <p className="text-teal font-mono text-xs tracking-widest uppercase">
              Signature
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              <SplitText text="Vois ce qu'on recommande, avant même le devis" />
            </h2>
            <p className="text-blanc/70 mt-4 max-w-2xl">
              Choisis un type de bien, explore les points d&apos;équipement sur le plan,
              et découvre le matériel recommandé pour chacun — et pourquoi.
            </p>
          </Reveal>
          <div className="mt-10">
            <InteractivePlan />
          </div>
        </div>
      </section>

      <Metiers />
      <Antilles />
      <Process />
      <RealisationsSection />
      <Comparatif />
      <AjaxEnBref />
      <ChiffresSection />
      <ZonesCarte />
      <FaqSection />
      <CtaContact />
    </main>
  );
}
