import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Demander un devis",
  description: `Demande un devis gratuit à ${site.nom} pour ton projet de vidéosurveillance ou d'alarme.`,
};

// Le formulaire multi-étapes complet (type de bien → besoin → contexte →
// coordonnées, avec zod + honeypot + rate limiting déjà en place côté API)
// arrive en Phase 5. Cette page assure en attendant un point de contact
// fonctionnel, sans texte de remplissage.
export default function DevisPage() {
  return (
    <PageShell
      kicker="Devis"
      title="Demander un devis"
      intro="Le formulaire de devis en ligne arrive très prochainement. En attendant, contacte-nous directement : nous répondons rapidement."
    >
      <TodoNote>
        Formulaire multi-étapes (type de bien, besoin, contexte, coordonnées) à brancher
        ici — route /api/devis déjà fonctionnelle (zod, honeypot, rate limiting, Resend).
      </TodoNote>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={site.telephoneHref}
          className="border-slate/60 hover:border-teal rounded-xl border p-5 text-center transition-colors"
        >
          <p className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            Appeler
          </p>
          <p className="text-teal mt-2">{site.telephone}</p>
        </a>
        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="border-slate/60 hover:border-teal rounded-xl border p-5 text-center transition-colors"
        >
          <p className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            WhatsApp
          </p>
          <p className="text-teal mt-2">Écrire un message</p>
        </a>
        <a
          href={`mailto:${site.email}`}
          className="border-slate/60 hover:border-teal rounded-xl border p-5 text-center transition-colors"
        >
          <p className="text-blanc/50 font-mono text-xs tracking-widest uppercase">
            Email
          </p>
          <p className="text-teal mt-2">{site.email}</p>
        </a>
      </div>
    </PageShell>
  );
}
