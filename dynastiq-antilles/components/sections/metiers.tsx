import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { metiers } from "@/content/metiers";

export function Metiers() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Nos 4 métiers
        </h2>
      </Reveal>

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metiers.map((metier) => (
          <StaggerItem key={metier.titre}>
            <Link
              href={metier.href}
              className="border-slate/60 hover:border-teal group block h-full rounded-xl border p-6 transition-colors"
            >
              <p className="font-display group-hover:text-teal text-lg font-semibold transition-colors">
                {metier.titre}
              </p>
              <p className="text-blanc/70 mt-3 text-sm leading-relaxed">
                {metier.description}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
