<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$cfg = natirel_config();
header('Access-Control-Allow-Origin: ' . $cfg['allowed_origin']);
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (!is_string($apiKey) || !hash_equals((string) $cfg['api_key'], $apiKey)) {
    http_response_code(401);
    echo json_encode(['error' => 'Clé API invalide.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée.']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide.']);
    exit;
}

$pdo = natirel_pdo();

$produitsIn = is_array($body['produits'] ?? null) ? $body['produits'] : [];
$ventesIn = is_array($body['ventes'] ?? null) ? $body['ventes'] : [];
$reglagesIn = is_array($body['reglages'] ?? null) ? $body['reglages'] : null;

// Convertit un ISO-8601 client (ex. "2026-09-04T21:30:00.000Z") en DATETIME MySQL (UTC, sans suffixe).
function natirel_iso_vers_mysql($iso) {
    $iso = (string) $iso;
    $t = strtotime($iso);
    if ($t === false) return null;
    return gmdate('Y-m-d H:i:s', $t);
}

// Fait l'inverse : DATETIME MySQL (stocké en UTC) -> ISO-8601 avec suffixe Z,
// pour que le navigateur le réinterprète correctement en heure locale.
function natirel_mysql_vers_iso($dt) {
    return str_replace(' ', 'T', $dt) . '.000Z';
}

try {
    $pdo->beginTransaction();

    $stmtP = $pdo->prepare("
        INSERT INTO produits (id, nom, categorie, prix_ttc, taux_tva, supprime)
        VALUES (:id, :nom, :categorie, :prix_ttc, :taux_tva, :supprime)
        ON DUPLICATE KEY UPDATE
            nom = VALUES(nom), categorie = VALUES(categorie),
            prix_ttc = VALUES(prix_ttc), taux_tva = VALUES(taux_tva),
            supprime = VALUES(supprime)
    ");
    foreach ($produitsIn as $p) {
        if (!isset($p['id'], $p['nom'], $p['prixTTC'], $p['tauxTVA'])) continue;
        $stmtP->execute([
            ':id' => substr((string) $p['id'], 0, 40),
            ':nom' => substr((string) $p['nom'], 0, 190),
            ':categorie' => substr((string) ($p['categorie'] ?? 'Autres'), 0, 120),
            ':prix_ttc' => (float) $p['prixTTC'],
            ':taux_tva' => (float) $p['tauxTVA'],
            ':supprime' => !empty($p['deleted']) ? 1 : 0,
        ]);
    }

    $stmtV = $pdo->prepare("
        INSERT INTO ventes (id, date_iso, remise, mode_paiement, montant_recu, total, annulee)
        VALUES (:id, :date_iso, :remise, :mode_paiement, :montant_recu, :total, :annulee)
        ON DUPLICATE KEY UPDATE annulee = VALUES(annulee)
    ");
    $stmtDelLignes = $pdo->prepare("DELETE FROM vente_lignes WHERE vente_id = :vid");
    $stmtLigne = $pdo->prepare("
        INSERT INTO vente_lignes (vente_id, produit_id, nom, prix_ttc, taux_tva, qty)
        VALUES (:vid, :pid, :nom, :prix_ttc, :taux_tva, :qty)
    ");

    foreach ($ventesIn as $v) {
        if (!isset($v['id'], $v['dateISO'], $v['paymentMethod'], $v['total'])) continue;
        $dateMysql = natirel_iso_vers_mysql($v['dateISO']);
        if ($dateMysql === null) continue;
        $venteId = substr((string) $v['id'], 0, 40);
        $mode = $v['paymentMethod'] === 'especes' ? 'especes' : 'cb';

        $stmtV->execute([
            ':id' => $venteId,
            ':date_iso' => $dateMysql,
            ':remise' => (float) ($v['remise'] ?? 0),
            ':mode_paiement' => $mode,
            ':montant_recu' => isset($v['montantRecu']) && $v['montantRecu'] !== null ? (float) $v['montantRecu'] : null,
            ':total' => (float) $v['total'],
            ':annulee' => !empty($v['voided']) ? 1 : 0,
        ]);

        $stmtDelLignes->execute([':vid' => $venteId]);
        foreach (($v['items'] ?? []) as $it) {
            if (!isset($it['productId'], $it['nom'], $it['prixTTC'], $it['tauxTVA'], $it['qty'])) continue;
            $stmtLigne->execute([
                ':vid' => $venteId,
                ':pid' => substr((string) $it['productId'], 0, 40),
                ':nom' => substr((string) $it['nom'], 0, 190),
                ':prix_ttc' => (float) $it['prixTTC'],
                ':taux_tva' => (float) $it['tauxTVA'],
                ':qty' => (int) $it['qty'],
            ]);
        }
    }

    if ($reglagesIn) {
        $stmtR = $pdo->prepare("
            INSERT INTO reglages (id, nom, adresse, ville, tva, siret, naf, fond_caisse_initial)
            VALUES (1, :nom, :adresse, :ville, :tva, :siret, :naf, :fond)
            ON DUPLICATE KEY UPDATE
                nom = VALUES(nom), adresse = VALUES(adresse), ville = VALUES(ville),
                tva = VALUES(tva), siret = VALUES(siret), naf = VALUES(naf),
                fond_caisse_initial = VALUES(fond_caisse_initial)
        ");
        $stmtR->execute([
            ':nom' => substr((string) ($reglagesIn['nom'] ?? ''), 0, 190),
            ':adresse' => substr((string) ($reglagesIn['adresse'] ?? ''), 0, 190),
            ':ville' => substr((string) ($reglagesIn['ville'] ?? ''), 0, 190),
            ':tva' => substr((string) ($reglagesIn['tva'] ?? ''), 0, 40),
            ':siret' => substr((string) ($reglagesIn['siret'] ?? ''), 0, 40),
            ':naf' => substr((string) ($reglagesIn['naf'] ?? ''), 0, 20),
            ':fond' => (float) ($reglagesIn['fondCaisseInitial'] ?? 0),
        ]);
    }

    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Échec de synchronisation.']);
    exit;
}

// --- Lecture de l'état canonique, renvoyé au client pour fusion locale ---

$produitsOut = $pdo->query("
    SELECT id, nom, categorie, prix_ttc AS prixTTC, taux_tva AS tauxTVA, supprime AS deleted
    FROM produits
")->fetchAll();
foreach ($produitsOut as &$p) {
    $p['prixTTC'] = (float) $p['prixTTC'];
    $p['tauxTVA'] = (float) $p['tauxTVA'];
    $p['deleted'] = (bool) $p['deleted'];
}
unset($p);

$ventesRows = $pdo->query("
    SELECT id, date_iso, remise, mode_paiement AS paymentMethod, montant_recu AS montantRecu, total, annulee AS voided
    FROM ventes ORDER BY date_iso DESC LIMIT 5000
")->fetchAll();

$stmtLignesOut = $pdo->prepare("
    SELECT produit_id AS productId, nom, prix_ttc AS prixTTC, taux_tva AS tauxTVA, qty
    FROM vente_lignes WHERE vente_id = :vid
");

$ventesOut = [];
foreach ($ventesRows as $v) {
    $stmtLignesOut->execute([':vid' => $v['id']]);
    $items = $stmtLignesOut->fetchAll();
    foreach ($items as &$it) {
        $it['prixTTC'] = (float) $it['prixTTC'];
        $it['tauxTVA'] = (float) $it['tauxTVA'];
        $it['qty'] = (int) $it['qty'];
    }
    unset($it);

    $ventesOut[] = [
        'id' => $v['id'],
        'dateISO' => natirel_mysql_vers_iso($v['date_iso']),
        'remise' => (float) $v['remise'],
        'paymentMethod' => $v['paymentMethod'],
        'montantRecu' => $v['montantRecu'] !== null ? (float) $v['montantRecu'] : null,
        'total' => (float) $v['total'],
        'voided' => (bool) $v['voided'],
        'items' => $items,
    ];
}

$reglagesOut = $pdo->query("
    SELECT nom, adresse, ville, tva, siret, naf, fond_caisse_initial AS fondCaisseInitial
    FROM reglages WHERE id = 1
")->fetch();
if ($reglagesOut) {
    $reglagesOut['fondCaisseInitial'] = (float) $reglagesOut['fondCaisseInitial'];
}

echo json_encode([
    'serverTime' => gmdate('c'),
    'produits' => $produitsOut,
    'ventes' => $ventesOut,
    'reglages' => $reglagesOut ?: null,
]);
