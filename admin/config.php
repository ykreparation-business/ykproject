<?php
/* ─────────────────────────────────────────────
   Configuration du panneau admin
   Mot de passe par défaut : YkStudio2024
   Changez-le via admin → "Mot de passe"
───────────────────────────────────────────── */
define('ADMIN_PASSWORD_HASH', '$2y$12$MrFwJKxlM7d4GaeQ4Dxiae7mYIQKYxEKv6PlYlmL8okFNQxXaxIC6');

define('CONTENT_FILE', dirname(__DIR__) . '/content.json');
define('UPLOAD_DIR',   dirname(__DIR__) . '/assets/uploads/');
define('UPLOAD_URL',   'assets/uploads/');
define('MAX_IMG_SIZE', 10 * 1024 * 1024);   // 10 MB
define('MAX_VID_SIZE', 200 * 1024 * 1024);  // 200 MB

define('ALLOWED_IMG_MIME', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
define('ALLOWED_VID_MIME', ['video/mp4', 'video/quicktime', 'video/x-msvideo']);
