<?php
// Common admin bootstrap: secure session + db + helpers
// Ambiente 1 (mesmo domínio): existe ../../api/config.php
// Ambiente 2 (subdomínio separado): só a pasta ADM foi enviada → precisamos fallback.

$configLoaded = false;
$possible = [
  __DIR__.'/../../api/config.php',   // estrutura completa (raiz/api/config.php)
  __DIR__.'/../config.php',          // se moveram config para ADM/api/..
  dirname(__DIR__,3).'/api/config.php' // tentativa extra caso nível diferente
];
foreach($possible as $p){
  if(file_exists($p)){
    require_once $p; // deve definir $pdo
    $configLoaded = true;
    break;
  }
}

// helpers (tentar localizar)
$helpersLoaded = false;
$helpersPaths = [
  __DIR__.'/../../api/helpers.php',
  __DIR__.'/../helpers.php',
  dirname(__DIR__,3).'/api/helpers.php'
];
foreach($helpersPaths as $hp){
  if(file_exists($hp)) { require_once $hp; $helpersLoaded=true; break; }
}

// Fallback manual de conexão se config não foi encontrado
if(!$configLoaded){
  $DB_HOST = getenv('DB_HOST') ?: 'localhost';
  $DB_NAME = getenv('DB_NAME') ?: 'denuncia_golpe';
  $DB_USER = getenv('DB_USER') ?: 'usuario';
  $DB_PASS = getenv('DB_PASS') ?: 'senha';
  $DB_CHARSET = getenv('DB_CHARSET') ?: 'utf8mb4';
  $DB_PORT = getenv('DB_PORT') ?: '3306';
  $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset={$DB_CHARSET}";
  try {
    $pdo = new PDO($dsn,$DB_USER,$DB_PASS,[
      PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES=>false,
    ]);
  } catch(Throwable $e){
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success'=>false,'message'=>'Falha conectar banco (admin)','detail'=>$e->getMessage()]);
    exit;
  }
}

// Stronger headers
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

function json_out($arr,$code=200){ http_response_code($code); header('Content-Type: application/json; charset=utf-8'); echo json_encode($arr); exit; }

function adm_auth_user($pdo){
  $hdr = $_SERVER['HTTP_X_ADM_TOKEN'] ?? null; // header token
  if(!$hdr) return null;
  try {
    $st = $pdo->prepare('SELECT a.id,a.name,a.email,a.role FROM admins a JOIN admin_tokens t ON t.admin_id=a.id WHERE t.token=? AND t.expires_at>NOW()');
    $st->execute([$hdr]);
    $u=$st->fetch(PDO::FETCH_ASSOC);
    return $u?:null;
  } catch(Exception $e){
    error_log('adm_auth_user fail: '.$e->getMessage());
    return null;
  }
}

function require_admin($pdo){ $u = adm_auth_user($pdo); if(!$u){ json_out(['success'=>false,'message'=>'Não autorizado'],401); } return $u; }
?>
