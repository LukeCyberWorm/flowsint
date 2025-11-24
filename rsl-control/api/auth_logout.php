<?php
// auth_logout.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

// Destroy session
session_destroy();

// Clear remember me cookie
if (isset($_COOKIE['remember_token'])) {
    setcookie('remember_token', '', time() - 3600, '/', '', true, true);
}

echo json_encode(['success' => true]);
