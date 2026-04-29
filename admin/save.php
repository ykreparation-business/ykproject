<?php
session_start();
if (empty($_SESSION['admin'])) { http_response_code(403); echo json_encode(['error' => 'Non autorisé']); exit; }

header('Content-Type: application/json');
require_once 'config.php';

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide']);
    exit;
}

$required = ['site', 'hero', 'pitch', 'stats', 'gallery', 'reviews', 'portfolio', 'process'];
foreach ($required as $key) {
    if (!array_key_exists($key, $data)) {
        http_response_code(400);
        echo json_encode(['error' => "Clé manquante : $key"]);
        exit;
    }
}

$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if (file_put_contents(CONTENT_FILE, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'écrire le fichier. Vérifiez les permissions.']);
    exit;
}

echo json_encode(['ok' => true]);
