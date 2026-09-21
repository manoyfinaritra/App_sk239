<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$data = is_array($body) ? $body : [];
$action = $data['action'] ?? $_GET['action'] ?? '';

// ============================================================
// CONFIG BASE DE DONNÉES : détection auto local / InfinityFree
// ============================================================
$httpHost = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? '');
$isLocal = stripos($httpHost, 'localhost') !== false
    || stripos($httpHost, '127.0.0.1') !== false
    || stripos($httpHost, '::1') !== false
    || $httpHost === '';

if ($isLocal) {
    // XAMPP local
    $dbHost = 'localhost';
    $dbName = 'sk239';
    $dbUser = 'root';
    $dbPass = '';
} else {
    // InfinityFree (production)
    $dbHost = 'sql106.infinityfree.com';
    $dbName = 'if0_42970771_sk239';
    $dbUser = 'if0_42970771';
    $dbPass = 'RiVgXPVlnNQa';
}

try {
    $db = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($action === 'getSites') {
        $sites = $db->query('SELECT id, acct, nom, numeros, da, sa, ccl FROM site ORDER BY nom ASC')->fetchAll();
        respond(['success' => true, 'sites' => $sites]);
    }

    if ($action === 'connexion') {
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['motdepasse'] ?? '');
        $stmt = $db->prepare('SELECT id, email, motdepasse FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['motdepasse'])) {
            respond(['success' => false, 'message' => 'Email ou mot de passe incorrect.'], 401);
        }
        respond([
            'success' => true,
            'message' => 'Connexion réussie.',
            'user' => ['id' => (int) $user['id'], 'email' => $user['email']],
        ]);
    }

    $site = static function (array $source): array {
        $acct = filter_var($source['acct'] ?? null, FILTER_VALIDATE_INT);
        $nom = trim((string) ($source['nom'] ?? ''));
        if ($acct === false || $acct <= 0 || $nom === '') {
            respond(['success' => false, 'message' => 'ACCT valide et nom du site sont obligatoires.'], 422);
        }
        return [
            $acct, $nom,
            trim((string) ($source['numeros'] ?? '')),
            trim((string) ($source['da'] ?? '')),
            trim((string) ($source['sa'] ?? '')),
            trim((string) ($source['ccl'] ?? '')),
        ];
    };

    if ($action === 'addSite') {
        $values = $site($data);
        $check = $db->prepare('SELECT id FROM site WHERE acct = ? LIMIT 1');
        $check->execute([$values[0]]);
        if ($check->fetch()) respond(['success' => false, 'message' => 'Cet ACCT est déjà utilisé.'], 409);
        $stmt = $db->prepare('INSERT INTO site (acct, nom, numeros, da, sa, ccl) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute($values);
        respond(['success' => true, 'message' => 'Site ajouté.', 'id' => (int) $db->lastInsertId()]);
    }

    if ($action === 'updateSite') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) respond(['success' => false, 'message' => 'Identifiant de site invalide.'], 422);
        $values = $site($data);
        $check = $db->prepare('SELECT id FROM site WHERE acct = ? AND id != ? LIMIT 1');
        $check->execute([$values[0], $id]);
        if ($check->fetch()) respond(['success' => false, 'message' => 'Cet ACCT est déjà utilisé.'], 409);
        $stmt = $db->prepare('UPDATE site SET acct = ?, nom = ?, numeros = ?, da = ?, sa = ?, ccl = ? WHERE id = ?');
        $stmt->execute([...$values, $id]);
        respond(['success' => true, 'message' => 'Site modifié.']);
    }

    if ($action === 'deleteSite') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) respond(['success' => false, 'message' => 'Identifiant de site invalide.'], 422);
        $stmt = $db->prepare('DELETE FROM site WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) respond(['success' => false, 'message' => 'Site introuvable.'], 404);
        respond(['success' => true, 'message' => 'Site supprimé.']);
    }

    respond(['success' => false, 'message' => 'Action inconnue.'], 400);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    respond(['success' => false, 'message' => 'Connexion à la base de données impossible.'], 500);
}