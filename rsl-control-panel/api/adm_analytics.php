<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);

// Parâmetros: presets (days) ou intervalo custom (start/end YYYY-MM-DD)
$days = isset($_GET['days']) ? max(1,min(120,(int)$_GET['days'])) : 14;
$start = $_GET['start'] ?? null; $end = $_GET['end'] ?? null;
if($start && $end){
  $sd = DateTime::createFromFormat('Y-m-d',$start);
  $ed = DateTime::createFromFormat('Y-m-d',$end);
  if($sd && $ed && $sd <= $ed){
    $diff = $ed->diff($sd)->days;
    if($diff>120){ $sd = (clone $ed)->modify('-120 day'); }
    $days = $ed->diff($sd)->days + 1;
  } else { $start = $end = null; }
}

// Calcular período efetivo
$endDate = $end ? new DateTime($end) : new DateTime();
$endDate->setTime(0,0,0);
$startDate = $start ? new DateTime($start) : (clone $endDate)->modify('-'.($days-1).' day');
$periodDays = $endDate->diff($startDate)->days + 1;

function series($pdo,$table,$dateCol,$startDate,$endDate,$extraWhere='1=1'){
  $out=[];
  $sql = "SELECT DATE($dateCol) d, COUNT(*) c FROM $table WHERE $extraWhere AND $dateCol BETWEEN :start AND :end GROUP BY DATE($dateCol) ORDER BY d";
  $st=$pdo->prepare($sql); $st->bindValue(':start',$startDate->format('Y-m-d')); $st->bindValue(':end',$endDate->format('Y-m-d')); $st->execute();
  while($r=$st->fetch(PDO::FETCH_ASSOC)){ $out[$r['d']] = (int)$r['c']; }
  // pad
  $cur = clone $startDate;
  $filled=[];
  while($cur <= $endDate){ $d=$cur->format('Y-m-d'); $filled[]=['d'=>$d,'c'=>($out[$d]??0)]; $cur->modify('+1 day'); }
  return $filled;
}

try {
  $reportsSeries = series($pdo,'reports','created_at',$startDate,$endDate);
  $usersSeries = series($pdo,'users','created_at',$startDate,$endDate);
  $commentsSeries = series($pdo,'report_comments','created_at',$startDate,$endDate,'status="visible"');
  $likesSeries = series($pdo,'report_likes','created_at',$startDate,$endDate);
  // Top categorias
  $topCat = [];
  $st = $pdo->prepare('SELECT category, COUNT(*) c FROM reports WHERE category IS NOT NULL AND category<>"" GROUP BY category ORDER BY c DESC LIMIT 10');
  $st->execute(); $topCat=$st->fetchAll(PDO::FETCH_ASSOC);
  // Taxa aprovação (últimos 30d)
  // Status 30 dias (fixo)
  $ap = $pdo->query("SELECT 
    SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected,
    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending
    FROM reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetch(PDO::FETCH_ASSOC);

  // Status diário no range
  $sdSql = $pdo->prepare("SELECT DATE(created_at) d,
      SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) approved,
      SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) rejected,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) pending
    FROM reports WHERE created_at BETWEEN :start AND :end GROUP BY DATE(created_at) ORDER BY d");
  $sdSql->execute([':start'=>$startDate->format('Y-m-d'),':end'=>$endDate->format('Y-m-d')]);
  $statusDailyRaw=[]; while($r=$sdSql->fetch(PDO::FETCH_ASSOC)){ $statusDailyRaw[$r['d']]=$r; }
  $cur=clone $startDate; $statusDaily=[];
  while($cur <= $endDate){ $d=$cur->format('Y-m-d'); $row=$statusDailyRaw[$d] ?? ['d'=>$d,'approved'=>0,'rejected'=>0,'pending'=>0]; $statusDaily[]=$row; $cur->modify('+1 day'); }

  $range = ['start'=>$startDate->format('Y-m-d'),'end'=>$endDate->format('Y-m-d'),'days'=>$periodDays];
  json_out(['success'=>true,
    'range'=>$range,
    'reports'=>$reportsSeries,
    'users'=>$usersSeries,
    'comments'=>$commentsSeries,
    'likes'=>$likesSeries,
    'top_categories'=>$topCat,
    'status_30d'=>$ap,
    'status_daily'=>$statusDaily
  ]);
} catch(Exception $e){ error_log('adm_analytics: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro analytics'],500);} 
?>
