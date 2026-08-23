import { PageShell } from "@/components/ui/page-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Vidéoprotection : vos obligations",
  description:
    "Autorisation préfectorale, panneaux d'information, durée de conservation des images : ce qu'il faut savoir avant d'installer des caméras en Guadeloupe.",
  path: "/videoprotection-obligations",
});

export default function VideoprotectionObligationsPage() {
  return (
    <PageShell
      kicker="Guide"
      title="Vidéoprotection : vos obligations"
      intro="Installer des caméras n'est pas seulement une question technique : selon ce qu'elles filment, la loi impose des règles précises. Ce guide donne les grands principes — ce n'est pas un conseil juridique, et il ne remplace pas une vérification auprès des autorités compétentes."
    >
      <div className="border-vermillon/40 bg-vermillon/10 text-blanc/80 rounded-lg border border-dashed px-4 py-3 text-sm">
        Cette page a une vocation informative générale. Le droit applicable dépend de ta
        situation précise (lieu filmé, statut de l&apos;établissement, présence de
        salariés...). En cas de doute, vérifie auprès de la{" "}
        <a
          href="https://www.guadeloupe.gouv.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline"
        >
          préfecture de Guadeloupe
        </a>{" "}
        ou de la{" "}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline"
        >
          CNIL
        </a>
        .
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Lieu privé, lieu ouvert au public, voie publique : trois régimes différents
        </h2>
        <div className="text-blanc/80 mt-4 space-y-4 text-sm leading-relaxed">
          <p>
            <strong className="text-blanc">Lieu privé non ouvert au public</strong>{" "}
            (intérieur d&apos;une maison, jardin clos, réserve d&apos;un commerce non
            accessible aux clients) : c&apos;est le régime le plus souple. On parle de{" "}
            <em>vidéosurveillance</em> au sens de la protection des données (RGPD, loi
            Informatique et Libertés), sans autorisation préfectorale — mais avec des
            règles RGPD à respecter (finalité, information, durée de conservation).
          </p>
          <p>
            <strong className="text-blanc">Lieu privé ouvert au public</strong> (salle de
            vente d&apos;un commerce, hall d&apos;un hôtel, parties communes d&apos;une
            copropriété accessibles à des tiers) : on parle alors de{" "}
            <em>vidéoprotection</em>. Une autorisation préfectorale est en principe
            requise avant l&apos;installation.
          </p>
          <p>
            <strong className="text-blanc">Voie publique</strong> : filmer la voie
            publique (rue, trottoir) est strictement encadré et généralement réservé aux
            autorités publiques ; un particulier ou un commerce ne peut filmer que
            l&apos;emprise de son propre terrain.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Autorisation préfectorale</h2>
        <p className="text-blanc/80 mt-4 text-sm leading-relaxed">
          Pour un lieu ouvert au public, la demande d&apos;autorisation se fait auprès de
          la préfecture de Guadeloupe, généralement via le téléservice dédié à la
          vidéoprotection. Le dossier précise notamment l&apos;emplacement des caméras,
          les zones filmées et la durée de conservation envisagée.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Panneaux d&apos;information
        </h2>
        <p className="text-blanc/80 mt-4 text-sm leading-relaxed">
          Toute zone filmée doit être signalée par un panneau visible, indiquant
          qu&apos;un dispositif de vidéoprotection est en place, la finalité, la durée de
          conservation et les coordonnées du responsable à contacter pour exercer ses
          droits.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Durée de conservation des images
        </h2>
        <p className="text-blanc/80 mt-4 text-sm leading-relaxed">
          Les images ne doivent pas être conservées indéfiniment : la durée doit être
          limitée à ce qui est nécessaire à la finalité poursuivie, et déclarée dans le
          dossier d&apos;autorisation. Elle est généralement de quelques semaines, jamais
          de plusieurs mois sans justification particulière.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Salariés et représentants du personnel
        </h2>
        <p className="text-blanc/80 mt-4 text-sm leading-relaxed">
          Si des salariés travaillent dans la zone filmée, ils doivent être informés du
          dispositif avant sa mise en service. Selon la taille de l&apos;entreprise, le
          CSE (comité social et économique) doit être consulté au préalable. Filmer un
          poste de travail de façon permanente et disproportionnée peut être contesté.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Droit d&apos;accès aux images
        </h2>
        <p className="text-blanc/80 mt-4 text-sm leading-relaxed">
          Toute personne filmée peut demander à consulter les images la concernant, sous
          réserve de ne pas porter atteinte à la vie privée d&apos;un tiers également
          présent sur l&apos;enregistrement. La demande se fait auprès du responsable
          désigné sur le panneau d&apos;information.
        </p>
      </section>
    </PageShell>
  );
}
