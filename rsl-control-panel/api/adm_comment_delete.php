<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
if($_SERVER['REQUEST_METHOD']!=='POST'){ json_out(['success'=>false,'message'=>'Método inválido'],405); }
$in = json_decode(file_get_contents('php://input'),true) ?: [];
$id = (int)($in['id'] ?? 0);
if($id<=0) json_out(['success'=>false,'message'=>'ID inválido'],422);
try {
  $upd = $pdo->prepare('UPDATE report_comments SET status="deleted" WHERE id=? AND status="visible"');
  $upd->execute([$id]);
  $aff = $upd->rowCount();
  if($aff){
    $pdo->prepare('INSERT INTO admin_audit_log (admin_id, action, target_type, target_id) VALUES (?,?,?,?)')
        ->execute([$u['id'],'delete_comment','comment',$id]);
  }
  json_out(['success'=>true,'deleted'=>$aff>0]);
} catch(Exception $e){ error_log('adm_comment_delete: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
