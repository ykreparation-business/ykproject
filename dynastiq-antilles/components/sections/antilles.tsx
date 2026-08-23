import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { pointsAntilles } from "@/content/antilles";

export function Antilles() {
  return (
    <section className="border-slate/60 bg-nuit-deep border-y">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-teal font-mono text-xs tracking-widest uppercase">
            Différenciant
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            <SplitText text="Conçu pour les Antilles" />
          </h2>
          <p className="text-blanc/70 mt-4 max-w-2xl text-lg">
            Le climat antillais use le matériel plus vite qu&apos;en métropole. Chaque
            installation en tient compte, dès le choix du matériel.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pointsAntilles.map((point) => (
            <StaggerItem key={point.titre}>
              <div className="border-slate/60 bg-nuit h-full rounded-xl border p-6">
                <p className="font-display text-amber font-semibold">{point.titre}</p>
                <p className="text-blanc/50 mt-3 text-sm">{point.probleme}</p>
                <p className="text-blanc/80 mt-3 text-sm leading-relaxed">
                  {point.reponse}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
