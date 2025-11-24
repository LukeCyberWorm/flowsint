<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$page = max(1,(int)($_GET['page'] ?? 1));
$limit = min(300,max(20,(int)($_GET['limit'] ?? 100)));
$offset = ($page-1)*$limit;
$type = $_GET['type'] ?? '';
$where=[]; $params=[];
if($type==='user' || $type==='admin'){ $where[]='user_type=?'; $params[]=$type; }
$sqlWhere = $where? ('WHERE '.implode(' AND ',$where)) : '';
try {
  $cnt = $pdo->prepare("SELECT COUNT(*) FROM login_events $sqlWhere"); $cnt->execute($params); $total=(int)$cnt->fetchColumn();
  $sql = "SELECT id,user_type,principal_id,ip,city,region,country,user_agent,success,created_at FROM login_events $sqlWhere ORDER BY id DESC LIMIT ? OFFSET ?";
  $st = $pdo->prepare($sql);
  foreach($params as $i=>$p){ $st->bindValue($i+1,$p); }
  $st->bindValue(count($params)+1,$limit,PDO::PARAM_INT);
  $st->bindValue(count($params)+2,$offset,PDO::PARAM_INT);
  $st->execute();
  $rows=$st->fetchAll(PDO::FETCH_ASSOC);
  json_out(['success'=>true,'events'=>$rows,'total'=>$total,'page'=>$page,'limit'=>$limit]);
} catch(Exception $e){ error_log('adm_login_events: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
