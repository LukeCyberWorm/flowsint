<?php
// Endpoint temporário para criar admin inicial
// Remover após uso! Bloqueia se já existirem admins (>=1) sem secret válido.
require_once __DIR__.'/_bootstrap.php';

if($_SERVER['REQUEST_METHOD']!=='POST') { json_out(['success'=>false,'message'=>'Método inválido'],405); }

$in = json_decode(file_get_contents('php://input'),true) ?: [];
$name = trim($in['name'] ?? '');
$email = strtolower(trim($in['email'] ?? ''));
$pass = $in['password'] ?? '';
$secret = trim($in['secret'] ?? '');

if(strlen($name)<2) json_out(['success'=>false,'message'=>'Nome curto'],422);
if(!filter_var($email,FILTER_VALIDATE_EMAIL)) json_out(['success'=>false,'message'=>'Email inválido'],422);
if(strlen($pass)<10) json_out(['success'=>false,'message'=>'Senha curta (min 10)'],422);
if(!preg_match('/[0-9]/',$pass) || !preg_match('/[!@#$%^&*()_+\-=\[\]{};:\"\\|,.<>\/?]/',$pass)) {
  json_out(['success'=>false,'message'=>'Senha precisa número e símbolo'],422);
}

// Conta quantos admins existem
$count = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
$envSecret = getenv('ADMIN_SETUP_SECRET');
// Nova regra simplificada: até 2 admins podem ser criados sem secret. A partir do terceiro exige secret.
if($count >= 2){
  if(!$envSecret) json_out(['success'=>false,'message'=>'Limite inicial (2) atingido. Defina ADMIN_SETUP_SECRET para novos admins.'],403);
  if(!hash_equals($envSecret,$secret)) json_out(['success'=>false,'message'=>'Token secreto inválido'],403);
}

// Verifica duplicidade
$st = $pdo->prepare('SELECT id FROM admins WHERE email=? LIMIT 1');
$st->execute([$email]);
if($st->fetch()) json_out(['success'=>false,'message'=>'Email já cadastrado'],409);

$hash = password_hash($pass,PASSWORD_DEFAULT);
$role='super'; // inicial sempre super
try {
  $ins = $pdo->prepare('INSERT INTO admins (name,email,password_hash,role,status) VALUES (?,?,?,?,"active")');
  $ins->execute([$name,$email,$hash,$role]);
  $aid = (int)$pdo->lastInsertId();
  // Audit opcional
  try { $ae = $pdo->prepare('INSERT INTO admin_audit_log (admin_id,action,ip,user_agent,meta) VALUES (NULL,?,?,?,?,?)'); } catch(Exception $ignore){}
  json_out(['success'=>true,'admin'=>['id'=>$aid,'email'=>$email,'role'=>$role]]);
} catch(Exception $e){
  json_out(['success'=>false,'message'=>'Erro gravando: '.$e->getMessage()],500);
}
?>
