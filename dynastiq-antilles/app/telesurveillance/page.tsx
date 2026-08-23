import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Télésurveillance",
  description:
    "Télésurveillance en option, en partenariat avec un centre de surveillance agréé.",
  path: "/telesurveillance",
});

// Page prête et activable : la télésurveillance implique un partenariat avec
// un centre de télésurveillance agréé (levée de doute, transmission aux
// forces de l'ordre). Aucun partenariat ni agrément CNAPS n'est affirmé tant
// qu'il n'est pas confirmé — voir TodoNote ci-dessous.
export default function TelesurveillancePage() {
  return (
    <PageShell
      kicker="Option"
      title="Télésurveillance"
      intro="La télésurveillance ajoute une supervision permanente à une installation d'alarme : en cas de déclenchement, un centre de télésurveillance lève le doute et déclenche la procédure adaptée (contact du propriétaire, intervention, transmission aux forces de l'ordre selon le contrat)."
    >
      <p className="text-blanc/75">
        C&apos;est un service optionnel, complémentaire à l&apos;alarme installée sur site
        — il s&apos;ajoute au matériel, il ne le remplace pas.
      </p>

      <TodoNote>
        Service activable une fois le partenariat avec un centre de télésurveillance agréé
        confirmé (nom du partenaire, tarifs, modalités contractuelles). Ne pas publier de
        nom de partenaire ni d&apos;agrément CNAPS tant que ce n&apos;est pas vérifié.
      </TodoNote>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">
          Intéressé par la télésurveillance pour ton site ? Contacte-nous pour en
          discuter.
        </p>
        <Link
          href="/contact"
          className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Nous contacter
        </Link>
      </div>
    </PageShell>
  );
}
