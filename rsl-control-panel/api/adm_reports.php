<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);

$page = max(1,(int)($_GET['page'] ?? 1));
$limit = min(100, max(10,(int)($_GET['limit'] ?? 50)));
$offset = ($page-1)*$limit;

$where=[]; $params=[];
$status = $_GET['status'] ?? '';
if($status){ $where[]='r.status=?'; $params[]=$status; }
$search = trim($_GET['q'] ?? '');
if($search){ $where[]='(r.title LIKE ? OR r.description LIKE ?)'; $params[]="%$search%"; $params[]="%$search%"; }
$sqlWhere = $where? ('WHERE '.implode(' AND ', $where)) : '';

$total = (int)($pdo->prepare("SELECT COUNT(*) FROM reports r $sqlWhere")->execute($params) ? $pdo->prepare("SELECT COUNT(*) FROM reports r $sqlWhere") : 0);
$tc = $pdo->prepare("SELECT COUNT(*) FROM reports r $sqlWhere"); $tc->execute($params); $rowsTotal=(int)$tc->fetchColumn();

$sql = "SELECT r.id,r.title,r.category,r.status,r.created_at,r.reporter_name FROM reports r $sqlWhere ORDER BY r.id DESC LIMIT ? OFFSET ?";
$st = $pdo->prepare($sql);
foreach($params as $i=>$p){ $st->bindValue($i+1,$p); }
$st->bindValue(count($params)+1,$limit,PDO::PARAM_INT);
$st->bindValue(count($params)+2,$offset,PDO::PARAM_INT);
$st->execute();
$rows=$st->fetchAll(PDO::FETCH_ASSOC);

json_out(['success'=>true,'reports'=>$rows,'page'=>$page,'limit'=>$limit,'total'=>$rowsTotal]);
?>
