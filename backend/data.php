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

    // ============================================================
    // RAPPORTS : stockage en base (remplace localStorage)
    // Table `rapport` : 1 ligne = 1 événement d'alarme exporté.
    // ============================================================

    $toDatetime = static function ($value): ?string {
        $value = trim((string) ($value ?? ''));
        if ($value === '') return null;
        // datetime-local "2026-09-16T19:14" -> "2026-09-16 19:14:00"
        $value = str_replace('T', ' ', $value);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return $value . ' 00:00:00';
        if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value)) return $value . ':00';
        if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value)) return $value;
        return $value;
    };

    if ($action === 'getReports') {
        $date = trim((string) ($_GET['date'] ?? $data['date'] ?? ''));
        if ($date !== '' && preg_match('/^\d{4}-\d{2}-\d{2}/', $date)) {
            $day = substr($date, 0, 10);
            $stmt = $db->prepare('SELECT id, titre, date_rapport, site, acct, call_no, detector, alarm_info, alarm_time, handle_remark, created_at FROM rapport WHERE DATE(date_rapport) = ? ORDER BY date_rapport DESC, site ASC, id ASC');
            $stmt->execute([$day]);
        } else {
            $stmt = $db->query('SELECT id, titre, date_rapport, site, acct, call_no, detector, alarm_info, alarm_time, handle_remark, created_at FROM rapport ORDER BY date_rapport DESC, site ASC, id ASC');
        }
        respond(['success' => true, 'reports' => $stmt->fetchAll()]);
    }

    if ($action === 'saveReport') {
        $titre = trim((string) ($data['titre'] ?? $data['title'] ?? 'Rapport'));
        if ($titre === '') $titre = 'Rapport';
        $dateRapport = $toDatetime($data['date_rapport'] ?? $data['reportDate'] ?? null);
        $rows = $data['rows'] ?? [];
        if (!is_array($rows) || count($rows) === 0) respond(['success' => false, 'message' => 'Aucune ligne de rapport à enregistrer.'], 422);
        $stmt = $db->prepare('INSERT INTO rapport (titre, date_rapport, site, acct, call_no, detector, alarm_info, alarm_time, handle_remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $db->beginTransaction();
        $count = 0;
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $site = trim((string) ($row['site'] ?? 'Site non renseigné'));
            if ($site === '') $site = 'Site non renseigné';
            $stmt->execute([
                $titre,
                $dateRapport,
                $site,
                trim((string) ($row['acct'] ?? '')),
                trim((string) ($row['callNo'] ?? $row['call_no'] ?? '')),
                trim((string) ($row['detector'] ?? '')),
                trim((string) ($row['alarmInfo'] ?? $row['alarm_info'] ?? '')),
                trim((string) ($row['alarmTime'] ?? $row['alarm_time'] ?? '')),
                trim((string) ($row['handleRemark'] ?? $row['handle_remark'] ?? $row['negativeAlarm'] ?? '')),
            ]);
            $count++;
        }
        $db->commit();
        if ($count === 0) respond(['success' => false, 'message' => 'Aucune ligne de rapport à enregistrer.'], 422);
        respond(['success' => true, 'message' => 'Rapport enregistré en base.', 'count' => $count]);
    }

    if ($action === 'deleteReportEvents') {
        $ids = $data['ids'] ?? [];
        if (!is_array($ids)) $ids = [$ids];
        $ids = array_values(array_filter(array_map(static fn($v) => filter_var($v, FILTER_VALIDATE_INT), $ids), static fn($v) => $v !== false && $v > 0));
        if (count($ids) === 0) respond(['success' => false, 'message' => 'Aucun événement à supprimer.'], 422);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $db->prepare("DELETE FROM rapport WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        respond(['success' => true, 'message' => 'Événement(s) supprimé(s).', 'deleted' => $stmt->rowCount()]);
    }

    if ($action === 'deleteSiteEvents') {
        $site = trim((string) ($data['site'] ?? ''));
        $date = substr(trim((string) ($data['date'] ?? '')), 0, 10);
        if ($site === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) respond(['success' => false, 'message' => 'Site et date (AAAA-MM-JJ) requis.'], 422);
        $stmt = $db->prepare('DELETE FROM rapport WHERE site = ? AND DATE(date_rapport) = ?');
        $stmt->execute([$site, $date]);
        respond(['success' => true, 'message' => 'Événement(s) du site supprimé(s).', 'deleted' => $stmt->rowCount()]);
    }

    respond(['success' => false, 'message' => 'Action inconnue.'], 400);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    respond(['success' => false, 'message' => 'Connexion à la base de données impossible.'], 500);
}