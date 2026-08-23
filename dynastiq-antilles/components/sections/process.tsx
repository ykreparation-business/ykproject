import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { etapes } from "@/content/etapes";

export function Process() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Comment ça se passe
        </h2>
      </Reveal>

      <Stagger className="mt-10 grid gap-4 lg:grid-cols-5">
        {etapes.map((etape) => (
          <StaggerItem key={etape.numero}>
            <div className="border-slate/60 h-full rounded-xl border p-6">
              <p className="text-teal font-mono text-2xl">{etape.numero}</p>
              <p className="font-display mt-3 font-semibold">{etape.titre}</p>
              <p className="text-blanc/70 mt-2 text-sm leading-relaxed">
                {etape.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
