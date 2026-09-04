<?php

function natirel_config() {
    static $config = null;
    if ($config !== null) return $config;

    $path = __DIR__ . '/config.php';
    if (!file_exists($path)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        die(json_encode(['error' => "config.php manquant. Copiez config.example.php vers config.php et renseignez vos identifiants."]));
    }
    $config = require $path;
    return $config;
}

function natirel_pdo() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $cfg = natirel_config();
    $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        die(json_encode(['error' => 'Connexion à la base de données impossible.']));
    }
}
