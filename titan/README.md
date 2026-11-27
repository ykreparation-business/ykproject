# GLOBAL RECOVERY AI TITAN — Enterprise Edition (prototype)

> **ENVIRONNEMENT DE SIMULATION — AUCUNE OPÉRATION RÉELLE.**
> Données 100 % fictives, règles juridiques fictives, aucun appel réseau, aucun paiement, aucun message réel.

Simulateur interactif d'une plateforme internationale de gestion des créances, de recouvrement amiable
automatisé, d'intelligence financière et de conformité réglementaire.

## Utilisation

- **Sans installation** : ouvrir `dist/index.html` (fichier unique, publié comme Artifact).
- **Développement** :
  ```bash
  npm install       # esbuild
  npm test          # 20 tests du moteur (node --test)
  npm run build     # régénère dist/index.html
  ```

## Structure

| Dossier | Rôle |
|---|---|
| `src/engine/` | Moteur métier en JavaScript pur, sans dépendance au navigateur : données fictives (`data.js`), moteur juridique (`legal.js`), modèle et simulation (`model.js`), IA simulée (`ai.js`), SHA-256 (`sha256.js`). |
| `src/ui/` | Interface React (UMD 18.3.1 depuis cdnjs) : coque, composants et graphiques SVG (`kit.jsx`), vues par module (`views/`). |
| `tests/` | Tests juridiques, de permissions, de cohérence financière, d'audit et d'IA. |
| `dist/index.html` | Build autonome. |

## Principes de conception

1. **Le moteur juridique a le dernier mot.** Toute communication passe par `evaluateContact()` ; en cas de doute
   (validation incomplète, règle expirée, versions contradictoires), l'action est bloquée.
2. **L'IA ne décide pas.** Elle propose ; les documents importés sont des données, jamais des instructions.
3. **Aucun acte réservé.** Saisie, acte judiciaire, prélèvement forcé ou sanction ne sont jamais déclenchés.
4. **Honnêteté.** Les protections simulées ou seulement représentées sont signalées comme telles ;
   aucune certification n'est revendiquée.

## Registre des fonctionnalités

| Module | État |
|---|---|
| Interface premium, modes Simple/Pro/Expert, thèmes sombre/clair/haute accessibilité, responsive | Terminé |
| Centre de commande (KPI, graphiques, filtres, alertes) | Terminé |
| Dossiers : liste, filtres mémorisables, fiche, formulaire guidé chronométré, export CSV | Terminé |
| Titan Legal : 8 juridictions fictives, versions, validation à 3 niveaux, édition de règles, banc d'essai | Terminé |
| Titan Connect : simulation jour/semaine/mois/an, lecture continue, pause, calendrier, journal | Terminé |
| Titan Pay : paiements fictifs, reçus, remboursements, rapprochement, multidevise | Terminé |
| Portail débiteur : paiement, contestation (suspension auto), échéancier, difficulté, droits | Terminé |
| Permissions RBAC, accès exceptionnel à approbation indépendante, révocation | Terminé |
| Titan Security : incidents fictifs, journal chaîné SHA-256, test d'altération, arrêt d'urgence | Terminé |
| Banques (contrôle à quatre yeux) et collectivités (circuit agent → chef → comptable public) | Terminé |
| Titan Fraud : file d'investigation, faux positifs, escalade humaine | Terminé |
| Titan Intelligence : analyse documentaire, anti-injection, garde-fou de ton, messages multilingues | Simulé (déterministe) |
| Titan Voice : appel scripté avec transcription, tonalités, conséquences sur le dossier | Simulé |
| Titan Predict : prévisions avec hypothèses et incertitude | Simulé |
| Titan World, Titan Integration (sandbox API, clés, webhooks, CSV), modèle économique, conformité, architecture | Terminé |
| Laboratoire : 19 scénarios avec contrôle du résultat attendu | Terminé |
| MFA/passkeys/SSO, chiffrement, backend, IA réelle, connecteurs réels, envois réels | À développer |

## Limites de l'environnement Artifact

- Pas de serveur : l'état est perdu au rechargement (préférences et filtres mémorisés localement).
- Téléchargements bloqués : exports et reçus se copient dans le presse-papiers.
- Pas d'appel réseau externe ; pas de vraie authentification.
