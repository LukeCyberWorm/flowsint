<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$id = (int)($_GET['id'] ?? 0);
if($id<=0) json_out(['success'=>false,'message'=>'ID inválido'],422);
try {
  $st = $pdo->prepare('SELECT r.id,r.title,r.description,r.category,IFNULL(r.status, "pending") as status,r.created_at,r.reporter_name,r.reporter_email,r.reporter_phone,r.reporter_city,r.scammer_name,r.scammer_phone,r.scammer_email,r.loss_amount FROM reports r WHERE r.id=?');
  $st->execute([$id]);
  $rep = $st->fetch(PDO::FETCH_ASSOC);
  if(!$rep) json_out(['success'=>false,'message'=>'Denúncia não encontrada'],404);
  // Comentários associados (limite 30)
  $cm = $pdo->prepare('SELECT c.id,c.comment,c.created_at,u.name AS user_name FROM report_comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.report_id=? AND c.status="visible" ORDER BY c.id DESC LIMIT 30');
  $cm->execute([$id]);
  $comments=$cm->fetchAll(PDO::FETCH_ASSOC);
  // Likes count
  $lk = $pdo->prepare('SELECT COUNT(*) FROM report_likes WHERE report_id=?');
  $lk->execute([$id]);
  $likes=(int)$lk->fetchColumn();
  json_out(['success'=>true,'report'=>$rep,'comments'=>$comments,'likes'=>$likes]);
} catch(Exception $e){ error_log('adm_report_detail: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
