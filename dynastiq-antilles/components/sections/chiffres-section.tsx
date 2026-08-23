import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { chiffres } from "@/content/chiffres";

export function ChiffresSection() {
  return (
    <section className="border-slate/60 bg-nuit-deep border-y">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {chiffres.map((chiffre, i) => (
            <Reveal key={chiffre.label} delay={i * 0.1} className="text-center">
              <p className="font-display text-teal text-4xl font-semibold sm:text-5xl">
                <Counter value={chiffre.valeur} suffix={chiffre.suffixe} />
              </p>
              <p className="text-blanc/60 mt-2 text-sm">{chiffre.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
