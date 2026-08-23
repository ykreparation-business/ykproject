import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Politique de confidentialité et RGPD de ${site.nom}.`,
  path: "/politique-de-confidentialite",
});

// Politique RGPD complète à rédiger en Phase 7 (finalité, base légale,
// durée de conservation, destinataires, droits, réclamation CNIL).
export default function PolitiqueConfidentialitePage() {
  return (
    <PageShell kicker="Légal" title="Politique de confidentialité">
      <TodoNote>
        Politique RGPD complète à rédiger en Phase 7 : finalité du formulaire, base
        légale, durée de conservation, destinataires, droits (accès, rectification,
        effacement, opposition), contact, réclamation CNIL.
      </TodoNote>

      <section>
        <h2 className="font-display text-lg font-semibold">Données collectées</h2>
        <p className="text-blanc/75 mt-2 text-sm">
          Le formulaire de devis collecte nom, téléphone, email, commune et les
          informations relatives au projet, dans le seul but de répondre à la demande de
          devis.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Contact</h2>
        <p className="text-blanc/75 mt-2 text-sm">
          Pour toute question relative à tes données, contacte-nous à{" "}
          <a href={`mailto:${site.email}`} className="text-teal hover:underline">
            {site.email}
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
