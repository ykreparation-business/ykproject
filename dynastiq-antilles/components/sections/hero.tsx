import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section className="bg-supervision border-slate/60 relative overflow-hidden border-b">
      <Parallax amplitude={24} className="pointer-events-none absolute inset-0">
        <svg
          aria-hidden
          className="h-full w-full opacity-[0.08]"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </Parallax>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-28 text-center sm:py-36">
        <p className="text-teal font-mono text-xs tracking-widest uppercase">
          Installateur & intégrateur — Guadeloupe
        </p>
        <h1 className="font-display mt-4 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-6xl">
          <SplitText text="Vidéosurveillance & alarme," />
          <br />
          <SplitText text="installées et suivies sur l'île." />
        </h1>
        <p className="text-blanc/75 mx-auto mt-6 max-w-xl text-lg">
          Étude, installation, configuration de l&apos;application et SAV local — un seul
          interlocuteur du premier appel à la maintenance.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <Link
              href="/devis"
              className="hover:bg-teal-deep bg-teal text-blanc inline-block rounded-full px-7 py-3.5 font-medium transition-colors"
            >
              Demander un devis
            </Link>
          </Magnetic>
          <Magnetic>
            <a
              href={site.telephoneHref}
              data-cursor="APPELER"
              className="hover:bg-amber/10 border-amber text-amber inline-block rounded-full border px-7 py-3.5 font-medium transition-colors"
            >
              Appeler {site.telephone}
            </a>
          </Magnetic>
        </div>

        <p className="text-blanc/50 mt-10 font-mono text-xs tracking-widest uppercase">
          Intervention {site.zones} · Devis gratuit · Matériel garanti · SAV local
        </p>
      </div>
    </section>
  );
}
