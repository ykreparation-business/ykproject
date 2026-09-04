# Déploiement — Natirèl CBD Caisse

Ce dossier contient deux parties :

- l'**application** (`index.html`, `css/`, `js/`, `manifest.json`) — ce que l'iPad ouvre dans Safari ;
- l'**API de synchronisation** (`api/`) — un petit service PHP qui lit/écrit dans une base MySQL, à héberger sur Hostinger.

Les deux peuvent être hébergés au même endroit, sur le même hébergement Hostinger.

## 1. Créer la base de données MySQL

Dans hPanel Hostinger : **Bases de données → Bases de données MySQL**.

1. Créez une nouvelle base (ex. `natirel_caisse`) et un utilisateur associé avec mot de passe. Notez : hôte (souvent `localhost`), nom de la base, nom d'utilisateur, mot de passe.
2. Ouvrez **phpMyAdmin** depuis hPanel, sélectionnez la base créée, onglet **Importer**, choisissez le fichier `schema.sql` de ce dossier, validez. Quatre tables doivent apparaître : `produits`, `ventes`, `vente_lignes`, `reglages`.

## 2. Mettre les fichiers en ligne

Via le **Gestionnaire de fichiers** Hostinger (ou FTP) :

1. Uploadez tout le dossier `caisse-cbd/` dans `public_html/` (ou dans un sous-dossier / sous-domaine dédié, ex. `caisse.votre-domaine.fr`).
2. Dans `caisse-cbd/api/`, dupliquez `config.example.php` en **`config.php`** (nouveau fichier, à côté de l'exemple) et renseignez :
   - `db_host`, `db_name`, `db_user`, `db_pass` : les identifiants MySQL de l'étape 1 ;
   - `api_key` : inventez une longue chaîne aléatoire (ex. générée sur [1password.com/password-generator](https://1password.com/password-generator/) ou similaire) — c'est le mot de passe qui protège l'API, à garder secret.
3. **Ne committez jamais `config.php`** dans un dépôt Git — il contient des identifiants réels. Ce dépôt l'ignore déjà via `.gitignore`.

L'API est alors accessible à une URL du type :
`https://votre-domaine.fr/caisse-cbd/api/sync.php`

## 3. Configurer l'app sur l'iPad

1. Ouvrez `https://votre-domaine.fr/caisse-cbd/index.html` dans Safari.
2. Onglet **Réglages → Synchronisation** : renseignez l'URL de l'API (celle ci-dessus) et la clé API choisie à l'étape 2.
3. « Enregistrer les identifiants » déclenche une première synchronisation. Le voyant doit passer au vert avec « Dernière synchronisation : … ».
4. Répétez cette configuration sur chaque iPad/appareil qui doit partager les mêmes données.
5. Sur l'écran d'accueil iOS : partager → « Sur l'écran d'accueil » pour un lancement en plein écran, sans barre Safari.

## Comment fonctionne la synchronisation

- Chaque vente, produit ajouté/modifié/supprimé et réglage est envoyé au serveur automatiquement (juste après l'action, puis en tâche de fond toutes les 5 minutes, et à chaque ouverture de l'app).
- Le serveur est la source de vérité : à chaque synchronisation, l'app récupère aussi les ventes/produits enregistrés depuis d'autres appareils.
- Si l'iPad est hors ligne, les ventes restent enregistrées localement et partent au réseau suivant — rien n'est perdu, mais pensez à resynchroniser avant de faire la comptabilité du jour.
- Le bouton « Synchroniser maintenant » (Réglages) force un essai immédiat.

## Sécurité

- L'API vérifie la clé secrète (`X-Api-Key`) sur chaque requête — sans la bonne clé, aucune donnée n'est accessible.
- Utilisez uniquement l'URL en **https://** (Hostinger fournit un certificat SSL gratuit à activer dans hPanel si ce n'est pas déjà fait).
- `api/.htaccess` bloque l'accès direct à `config.php` en cas de mauvaise configuration du serveur.

## Limites à connaître

- Pas de comptes utilisateurs individuels : toute personne connaissant la clé API peut lire/écrire les données. Convient pour un usage interne à la boutique.
- Le catalogue et l'historique des ventes sont renvoyés en entier à chaque synchronisation (pas de pagination) — largement suffisant pour le volume d'une boutique, à surveiller si le volume devient très important après plusieurs années.
- Ce n'est pas un logiciel de caisse certifié NF525 (voir la note dans l'app, onglet Réglages).
