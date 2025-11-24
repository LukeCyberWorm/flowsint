<?php
// dashboard_stats.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '5433');
define('DB_NAME', 'flowsint');
define('DB_USER', 'flowsint');
define('DB_PASS', 'flowsint');

try {
    $pdo = new PDO(
        "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Get total users
    $stmt = $pdo->query("SELECT COUNT(*) FROM profiles");
    $totalUsers = $stmt->fetchColumn();
    
    // Get total investigations (from custom_types or investigations table)
    $stmt = $pdo->query("SELECT COUNT(*) FROM custom_types WHERE status = 'published'");
    $totalInvestigations = $stmt->fetchColumn();
    
    // Get total flows
    $stmt = $pdo->query("SELECT COUNT(*) FROM flows");
    $totalFlows = $stmt->fetchColumn();
    
    // Calculate success rate (mock for now)
    $successRate = 98.5;
    
    echo json_encode([
        'totalUsers' => (int)$totalUsers,
        'totalInvestigations' => (int)$totalInvestigations,
        'totalFlows' => (int)$totalFlows,
        'successRate' => $successRate
    ]);
} catch (Exception $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    echo json_encode([
        'totalUsers' => 0,
        'totalInvestigations' => 0,
        'totalFlows' => 0,
        'successRate' => 0
    ]);
}
