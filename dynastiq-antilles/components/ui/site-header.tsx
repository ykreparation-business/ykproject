import Image from "next/image";
import Link from "next/link";
import { navGroups, topLevelLinks } from "@/content/nav";
import { site } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="border-slate/60 bg-nuit/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.nom} — accueil`}
        >
          <Image
            src="/brand/logo-mono.svg"
            alt=""
            width={32}
            height={40}
            className="text-teal"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            {site.nom}
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 lg:flex"
        >
          {navGroups.map((group) => (
            <details key={group.label} className="group relative">
              <summary className="hover:text-teal focus-visible:text-teal flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium select-none">
                {group.label}
                <span aria-hidden className="text-xs">
                  ▾
                </span>
              </summary>
              <div className="border-slate bg-nuit-deep absolute top-full left-0 z-50 mt-2 min-w-56 rounded-xl border p-2 shadow-xl">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:bg-slate/60 hover:text-teal block rounded-lg px-3 py-2 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
          {topLevelLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-teal rounded-md px-3 py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/devis"
            className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Demander un devis
          </Link>
          <details className="group relative lg:hidden">
            <summary className="border-slate flex cursor-pointer list-none items-center rounded-md border px-3 py-2 text-sm select-none">
              Menu
            </summary>
            <nav
              aria-label="Navigation mobile"
              className="border-slate bg-nuit-deep absolute top-full right-0 z-50 mt-2 w-72 space-y-4 rounded-xl border p-4 shadow-xl"
            >
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
                    {group.label}
                  </p>
                  <div className="mt-2 space-y-1">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="hover:text-teal block py-1 text-sm"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-slate/60 space-y-1 border-t pt-3">
                {topLevelLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-teal block py-1 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
