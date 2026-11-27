// Utilitaires partagés : PRNG déterministe, dates, devises.
export const DAY = 86400000;
export const HOUR = 3600000;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRand(seed) {
  const r = mulberry32(seed);
  const api = {
    next: r,
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    weighted: (pairs) => {
      const total = pairs.reduce((s, p) => s + p[1], 0);
      let x = r() * total;
      for (const [v, w] of pairs) { if ((x -= w) < 0) return v; }
      return pairs[pairs.length - 1][0];
    },
    logNormal: (min, max) => {
      const lmin = Math.log(min), lmax = Math.log(max);
      const u = (r() + r() + r()) / 3; // légère concentration au centre
      return Math.exp(lmin + (lmax - lmin) * u);
    },
  };
  return api;
}

// Taux de démonstration FIGÉS (non contractuels, aucune source de marché) — conversion vers EUR.
export const CURRENCIES = {
  EUR: { dec: 2, rateToEUR: 1, label: 'Euro' },
  USD: { dec: 2, rateToEUR: 0.92, label: 'Dollar US' },
  GBP: { dec: 2, rateToEUR: 1.17, label: 'Livre sterling' },
  CHF: { dec: 2, rateToEUR: 1.05, label: 'Franc suisse' },
  XOF: { dec: 0, rateToEUR: 1 / 655.957, label: 'Franc CFA (UEMOA)' },
  JPY: { dec: 0, rateToEUR: 0.0062, label: 'Yen' },
};
export const FX_NOTE = 'Agrégats convertis en EUR avec des taux de démonstration figés, non issus du marché.';

export function toMinor(major, cur) { return Math.round(major * 10 ** CURRENCIES[cur].dec); }
export function toMajor(minor, cur) { return minor / 10 ** CURRENCIES[cur].dec; }
export function toEURMinor(minor, cur) {
  const c = CURRENCIES[cur];
  return Math.round((minor / 10 ** c.dec) * c.rateToEUR * 100);
}
const fmtCache = new Map();
export function fmtMoney(minor, cur = 'EUR', locale = 'fr-FR', compact = false) {
  const c = CURRENCIES[cur] || CURRENCIES.EUR;
  const key = cur + locale + compact;
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, compact
      ? { style: 'currency', currency: cur, notation: 'compact', maximumFractionDigits: 1 }
      : { style: 'currency', currency: cur, minimumFractionDigits: c.dec, maximumFractionDigits: c.dec });
    fmtCache.set(key, f);
  }
  return f.format(minor / 10 ** c.dec);
}
export function isoDate(ms) { return new Date(ms).toISOString().slice(0, 10); }
export function parseISO(s) { return Date.parse(s + 'T00:00:00Z'); }
export function startOfDayUTC(ms) { return Math.floor(ms / DAY) * DAY; }
export function fmtDate(ms, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(ms);
}
export function fmtDateTime(ms, locale = 'fr-FR', offsetMin = 0) {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(ms + offsetMin * 60000);
}
export function pad(n, w = 4) { return String(n).padStart(w, '0'); }
export function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
