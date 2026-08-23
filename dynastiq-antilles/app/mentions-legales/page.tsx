import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales de ${site.nom}.`,
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return (
    <PageShell kicker="Légal" title="Mentions légales">
      <TodoNote>
        Les champs de content/site.ts marqués « À CONFIRMER » (SIRET, adresse, téléphone,
        assurance) doivent être remplacés par les vraies informations de l&apos;entreprise
        avant mise en production. Le directeur de publication doit être identifié
        nommément.
      </TodoNote>

      <section>
        <h2 className="font-display text-lg font-semibold">Éditeur du site</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          {site.nom}
          <br />
          SIRET : {site.siret}
          <br />
          {site.adresse}
          <br />
          Téléphone : {site.telephone}
          <br />
          Email :{" "}
          <a href={`mailto:${site.email}`} className="text-teal hover:underline">
            {site.email}
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Directeur de publication</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          À confirmer — nom du représentant légal de {site.nom}.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Hébergement</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Vercel Inc.
          <br />
          340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
          <br />
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            vercel.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Assurance professionnelle</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">{site.assurance}</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Propriété intellectuelle</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          L&apos;ensemble des contenus de ce site (textes, structure, éléments graphiques)
          est la propriété de {site.nom}, sauf mention contraire. Toute reproduction sans
          autorisation est interdite.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Données personnelles</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Le traitement des données personnelles collectées sur ce site est détaillé dans
          la{" "}
          <a href="/politique-de-confidentialite" className="text-teal hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
