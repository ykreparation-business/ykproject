import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/content/site";

export function CtaContact() {
  return (
    <section className="bg-supervision border-slate/60 border-t">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Parlons de ton projet
          </h2>
          <p className="text-blanc/70 mx-auto mt-4 max-w-xl">
            Devis gratuit, sans engagement. Décris ton besoin, on te recontacte
            rapidement.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/devis"
              className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-7 py-3.5 font-medium transition-colors"
            >
              Demander un devis
            </Link>
            <a
              href={site.telephoneHref}
              className="hover:bg-amber/10 border-amber text-amber rounded-full border px-7 py-3.5 font-medium transition-colors"
            >
              Appeler {site.telephone}
            </a>
          </div>

          <dl className="text-blanc/60 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="sr-only">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="hover:text-teal">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">WhatsApp</dt>
              <dd>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal"
                >
                  WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Horaires</dt>
              <dd>{site.horaires}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
