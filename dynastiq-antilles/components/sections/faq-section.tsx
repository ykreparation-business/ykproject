import { Reveal } from "@/components/motion/reveal";
import { FaqList } from "@/components/ui/faq-list";
import { faq } from "@/content/faq";

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Questions fréquentes
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <FaqList items={faq} />
      </Reveal>
    </section>
  );
}
