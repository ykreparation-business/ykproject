<?php
// Copiez ce fichier en config.php (à côté) et renseignez vos propres valeurs.
// config.php ne doit JAMAIS être partagé ni mis en ligne publique (dépôt Git, etc.).

return [
    // Identifiants MySQL fournis par Hostinger (hPanel → Bases de données)
    'db_host' => 'localhost',
    'db_name' => 'u000000000_natirel',
    'db_user' => 'u000000000_natirel',
    'db_pass' => 'CHANGEZ_MOI',

    // Clé secrète inventée par vous : une longue chaîne aléatoire.
    // Elle doit être identique à celle saisie dans l'app (Réglages → Synchronisation).
    'api_key' => 'CHANGEZ_MOI_PAR_UNE_CLE_LONGUE_ET_ALEATOIRE',

    // Domaine autorisé à appeler cette API (mettez '*' si vous n'êtes pas sûr).
    'allowed_origin' => '*',
];
