import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { villes } from "@/content/villes";

const VIEWBOX = { width: 500, height: 400 };

// Silhouette schématique de la Guadeloupe (Basse-Terre à l'ouest, Grande-Terre
// à l'est, reliées par l'isthme de la Rivière Salée) — dessinée à la main,
// à but d'orientation, pas une carte géographique précise.
const BASSE_TERRE =
  "M 178 55 L 145 78 L 108 128 L 88 195 L 92 268 L 128 328 L 165 355 L 205 322 L 218 250 L 212 178 L 196 108 Z";
const GRANDE_TERRE =
  "M 218 148 L 258 108 L 318 88 L 380 98 L 432 128 L 458 168 L 448 208 L 398 230 L 338 240 L 280 222 L 232 198 Z";

export function ZonesCarte() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Zones d&apos;intervention
        </h2>
        <p className="text-blanc/60 mt-2 max-w-xl text-sm">
          {
            "Intervention sur toute la Guadeloupe. Sélectionne une commune pour voir le détail."
          }
        </p>
      </Reveal>

      <Reveal
        delay={0.1}
        className="border-slate/60 bg-nuit-deep relative mt-10 rounded-2xl border p-6"
      >
        <svg
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          className="h-auto w-full"
          aria-hidden
        >
          <path
            d={BASSE_TERRE}
            fill="var(--slate)"
            fillOpacity={0.25}
            stroke="var(--teal)"
            strokeWidth={1.5}
          />
          <path
            d={GRANDE_TERRE}
            fill="var(--slate)"
            fillOpacity={0.25}
            stroke="var(--teal)"
            strokeWidth={1.5}
          />
          <line
            x1={212}
            y1={178}
            x2={232}
            y2={178}
            stroke="var(--teal)"
            strokeWidth={1.5}
          />
        </svg>

        {villes.map((ville) => (
          <Link
            key={ville.slug}
            href={`/zones/${ville.slug}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(ville.mapPosition.x / VIEWBOX.width) * 100}%`,
              top: `${(ville.mapPosition.y / VIEWBOX.height) * 100}%`,
            }}
          >
            <span className="group-hover:bg-amber bg-teal group-focus-visible:ring-teal group-focus-visible:ring-offset-nuit-deep block size-2 rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-offset-2" />
            <span className="text-blanc/60 group-hover:text-teal absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] whitespace-nowrap transition-colors">
              {ville.nom}
            </span>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
