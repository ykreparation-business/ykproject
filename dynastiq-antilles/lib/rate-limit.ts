// Rate limiting en mémoire, par IP, pour la route /api/devis.
// Suffisant pour une seule instance serverless persistante ; si le
// déploiement passe en multi-instance, remplacer par un store partagé
// (ex. Upstash Redis).

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(identifier) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(identifier, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(identifier, timestamps);
  return false;
}
