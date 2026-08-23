import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { site, whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contacter ${site.nom} — téléphone, WhatsApp, email.`,
};

export default function ContactPage() {
  return (
    <PageShell
      kicker="Contact"
      title="Parlons de ton projet"
      intro="Par téléphone, WhatsApp ou email — ou directement via le formulaire de devis."
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="border-slate/60 rounded-xl border p-5">
          <dt className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            Téléphone
          </dt>
          <dd className="mt-2">
            <a href={site.telephoneHref} className="text-teal text-lg hover:underline">
              {site.telephone}
            </a>
          </dd>
        </div>
        <div className="border-slate/60 rounded-xl border p-5">
          <dt className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            WhatsApp
          </dt>
          <dd className="mt-2">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal text-lg hover:underline"
            >
              Écrire sur WhatsApp
            </a>
          </dd>
        </div>
        <div className="border-slate/60 rounded-xl border p-5">
          <dt className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            Email
          </dt>
          <dd className="mt-2">
            <a
              href={`mailto:${site.email}`}
              className="text-teal text-lg hover:underline"
            >
              {site.email}
            </a>
          </dd>
        </div>
        <div className="border-slate/60 rounded-xl border p-5">
          <dt className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            Horaires
          </dt>
          <dd className="text-blanc/80 mt-2">{site.horaires}</dd>
        </div>
      </dl>

      <div className="border-slate/60 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <p className="text-blanc/80">Décris ton projet dans le formulaire de devis.</p>
        <Link
          href="/devis"
          className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Demander un devis
        </Link>
      </div>
    </PageShell>
  );
}
