import { Reveal } from "@/components/motion/reveal";
import { marques } from "@/content/marques";

export function Comparatif() {
  return (
    <section className="border-slate/60 bg-nuit-deep border-y">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Comparatif rapide
          </h2>
          <p className="text-blanc/60 mt-2 max-w-2xl text-sm">
            Un positionnement honnête, pas commercial — chaque marque a ses usages.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-slate/60 text-blanc/50 border-b font-mono text-xs tracking-widest uppercase">
                <th className="py-3 pr-4">Marque</th>
                <th className="py-3 pr-4">Positionnement</th>
                <th className="py-3 pr-4">Application</th>
                <th className="py-3">Pour qui</th>
              </tr>
            </thead>
            <tbody>
              {marques.map((marque) => (
                <tr key={marque.slug} className="border-slate/60 border-b">
                  <td className="text-teal py-4 pr-4 font-medium">{marque.nom}</td>
                  <td className="text-blanc/75 py-4 pr-4">{marque.positionnement}</td>
                  <td className="py-4 pr-4 font-mono text-xs">{marque.application}</td>
                  <td className="text-blanc/75 py-4">{marque.pourQui}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
