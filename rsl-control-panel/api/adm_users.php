<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$page = max(1,(int)($_GET['page'] ?? 1));
$limit = min(200,max(10,(int)($_GET['limit'] ?? 50)));
$offset = ($page-1)*$limit;
$q = trim($_GET['q'] ?? '');
$where=[]; $params=[];
if($q){ $where[]='(name LIKE ? OR email LIKE ?)'; $params[]="%$q%"; $params[]="%$q%"; }
$sqlWhere = $where? ('WHERE '.implode(' AND ',$where)) : '';
try {
  $cnt = $pdo->prepare("SELECT COUNT(*) FROM users $sqlWhere"); $cnt->execute($params); $total=(int)$cnt->fetchColumn();
  $sql = "SELECT id,name,email,provider,created_at FROM users $sqlWhere ORDER BY id DESC LIMIT ? OFFSET ?";
  $st = $pdo->prepare($sql);
  foreach($params as $i=>$p){ $st->bindValue($i+1,$p); }
  $st->bindValue(count($params)+1,$limit,PDO::PARAM_INT);
  $st->bindValue(count($params)+2,$offset,PDO::PARAM_INT);
  $st->execute();
  $rows=$st->fetchAll(PDO::FETCH_ASSOC);
  json_out(['success'=>true,'users'=>$rows,'total'=>$total,'page'=>$page,'limit'=>$limit]);
} catch(Exception $e){ error_log('adm_users: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
