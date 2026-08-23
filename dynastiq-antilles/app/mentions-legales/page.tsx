import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales de ${site.nom}.`,
  path: "/mentions-legales",
});

// Contenu légal complet à rédiger en Phase 7. Les champs de content/site.ts
// marqués "À CONFIRMER" doivent être remplacés par les vraies informations
// de l'entreprise avant publication.
export default function MentionsLegalesPage() {
  return (
    <PageShell kicker="Légal" title="Mentions légales">
      <TodoNote>
        Contenu légal complet à rédiger en Phase 7 (raison sociale, SIRET, directeur de
        publication, hébergeur, assurance) une fois les informations réelles confirmées.
      </TodoNote>

      <section>
        <h2 className="font-display text-lg font-semibold">Éditeur du site</h2>
        <p className="text-blanc/75 mt-2 text-sm">
          {site.nom}
          <br />
          SIRET : {site.siret}
          <br />
          {site.adresse}
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Directeur de publication</h2>
        <p className="text-blanc/75 mt-2 text-sm">À confirmer.</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Hébergement</h2>
        <p className="text-blanc/75 mt-2 text-sm">À confirmer.</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Assurance</h2>
        <p className="text-blanc/75 mt-2 text-sm">{site.assurance}</p>
      </section>
    </PageShell>
  );
}
