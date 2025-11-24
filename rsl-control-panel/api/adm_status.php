<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
header('Content-Type: application/json; charset=utf-8');

function microtime_float(){ return microtime(true); }

$out = [ 'success'=>true ];
try {
  // DB ping & latency
  $t0 = microtime_float();
  $pdo->query('SELECT 1');
  $out['db_latency_ms'] = round((microtime_float()-$t0)*1000,2);

  // Versões
  $out['php_version'] = PHP_VERSION;
  $out['db_server_version'] = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);

  // Última denúncia / atividade
  $out['last_report_at'] = $pdo->query('SELECT created_at FROM reports ORDER BY id DESC LIMIT 1')->fetchColumn();
  $out['last_user_signup'] = $pdo->query('SELECT created_at FROM users ORDER BY id DESC LIMIT 1')->fetchColumn();

  // Contagens recentes
  $out['reports_1h'] = (int)$pdo->query("SELECT COUNT(*) FROM reports WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)")->fetchColumn();

  // Verificar existência de system_logs antes de consultar
  $out['errors_24h'] = null; // default
  try {
    $hasSystemLogs = $pdo->query("SHOW TABLES LIKE 'system_logs'")->rowCount() > 0;
    if($hasSystemLogs){
      $out['errors_24h'] = (int)$pdo->query("SELECT COUNT(*) FROM system_logs WHERE level='error' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)")->fetchColumn();
    }
  } catch(Exception $e){ /* ignora */ }

  // Sessões ativas aproximadas (última atividade < 15 min) se existir tabela sessions
  try { $out['active_sessions_15m'] = (int)$pdo->query("SELECT COUNT(*) FROM sessions WHERE updated_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)")->fetchColumn(); } catch(Exception $e){ $out['active_sessions_15m']=null; }

  // Estado simplificado
  $state = 'operacional';
  if($out['db_latency_ms']>800) $state='lento';
  if(isset($out['errors_24h']) && $out['errors_24h']!==null && $out['errors_24h']>50) $state='alerta';
  $out['state'] = $state;

  echo json_encode($out);
} catch(Exception $e){
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Falha ao coletar status','error'=>$e->getMessage()]);
}
?>