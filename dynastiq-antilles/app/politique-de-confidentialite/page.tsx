import { PageShell } from "@/components/ui/page-shell";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Politique de confidentialité et RGPD de ${site.nom}.`,
  path: "/politique-de-confidentialite",
});

export default function PolitiqueConfidentialitePage() {
  return (
    <PageShell
      kicker="Légal"
      title="Politique de confidentialité"
      intro={`Cette page explique quelles données ${site.nom} collecte, pourquoi, combien de temps elles sont conservées, et comment exercer tes droits.`}
    >
      <section>
        <h2 className="font-display text-lg font-semibold">Responsable de traitement</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          {site.nom} est responsable du traitement des données collectées sur ce site.
          Pour toute question, contacte-nous à{" "}
          <a href={`mailto:${site.email}`} className="text-teal hover:underline">
            {site.email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">
          Données collectées et finalité
        </h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Le formulaire de devis (page <em>/devis</em>) collecte : nom, téléphone, email,
          commune, et les informations relatives au projet (type de bien, besoin, surface,
          nombre de points à couvrir, message). Ces données sont utilisées dans le seul
          but de traiter la demande de devis et d&apos;y répondre — aucune autre finalité
          (pas de revente, pas de prospection sans lien avec la demande).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Base légale</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Le traitement repose sur l&apos;exécution de mesures précontractuelles prises à
          ta demande (article 6.1.b du RGPD) : tu nous contactes pour obtenir un devis,
          nous traitons tes données pour te répondre.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Durée de conservation</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Les données d&apos;une demande de devis sont conservées le temps nécessaire au
          traitement de la demande et au suivi commercial qui peut en découler, puis
          supprimées si aucune suite n&apos;est donnée. Si la demande aboutit à un
          contrat, les données utiles sont conservées pour la durée de la relation
          commerciale et les obligations légales (comptables, notamment).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Destinataires</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Les données du formulaire sont reçues par {site.nom} et transmises techniquement
          via Resend (service d&apos;envoi d&apos;emails) pour l&apos;acheminement des
          messages. Aucune donnée n&apos;est vendue ni partagée avec des tiers à des fins
          commerciales.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Tes droits</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Conformément au RGPD et à la loi Informatique et Libertés, tu disposes d&apos;un
          droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition sur
          tes données. Pour l&apos;exercer, contacte-nous à{" "}
          <a href={`mailto:${site.email}`} className="text-teal hover:underline">
            {site.email}
          </a>
          . Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une
          réclamation auprès de la{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            CNIL
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Cookies</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Ce site n&apos;utilise aucun cookie de mesure d&apos;audience sans ton
          consentement préalable — voir la bannière affichée lors de ta première visite.
          Ton choix (accepté/refusé) est mémorisé localement dans ton navigateur (stockage
          local, pas un cookie envoyé au serveur) pour ne pas te redemander à chaque
          visite.
        </p>
      </section>
    </PageShell>
  );
}
