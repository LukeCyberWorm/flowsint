<?php
// auth_login.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '5433');
define('DB_NAME', 'flowsint');
define('DB_USER', 'flowsint');
define('DB_PASS', 'flowsint');

// Rate limiting
$maxAttempts = 5;
$lockoutTime = 900; // 15 minutes

try {
    $pdo = new PDO(
        "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;
    
    // Check rate limiting
    $ip = $_SERVER['REMOTE_ADDR'];
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as attempts 
        FROM admin_login_attempts 
        WHERE ip_address = ? 
        AND attempt_time > NOW() - INTERVAL '$lockoutTime seconds'
        AND success = false
    ");
    $stmt->execute([$ip]);
    $attempts = $stmt->fetch(PDO::FETCH_ASSOC)['attempts'];
    
    if ($attempts >= $maxAttempts) {
        // Log blocked attempt
        logSecurityEvent($pdo, 'LOGIN_BLOCKED', $ip, "Too many failed attempts");
        
        echo json_encode([
            'success' => false,
            'message' => 'Muitas tentativas falhas. Tente novamente em 15 minutos.'
        ]);
        exit;
    }
    
    // Validate admin credentials
    $stmt = $pdo->prepare("
        SELECT id, email, password_hash, name, role, active 
        FROM admins 
        WHERE email = ? AND active = true
    ");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin && password_verify($password, $admin['password_hash'])) {
        // Success - regenerate session ID
        session_regenerate_id(true);
        
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['admin_role'] = $admin['role'];
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Set cookie if remember me
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_token', $token, time() + (86400 * 30), '/', '', true, true);
            
            // Store token in database
            $stmt = $pdo->prepare("
                INSERT INTO admin_sessions (admin_id, token, expires_at) 
                VALUES (?, ?, NOW() + INTERVAL '30 days')
            ");
            $stmt->execute([$admin['id'], hash('sha256', $token)]);
        }
        
        // Log successful login
        $stmt = $pdo->prepare("
            INSERT INTO admin_login_attempts (admin_id, ip_address, user_agent, success) 
            VALUES (?, ?, ?, true)
        ");
        $stmt->execute([$admin['id'], $ip, $_SERVER['HTTP_USER_AGENT'] ?? '']);
        
        logSecurityEvent($pdo, 'LOGIN_SUCCESS', $ip, "Admin: {$admin['email']}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Login bem-sucedido'
        ]);
    } else {
        // Failed login
        $stmt = $pdo->prepare("
            INSERT INTO admin_login_attempts (ip_address, user_agent, success, email_attempted) 
            VALUES (?, ?, false, ?)
        ");
        $stmt->execute([$ip, $_SERVER['HTTP_USER_AGENT'] ?? '', $email]);
        
        logSecurityEvent($pdo, 'LOGIN_FAILED', $ip, "Email: $email");
        
        echo json_encode([
            'success' => false,
            'message' => 'Email ou senha inválidos'
        ]);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}

function logSecurityEvent($pdo, $event, $ip, $details) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO security_logs (event_type, ip_address, details, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$event, $ip, $details]);
    } catch (Exception $e) {
        error_log("Security log error: " . $e->getMessage());
    }
}
