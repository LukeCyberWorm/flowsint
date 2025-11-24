<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$page = max(1,(int)($_GET['page'] ?? 1));
$limit = min(200,max(20,(int)($_GET['limit'] ?? 100)));
$offset = ($page-1)*$limit;
try {
  $cnt = $pdo->query('SELECT COUNT(*) FROM admin_audit_log'); $total=(int)$cnt->fetchColumn();
  $st = $pdo->prepare('SELECT l.id,l.action,l.target_type,l.target_id,l.ip,l.created_at,a.name as admin_name FROM admin_audit_log l LEFT JOIN admins a ON a.id=l.admin_id ORDER BY l.id DESC LIMIT ? OFFSET ?');
  $st->bindValue(1,$limit,PDO::PARAM_INT); $st->bindValue(2,$offset,PDO::PARAM_INT); $st->execute();
  $rows=$st->fetchAll(PDO::FETCH_ASSOC);
  json_out(['success'=>true,'logs'=>$rows,'total'=>$total,'page'=>$page,'limit'=>$limit]);
} catch(Exception $e){ error_log('adm_audit_log: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
