<?php
session_start();
if (empty($_SESSION['admin'])) { http_response_code(403); echo json_encode(['error' => 'Non autorisé']); exit; }

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$pass  = $input['password'] ?? '';

if (strlen($pass) < 6) {
    echo json_encode(['error' => 'Le mot de passe doit faire au moins 6 caractères']);
    exit;
}

$hash      = password_hash($pass, PASSWORD_DEFAULT);
$configPath = __DIR__ . '/config.php';
$current   = file_get_contents($configPath);

$updated = preg_replace(
    "/define\('ADMIN_PASSWORD_HASH',\s*'[^']+'\);/",
    "define('ADMIN_PASSWORD_HASH', '" . addslashes($hash) . "');",
    $current
);

if ($updated === $current) {
    echo json_encode(['error' => 'Impossible de mettre à jour config.php']);
    exit;
}

file_put_contents($configPath, $updated);
echo json_encode(['ok' => true]);
