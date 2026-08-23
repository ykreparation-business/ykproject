import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "CGV",
  description: `Conditions générales de vente de ${site.nom}.`,
  path: "/cgv",
});

export default function CgvPage() {
  return (
    <PageShell
      kicker="Légal"
      title="Conditions générales de vente"
      intro={`Ces conditions régissent les prestations d'installation et de maintenance vendues par ${site.nom}.`}
    >
      <TodoNote>
        Les montants et durées ci-dessous (acompte, garantie, préavis de résiliation) sont
        des valeurs indicatives à valider avec l&apos;entreprise avant publication — ce
        sont des décisions commerciales, pas des règles inventées.
      </TodoNote>

      <section>
        <h2 className="font-display text-lg font-semibold">Objet</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Les présentes conditions s&apos;appliquent à toute prestation
          d&apos;installation, de configuration et de maintenance de systèmes de
          vidéosurveillance, d&apos;alarme et de contrôle d&apos;accès vendue par{" "}
          {site.nom} en Guadeloupe.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Devis et commande</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Chaque prestation fait l&apos;objet d&apos;un devis écrit, établi après étude du
          site. Le devis est valable pour la durée indiquée dessus. La commande est
          confirmée par l&apos;acceptation écrite du devis (signature ou accord explicite
          par email).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Acompte et paiement</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Un acompte peut être demandé à la commande, le solde étant réglé à la réception
          des travaux. Le détail exact (pourcentage de l&apos;acompte, moyens de paiement
          acceptés) est précisé sur chaque devis.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Délais d&apos;installation</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Le délai d&apos;installation est indiqué sur le devis à titre indicatif. Il peut
          être ajusté en fonction de la disponibilité du matériel, des conditions
          d&apos;accès au site ou d&apos;éléments imprévus (météo, contraintes techniques
          découvertes sur place).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Garantie matériel</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Le matériel installé bénéficie de la garantie légale de conformité et, le cas
          échéant, de la garantie constructeur. Une garantie commerciale complémentaire
          peut être proposée ; sa durée est précisée sur le devis.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Maintenance et SAV</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Les formules de maintenance et leurs modalités (fréquence des visites, délai
          d&apos;intervention en cas de panne, prestations incluses) sont décrites dans le
          contrat de maintenance associé, distinct du devis d&apos;installation initial.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Droit de rétractation</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Pour les contrats conclus hors établissement ou à distance avec un particulier,
          un délai de rétractation de 14 jours peut s&apos;appliquer conformément au code
          de la consommation, sous réserve des exceptions prévues par la loi (notamment
          lorsque l&apos;exécution a commencé à la demande expresse du client avant la fin
          de ce délai). Les modalités précises sont rappelées sur le devis lorsque ce
          droit s&apos;applique.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Résiliation</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          Les conditions de résiliation d&apos;un contrat de maintenance (préavis,
          modalités) sont précisées dans ce contrat. Pour une prestation
          d&apos;installation ponctuelle, toute annulation après le début des travaux peut
          donner lieu à facturation des prestations déjà réalisées et du matériel déjà
          commandé.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Litiges</h2>
        <p className="text-blanc/75 mt-2 text-sm leading-relaxed">
          En cas de litige, une solution amiable est recherchée en priorité. À défaut, les
          tribunaux compétents sont ceux du ressort du siège de {site.nom}, sous réserve
          des règles impératives applicables aux consommateurs.
        </p>
      </section>
    </PageShell>
  );
}
