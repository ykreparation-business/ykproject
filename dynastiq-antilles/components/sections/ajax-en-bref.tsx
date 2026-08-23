import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ajax } from "@/content/marques";

export function AjaxEnBref() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <Reveal>
          <div className="border-slate/60 flex aspect-square items-center justify-center rounded-2xl border">
            <div className="border-teal/40 bg-nuit-deep relative flex size-24 items-center justify-center rounded-xl border">
              <span className="bg-teal absolute size-3 animate-pulse rounded-full" />
              <span className="text-teal/60 font-mono text-xs tracking-widest uppercase">
                Hub
              </span>
            </div>
          </div>
          <p className="text-blanc/50 mt-4 text-center font-mono text-xs tracking-widest uppercase">
            LED d&apos;état — pulse doucement
          </p>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-teal font-mono text-xs tracking-widest uppercase">
              Alarme sans fil
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              {ajax.nom} en bref
            </h2>
            <p className="text-blanc/70 mt-4 max-w-2xl">{ajax.intro}</p>
          </Reveal>

          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
            {ajax.points.map((point) => (
              <StaggerItem key={point.titre}>
                <div className="border-slate/60 h-full rounded-xl border p-5">
                  <p className="font-display font-semibold">{point.titre}</p>
                  <p className="text-blanc/70 mt-2 text-sm">{point.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Link
            href="/alarme-ajax"
            className="text-teal mt-6 inline-block text-sm font-medium hover:underline"
          >
            En savoir plus sur Ajax →
          </Link>
        </div>
      </div>
    </section>
  );
}
