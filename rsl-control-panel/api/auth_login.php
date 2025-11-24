<?php
require_once __DIR__.'/_bootstrap.php';
if($_SERVER['REQUEST_METHOD']!=='POST'){ json_out(['success'=>false,'message'=>'Método inválido'],405); }
$in = json_decode(file_get_contents('php://input'),true) ?: [];
$email = strtolower(trim($in['email'] ?? ''));
$pass = $in['password'] ?? '';
if(!filter_var($email,FILTER_VALIDATE_EMAIL)){ json_out(['success'=>false,'message'=>'Email inválido'],422); }
if(strlen($pass)<6){ json_out(['success'=>false,'message'=>'Credenciais inválidas'],422); }

try {
  // Busca admin
  $st = $pdo->prepare('SELECT id,name,email,password_hash,role FROM admins WHERE email=? AND status="active" LIMIT 1');
  $st->execute([$email]);
  $adm = $st->fetch(PDO::FETCH_ASSOC);
  if(!$adm || !password_verify($pass,$adm['password_hash'])){
    json_out(['success'=>false,'message'=>'Credenciais inválidas'],401);
  }
  // Gera token
  $token = bin2hex(random_bytes(32));
  $exp = date('Y-m-d H:i:s', time()+3600*8);
  $ins = $pdo->prepare('INSERT INTO admin_tokens (admin_id, token, expires_at) VALUES (?,?,?)');
  $ins->execute([$adm['id'],$token,$exp]);
  // Audit + login event
  $ip = $_SERVER['REMOTE_ADDR'] ?? null; $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
  try {
    $ae = $pdo->prepare('INSERT INTO admin_audit_log (admin_id, action, ip, user_agent, meta) VALUES (?,?,?,?,?)');
    $ae->execute([$adm['id'],'admin_login',$ip,$ua,null]);
    $le = $pdo->prepare('INSERT INTO login_events (user_type, principal_id, ip, user_agent, success) VALUES (?,?,?,?,1)');
    $le->execute(['admin',$adm['id'],$ip,$ua]);
  // Envio de alerta por email (não bloquear fluxo em caso de falha)
  try { require_once __DIR__.'/adm_email_notify.php'; send_admin_login_alert($adm,$ip,$ua); } catch(Exception $em) { error_log('admin login alert fail: '.$em->getMessage()); }
  } catch(Exception $ie) { error_log('audit fail: '.$ie->getMessage()); }
  json_out(['success'=>true,'user'=>['id'=>$adm['id'],'name'=>$adm['name'],'email'=>$adm['email'],'role'=>$adm['role']], 'csrf'=>substr(hash('sha256',$token),0,32),'token'=>$token]);
} catch(Exception $e){
  error_log('ADM login: '.$e->getMessage());
  json_out(['success'=>false,'message'=>'Erro interno'],500);
}
?>
