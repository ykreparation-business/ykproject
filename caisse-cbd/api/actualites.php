<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$cfg = natirel_config();
header('Access-Control-Allow-Origin: ' . $cfg['allowed_origin']);
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
header('Access-Control-Allow-Methods: GET, OPTIONS');

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

$feedUrl = $_GET['url'] ?? '';
if (!$feedUrl) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètre url manquant.']);
    exit;
}

// Garde-fou anti-SSRF : on ne va jamais chercher une adresse locale/privée —
// y compris après une redirection (voir natirel_fetch_feed), sans quoi un
// flux qui redirige vers une adresse interne contournerait ce contrôle.
function natirel_url_autorisee($url) {
    $parsed = parse_url($url);
    $scheme = strtolower($parsed['scheme'] ?? '');
    $host = strtolower($parsed['host'] ?? '');
    if (!$parsed || !in_array($scheme, ['http', 'https'], true) || $host === '') {
        return false;
    }
    $estPrive = $host === 'localhost'
        || preg_match('/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/', $host)
        || $host === '::1';
    return !$estPrive;
}

if (!natirel_url_autorisee($feedUrl)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL de flux invalide ou non autorisée.']);
    exit;
}

function natirel_fetch_feed($url, $sautsRestants = 3) {
    if ($sautsRestants < 0) {
        throw new Exception('Trop de redirections.');
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false, // on gère la redirection nous-mêmes pour revalider chaque saut
        CURLOPT_TIMEOUT => 8,
        CURLOPT_USERAGENT => 'NatirelCaisse/1.0 (agrégateur de flux RSS)',
    ]);
    $body = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $location = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);

    if ($body === false) throw new Exception('Impossible de récupérer le flux : ' . $err);

    if (in_array($code, [301, 302, 303, 307, 308], true) && $location) {
        if (!natirel_url_autorisee($location)) {
            throw new Exception('Le flux redirige vers une adresse non autorisée.');
        }
        return natirel_fetch_feed($location, $sautsRestants - 1);
    }

    if ($code >= 400) throw new Exception('Le flux a répondu avec le code ' . $code);
    return $body;
}

function natirel_strip_texte($html) {
    $texte = html_entity_decode(strip_tags((string) $html), ENT_QUOTES, 'UTF-8');
    $texte = preg_replace('/\s+/', ' ', trim($texte));
    if (mb_strlen($texte) > 220) $texte = mb_substr($texte, 0, 217) . '…';
    return $texte;
}

function natirel_parse_feed($xmlString) {
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($xmlString);
    if ($xml === false) throw new Exception('Flux illisible (XML invalide).');

    $items = [];

    if (isset($xml->channel) && count($xml->channel->item) > 0) {
        // RSS 2.0
        foreach ($xml->channel->item as $item) {
            $items[] = [
                'titre' => natirel_strip_texte((string) $item->title),
                'lien' => (string) $item->link,
                'date' => (string) $item->pubDate,
                'resume' => natirel_strip_texte((string) ($item->description ?? '')),
            ];
        }
    } elseif (count($xml->entry) > 0) {
        // Atom
        foreach ($xml->entry as $entry) {
            $lien = '';
            foreach ($entry->link as $l) {
                $attrs = $l->attributes();
                if (!isset($attrs['rel']) || (string) $attrs['rel'] === 'alternate') {
                    $lien = (string) $attrs['href'];
                    break;
                }
            }
            $items[] = [
                'titre' => natirel_strip_texte((string) $entry->title),
                'lien' => $lien,
                'date' => (string) ($entry->updated ?? $entry->published ?? ''),
                'resume' => natirel_strip_texte((string) ($entry->summary ?? $entry->content ?? '')),
            ];
        }
    }

    return array_slice($items, 0, 10);
}

$cacheFile = sys_get_temp_dir() . '/natirel_feed_' . md5($feedUrl) . '.json';
$cacheMaxAge = 1800; // 30 minutes : évite de solliciter le site source à chaque ouverture de l'app

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheMaxAge) {
    echo file_get_contents($cacheFile);
    exit;
}

try {
    $xmlBody = natirel_fetch_feed($feedUrl);
    $items = natirel_parse_feed($xmlBody);
    $out = json_encode(['items' => $items, 'recupereLe' => gmdate('c')]);
    @file_put_contents($cacheFile, $out);
    echo $out;
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
