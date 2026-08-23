const noms = ["Hikvision", "Dahua", "Safire", "Ajax"];

// Traitement typographique monochrome des noms de marques — nous n'hébergeons
// pas les logos officiels des fabricants (droits d'usage à obtenir
// séparément). À remplacer par les logos vectoriels réels une fois les
// autorisations confirmées.
export function MarquesMarquee() {
  const track = [...noms, ...noms];

  return (
    <section className="border-slate/60 bg-nuit-deep border-b py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-blanc/50 mb-6 text-center font-mono text-xs tracking-widest uppercase">
          Installateur et intégrateur — pas revendeur de boîtes
        </p>
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-16">
            {track.map((nom, i) => (
              <span
                key={`${nom}-${i}`}
                className="font-display text-blanc/40 hover:text-teal text-2xl font-semibold tracking-tight whitespace-nowrap transition-colors"
              >
                {nom}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
