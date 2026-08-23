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

Typographie : _Chakra Petch_ (display), _IBM Plex Sans_ (body), _IBM Plex Mono_
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

Les 8 phases du brief sont livrées : fondations, arborescence complète,
home animée, système de motion, formulaire de devis, SEO local, pages
légales, passe qualité.

### TODO restants avant mise en production

Tout ce qui suit est volontairement laissé en attente — aucune information
n'a été inventée pour combler ces champs :

- **`content/site.ts`** — téléphone, WhatsApp, email, adresse, SIRET,
  horaires, assurance (tous marqués `// À CONFIRMER`).
- **Mentions légales** (`/mentions-legales`) — nom du directeur de
  publication.
- **CGV** (`/cgv`) — pourcentage d'acompte, durée de garantie commerciale,
  préavis de résiliation (décisions commerciales de l'entreprise).
- **`content/tarifs.ts`** — fourchettes de prix (`À CONFIRMER`, aucun
  montant inventé).
- **`content/chiffres.ts`** — compteurs animés de la home, actuellement à 0
  et marqués « À VALIDER » (sites protégés, années d'expérience, délai
  moyen d'intervention).
- **`content/realisations.ts`** — 3 cas d'exemple à remplacer par de vrais
  chantiers (accord client requis pour publication).
- **`/telesurveillance`** — service listé « activable » : nécessite un
  partenariat confirmé avec un centre de télésurveillance agréé.
- **Marques (Hikvision/Dahua/Safire/Ajax)** — le site n'héberge pas les
  logos officiels des fabricants (droits d'usage à obtenir séparément) ;
  la barre de marques utilise un traitement typographique en attendant.
- **`public/brand/`** — logo recréé à la main en SVG à partir de l'aperçu
  fourni ; à remplacer par les fichiers vectoriels sources si disponibles.
- **Réalisations chiffrées & certifications** — aucun agrément CNAPS, label
  APSAD ou partenariat officiel n'est affirmé nulle part sur le site.

### 3 pistes pour une v2

1. **Vrai CMS pour `content/`** — les fichiers TypeScript typés sont
   volontairement simples à éditer pour un développeur, mais une personne
   non technique (l'entreprise elle-même) gagnerait à avoir une interface
   (Sanity, ou un simple panneau interne) pour mettre à jour tarifs, FAQ et
   réalisations sans toucher au code.
2. **Suivi de conversion** — une fois un outil de mesure d'audience choisi
   et le consentement cookie géré en conséquence, instrumenter le tunnel du
   formulaire de devis (abandon par étape) pour identifier où les
   prospects décrochent.
3. **Étoffer le blog et les pages ville** — `content/blog.ts` démarre vide
   et les pages `/zones/{ville}` ont un contenu général mais pas encore de
   vraies photos de chantiers locaux ; les deux sont des leviers SEO
   naturels une fois que l'entreprise aura des réalisations à documenter.
