<?php
// auth_check.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

// Check if session is valid
if (isset($_SESSION['admin_id']) && isset($_SESSION['last_activity'])) {
    // Check session timeout (30 minutes)
    $timeout = 1800;
    if (time() - $_SESSION['last_activity'] > $timeout) {
        session_destroy();
        echo json_encode(['authenticated' => false]);
        exit;
    }
    
    // Update last activity
    $_SESSION['last_activity'] = time();
    
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['admin_id'],
            'email' => $_SESSION['admin_email'],
            'name' => $_SESSION['admin_name'],
            'role' => $_SESSION['admin_role']
        ]
    ]);
} else {
    echo json_encode(['authenticated' => false]);
}
