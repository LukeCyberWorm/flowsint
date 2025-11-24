<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
try {
  $reports_total = (int)$pdo->query('SELECT COUNT(*) FROM reports')->fetchColumn();
  $reports_pending = (int)$pdo->query("SELECT COUNT(*) FROM reports WHERE status='pending'")->fetchColumn();
  $reports_today = (int)$pdo->query("SELECT COUNT(*) FROM reports WHERE DATE(created_at)=CURDATE()")->fetchColumn();
  $users_total = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
  $users_today = (int)$pdo->query('SELECT COUNT(*) FROM users WHERE DATE(created_at)=CURDATE()')->fetchColumn();
  $comments_total = (int)$pdo->query('SELECT COUNT(*) FROM report_comments WHERE status="visible"')->fetchColumn();
  $likes_total = (int)$pdo->query('SELECT COUNT(*) FROM report_likes')->fetchColumn();
  $logins_24h = (int)$pdo->query('SELECT COUNT(*) FROM sessions WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)')->fetchColumn();
  // Distribuição por provider
  $provStmt = $pdo->query("SELECT COALESCE(provider,'local') as provider, COUNT(*) cnt FROM users GROUP BY COALESCE(provider,'local')");
  $providers = [];
  while($row=$provStmt->fetch(PDO::FETCH_ASSOC)){ $providers[$row['provider']] = (int)$row['cnt']; }
  json_out(['success'=>true,
    'reports_total'=>$reports_total,
    'reports_pending'=>$reports_pending,
    'reports_today'=>$reports_today,
    'users_total'=>$users_total,
    'users_today'=>$users_today,
    'comments_total'=>$comments_total,
    'likes_total'=>$likes_total,
    'logins_24h'=>$logins_24h,
    'providers'=>$providers
  ]);
} catch(Exception $e){
  error_log('adm_stats: '.$e->getMessage());
  json_out(['success'=>false,'message'=>'Erro interno'],500);
}
?>
