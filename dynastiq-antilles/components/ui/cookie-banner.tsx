"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dynastiq-cookie-consent";
const UNKNOWN = "unknown";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("dynastiq-consent-changed", onStoreChange);
  return () => window.removeEventListener("dynastiq-consent-changed", onStoreChange);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return UNKNOWN;
}

// Aucun script de mesure d'audience n'est chargé avant consentement — le
// site n'en embarque d'ailleurs aucun pour l'instant. Si un outil d'analyse
// est ajouté plus tard, le charger uniquement quand
// localStorage.getItem(STORAGE_KEY) === "accepted".
export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function respond(choice: "accepted" | "refused") {
    window.localStorage.setItem(STORAGE_KEY, choice);
    window.dispatchEvent(new Event("dynastiq-consent-changed"));
  }

  if (consent === UNKNOWN || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Préférences cookies"
      className="border-slate/60 bg-nuit-deep fixed inset-x-0 bottom-14 z-50 border-t p-4 lg:bottom-0"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
        <p className="text-blanc/75 text-sm">
          Ce site n&apos;utilise aucun cookie de mesure d&apos;audience sans ton accord.
          Voir la{" "}
          <Link
            href="/politique-de-confidentialite"
            className="text-teal hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => respond("refused")}
            className="border-slate/60 text-blanc/80 hover:border-teal rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
