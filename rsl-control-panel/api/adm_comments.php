<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);

$page = max(1,(int)($_GET['page'] ?? 1));
$limit = min(200,max(20,(int)($_GET['limit'] ?? 50)));
$offset = ($page-1)*$limit;
$rid = (int)($_GET['report_id'] ?? 0);

$where = ['c.status="visible"']; $params=[];
if($rid>0){ $where[]='c.report_id=?'; $params[]=$rid; }
$search = trim($_GET['q'] ?? '');
if($search){ $where[]='c.comment LIKE ?'; $params[]="%$search%"; }
$sqlWhere = 'WHERE '.implode(' AND ',$where);

try {
  $cnt = $pdo->prepare("SELECT COUNT(*) FROM report_comments c $sqlWhere");
  $cnt->execute($params); $total=(int)$cnt->fetchColumn();

  $sql = "SELECT c.id,c.report_id,c.user_id,c.comment,c.created_at,u.name AS user_name,r.title AS report_title
          FROM report_comments c
          LEFT JOIN users u ON u.id=c.user_id
          LEFT JOIN reports r ON r.id=c.report_id
          $sqlWhere
          ORDER BY c.created_at DESC
          LIMIT ? OFFSET ?";
  $st = $pdo->prepare($sql);
  foreach($params as $i=>$p){ $st->bindValue($i+1,$p); }
  $st->bindValue(count($params)+1,$limit,PDO::PARAM_INT);
  $st->bindValue(count($params)+2,$offset,PDO::PARAM_INT);
  $st->execute();
  $rows=$st->fetchAll(PDO::FETCH_ASSOC);
  json_out(['success'=>true,'comments'=>$rows,'total'=>$total,'page'=>$page,'limit'=>$limit]);
} catch(Exception $e){ error_log('adm_comments: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500); }
?>
