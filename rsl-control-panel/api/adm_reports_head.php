<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$last = (int)($_GET['last'] ?? 0);
try {
  $st = $pdo->query('SELECT MAX(id) max_id, COUNT(*) total, SUM(CASE WHEN status="pending" THEN 1 ELSE 0 END) pending FROM reports');
  $row = $st->fetch(PDO::FETCH_ASSOC) ?: ['max_id'=>0,'total'=>0,'pending'=>0];
  $newCount = 0;
  if($last>0 && $row['max_id']>$last){
    $nq = $pdo->prepare('SELECT COUNT(*) FROM reports WHERE id>?');
    $nq->execute([$last]);
    $newCount = (int)$nq->fetchColumn();
  }
  json_out(['success'=>true,'max_id'=>(int)$row['max_id'],'total'=>(int)$row['total'],'pending'=>(int)$row['pending'],'new'=>$newCount]);
} catch(Exception $e){ error_log('adm_reports_head: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro'],500);}
