import Image from "next/image";
import { site } from "@/content/site";

const palette = [
  { name: "nuit", value: "var(--nuit)" },
  { name: "teal", value: "var(--teal)" },
  { name: "teal-deep", value: "var(--teal-deep)" },
  { name: "slate", value: "var(--slate)" },
  { name: "amber", value: "var(--amber)" },
  { name: "vermillon", value: "var(--vermillon)" },
] as const;

export default function Home() {
  return (
    <main className="bg-supervision flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <Image
        src="/brand/logo.svg"
        alt={site.nom}
        width={120}
        height={150}
        priority
        className="relative z-10"
      />

      <div className="relative z-10 space-y-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {site.nom}
        </h1>
        <p className="text-blanc/80 mx-auto max-w-xl text-lg">{site.baseline}</p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="/devis"
          className="bg-teal text-blanc hover:bg-teal-deep rounded-full px-6 py-3 font-medium transition-colors"
        >
          Demander un devis
        </a>
        <a
          href={site.telephoneHref}
          className="border-amber text-amber hover:bg-amber/10 rounded-full border px-6 py-3 font-medium transition-colors"
        >
          Appeler {site.telephone}
        </a>
      </div>

      <p className="text-blanc/40 font-mono text-xs tracking-widest uppercase">
        Phase 1 — fondations en place
      </p>

      <ul className="relative z-10 flex flex-wrap justify-center gap-3">
        {palette.map((color) => (
          <li key={color.name} className="flex flex-col items-center gap-2">
            <span
              className="border-blanc/10 h-10 w-10 rounded-full border"
              style={{ background: color.value }}
            />
            <span className="text-blanc/50 font-mono text-[10px]">{color.name}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
