# Dynastiq Antilles — site vitrine

Site vitrine « Vidéosurveillance & Alarme » pour Dynastiq Antilles (Guadeloupe).
Objectif : générer des demandes de devis qualifiées.

## Stack

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 — tokens de design en variables CSS (`app/globals.css`)
- Framer Motion + Lenis (motion, Phase 4)
- react-hook-form + zod + Resend (formulaire de devis, `/api/devis`)
- next/image + sharp

## Installation

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs réelles
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Variables d'environnement (`.env.local`, jamais commité)

Voir `.env.example` pour la liste complète :

- `RESEND_API_KEY` — clé API Resend, pour l'envoi des emails de devis.
- `DEVIS_NOTIFICATION_EMAIL` — adresse qui reçoit les nouvelles demandes.
- `DEVIS_FROM_EMAIL` — adresse d'expédition (domaine vérifié dans Resend).
- `NEXT_PUBLIC_SITE_URL` — URL de base du site déployé (SEO, sitemap, JSON-LD).

## Où modifier les textes

Tout le contenu vit dans `content/` (fichiers TypeScript typés), jamais dans les
composants :

- `content/site.ts` — identité de l'entreprise (nom, téléphone, adresse, SIRET,
  horaires...). Les champs marqués `// À CONFIRMER` doivent être remplacés par
  les vraies valeurs avant mise en production.
- `content/villes.ts` — pages locales `/zones/{ville}` (Phase 6).
- `content/faq.ts`, `content/realisations.ts`, etc. — ajoutés au fil des phases
  suivantes.

## Ajouter une ville

Ajouter une entrée dans `content/villes.ts` avec le contenu spécifique à la
commune (quartiers, contexte, délai d'intervention). La page `/zones/{slug}`
est générée automatiquement. Si le contenu spécifique n'est pas encore prêt,
laisser un `TODO` visible plutôt qu'un texte générique.

## Design system

La palette est verrouillée sur le logo réel (voir `public/brand/`) et exposée
en variables CSS dans `app/globals.css` : `nuit`, `teal`, `teal-deep`, `slate`,
`amber`, `vermillon`, `blanc`. Ne jamais coder un hex en dur dans un composant
— utiliser les classes Tailwind générées (`bg-teal`, `text-amber`, etc.).

Typographie : *Chakra Petch* (display), *IBM Plex Sans* (body), *IBM Plex Mono*
(utility — chiffres, timecodes, labels techniques), chargées via
`next/font/google` dans `app/layout.tsx`.

## Qualité

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run format       # Prettier (écrit)
npm run format:check # Prettier (vérifie)
npm run build        # build de production
```

## Déploiement (Vercel)

1. Importer le repo sur [vercel.com/new](https://vercel.com/new), en pointant
   sur le sous-dossier `dynastiq-antilles/` comme racine du projet.
2. Renseigner les variables d'environnement de `.env.example` dans les
   réglages du projet Vercel (Production + Preview).
3. Déployer — Vercel détecte Next.js automatiquement.

## État du projet

Voir le récapitulatif de phase le plus récent dans la conversation pour la
liste des TODO restants et l'avancement par phase.
