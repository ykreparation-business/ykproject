import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { TodoNote } from "@/components/ui/todo-note";

export const metadata: Metadata = { title: "CGV" };

// Conditions générales de vente à rédiger en Phase 7, avec l'entreprise
// (devis, acompte, délais d'installation, garantie matériel, SAV).
export default function CgvPage() {
  return (
    <PageShell kicker="Légal" title="Conditions générales de vente">
      <TodoNote>
        CGV à rédiger en Phase 7 avec l&apos;entreprise : modalités de devis, acompte,
        délais d&apos;installation, garantie matériel, conditions de SAV et de
        résiliation.
      </TodoNote>
    </PageShell>
  );
}
