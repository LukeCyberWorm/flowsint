<?php
require_once __DIR__.'/_bootstrap.php';
$admin = require_admin($pdo);
if($_SERVER['REQUEST_METHOD']!=='POST'){ json_out(['success'=>false,'message'=>'Método inválido'],405); }
$in = json_decode(file_get_contents('php://input'),true) ?: [];
$id = (int)($in['id'] ?? 0);
$action = $in['action'] ?? '';
if($id<=0) json_out(['success'=>false,'message'=>'ID inválido'],422);
if(!in_array($action,['approve','reject','pend'],'true')){} // placeholder
$map = [
  'approve'=>'approved',
  'reject'=>'rejected',
  'pend'=>'pending'
];
if(!isset($map[$action])) json_out(['success'=>false,'message'=>'Ação inválida'],422);
$newStatus = $map[$action];

try {
  $st = $pdo->prepare('SELECT status FROM reports WHERE id=? LIMIT 1');
  $st->execute([$id]);
  $cur = $st->fetchColumn();
  if(!$cur) json_out(['success'=>false,'message'=>'Registro não encontrado'],404);
  if($cur === $newStatus){ json_out(['success'=>true,'message'=>'Sem mudança','status'=>$cur]); }
  $up = $pdo->prepare('UPDATE reports SET status=? WHERE id=?');
  $up->execute([$newStatus,$id]);
  // audit
  try {
    $a = $pdo->prepare('INSERT INTO admin_audit_log (admin_id,action,target_type,target_id,ip,user_agent,meta) VALUES (?,?,?,?,?,?,?)');
    $ip = $_SERVER['REMOTE_ADDR'] ?? null; $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $meta = json_encode(['from'=>$cur,'to'=>$newStatus]);
    $a->execute([$admin['id'],'report_status_change','report',$id,$ip,$ua,$meta]);
  } catch(Exception $ae) { error_log('audit fail update report: '.$ae->getMessage()); }
  json_out(['success'=>true,'status'=>$newStatus]);
} catch(Exception $e){
  json_out(['success'=>false,'message'=>'Erro interno'],500);
}
?>
