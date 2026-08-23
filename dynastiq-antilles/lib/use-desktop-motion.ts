"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

// true seulement sur desktop avec pointeur fin (souris) — utilisé pour
// désactiver curseur personnalisé, magnétisme et parallaxe sur mobile/tactile.
// useSyncExternalStore gère proprement le mismatch SSR/client pour une API
// navigateur comme matchMedia (pas de flash d'hydratation).
export function useDesktopMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
