import Link from "next/link";
import { site, whatsappHref } from "@/content/site";

export function MobileActionBar() {
  return (
    <nav
      aria-label="Actions rapides"
      className="border-slate/60 bg-nuit/95 fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t backdrop-blur lg:hidden"
    >
      <a
        href={site.telephoneHref}
        className="text-blanc/80 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium"
      >
        <span aria-hidden>📞</span>
        Appeler
      </a>
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blanc/80 border-slate/60 flex flex-col items-center justify-center gap-0.5 border-x py-3 text-xs font-medium"
      >
        <span aria-hidden>💬</span>
        WhatsApp
      </a>
      <Link
        href="/devis"
        className="bg-teal text-blanc flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium"
      >
        <span aria-hidden>✎</span>
        Devis
      </Link>
    </nav>
  );
}
