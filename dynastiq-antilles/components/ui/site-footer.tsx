import Link from "next/link";
import { footerLinks } from "@/content/nav";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-slate/60 bg-nuit-deep border-t">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <p className="font-display text-lg font-semibold">{site.nom}</p>
          <p className="text-blanc/60 mt-2 text-sm">{site.baseline}</p>
          <dl className="text-blanc/70 mt-6 space-y-1 text-sm">
            <div>
              <dt className="sr-only">Téléphone</dt>
              <dd>
                <a href={site.telephoneHref} className="hover:text-teal">
                  {site.telephone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="hover:text-teal">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Zone d&apos;intervention</dt>
              <dd>{site.zones}</dd>
            </div>
          </dl>
        </div>

        {footerLinks.map((group) => (
          <div key={group.label}>
            <p className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
              {group.label}
            </p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blanc/75 hover:text-teal text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-slate/60 border-t px-6 py-6">
        <p className="text-blanc/40 mx-auto max-w-7xl font-mono text-xs">
          © {new Date().getFullYear()} {site.nom} — SIRET {site.siret}
        </p>
      </div>
    </footer>
  );
}
