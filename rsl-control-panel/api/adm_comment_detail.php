<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$id = (int)($_GET['id'] ?? 0);
if($id<=0) json_out(['success'=>false,'message'=>'ID inválido'],422);
try {
  $st = $pdo->prepare('SELECT c.id,c.report_id,c.user_id,c.comment,c.created_at,c.status,u.name AS user_name,u.email AS user_email,r.title AS report_title FROM report_comments c LEFT JOIN users u ON u.id=c.user_id LEFT JOIN reports r ON r.id=c.report_id WHERE c.id=? LIMIT 1');
  $st->execute([$id]);
  $row = $st->fetch(PDO::FETCH_ASSOC);
  if(!$row) json_out(['success'=>false,'message'=>'Comentário não encontrado'],404);
  json_out(['success'=>true,'comment'=>$row]);
} catch(Exception $e){ error_log('adm_comment_detail: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);}
