import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { realisations } from "@/content/realisations";

export function RealisationsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Réalisations
          </h2>
          <p className="text-blanc/60 mt-2 text-sm">
            Trois exemples de sites accompagnés — contexte, matériel posé, résultat.
          </p>
        </div>
        <Link
          href="/realisations"
          className="text-teal text-sm font-medium hover:underline"
        >
          Toutes les réalisations →
        </Link>
      </Reveal>

      <Stagger className="mt-10 grid gap-6 sm:grid-cols-3">
        {realisations.map((cas) => (
          <StaggerItem key={cas.slug}>
            <article className="border-slate/60 h-full rounded-xl border p-6">
              <h3 className="font-display font-semibold">{cas.titre}</h3>
              <p className="text-blanc/70 mt-3 text-sm">{cas.contexte}</p>
              <p className="text-teal mt-4 text-sm">{cas.resultat}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
