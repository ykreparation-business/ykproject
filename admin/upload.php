<?php
session_start();
if (empty($_SESSION['admin'])) { http_response_code(403); echo json_encode(['error' => 'Non autorisé']); exit; }

header('Content-Type: application/json');
require_once 'config.php';

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun fichier reçu']);
    exit;
}

$file = $_FILES['file'];
$type = isset($_GET['type']) && $_GET['type'] === 'video' ? 'video' : 'image';

if ($file['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'Fichier trop volumineux (limite serveur)',
        UPLOAD_ERR_FORM_SIZE  => 'Fichier trop volumineux',
        UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
        UPLOAD_ERR_CANT_WRITE => 'Impossible d\'écrire sur le disque',
    ];
    echo json_encode(['error' => $errors[$file['error']] ?? 'Erreur d\'upload']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);

if ($type === 'video') {
    if (!in_array($mime, ALLOWED_VID_MIME)) {
        echo json_encode(['error' => 'Format vidéo non autorisé (MP4 uniquement)']);
        exit;
    }
    if ($file['size'] > MAX_VID_SIZE) {
        echo json_encode(['error' => 'Vidéo trop lourde (max 200 Mo)']);
        exit;
    }
} else {
    if (!in_array($mime, ALLOWED_IMG_MIME)) {
        echo json_encode(['error' => 'Format image non autorisé (JPG, PNG, WebP)']);
        exit;
    }
    if ($file['size'] > MAX_IMG_SIZE) {
        echo json_encode(['error' => 'Image trop lourde (max 10 Mo)']);
        exit;
    }
}

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename = uniqid('yk_', true) . '.' . $ext;
$dest     = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Déplacement du fichier échoué']);
    exit;
}

echo json_encode([
    'ok'  => true,
    'url' => '../' . UPLOAD_URL . $filename,
]);
