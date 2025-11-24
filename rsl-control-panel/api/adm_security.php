<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
header('Content-Type: application/json; charset=utf-8');

$out=['success'=>true];
try {
  // Falhas de login últimas 24h
  $out['failed_logins_24h'] = (int)$pdo->query("SELECT COUNT(*) FROM login_events WHERE success=0 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)")->fetchColumn();
  // Falhas de login por IP (top 10)
  $st = $pdo->query("SELECT ip, COUNT(*) c FROM login_events WHERE success=0 AND ip IS NOT NULL AND ip<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY ip ORDER BY c DESC LIMIT 10");
  $out['top_failed_ips'] = $st->fetchAll(PDO::FETCH_ASSOC);

  // Agressividade (IPs com > 20 falhas nas últimas 6h)
  $st = $pdo->query("SELECT ip, COUNT(*) c FROM login_events WHERE success=0 AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR) GROUP BY ip HAVING c>20 ORDER BY c DESC LIMIT 20");
  $out['suspicious_bruteforce'] = $st->fetchAll(PDO::FETCH_ASSOC);

  // Detecção simples de user-agents suspeitos (contém bot / crawler / script)
  $st = $pdo->query("SELECT user_agent, COUNT(*) c FROM login_events WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY user_agent ORDER BY c DESC LIMIT 200");
  $uaRows = $st->fetchAll(PDO::FETCH_ASSOC);
  $sus = [];
  foreach($uaRows as $r){
    if(!$r['user_agent']) continue;
    if(preg_match('/(curl|wget|python|bot|crawler|spider|scrapy|httpclient|axios|go-http|java)/i',$r['user_agent'])){
      $sus[]=$r;
    }
  }
  $out['suspicious_user_agents'] = array_slice($sus,0,25);

  // Latência DB rápida
  try { $t0=microtime(true); $pdo->query('SELECT 1'); $out['db_latency_ms']=round((microtime(true)-$t0)*1000,2); } catch(Exception $e){ $out['db_latency_ms']=null; }

  // Tentativas de acesso admin inexistentes (se audit disponível)
  try {
    $hasAudit = $pdo->query("SHOW TABLES LIKE 'audit_log'")->rowCount()>0;
    if($hasAudit){
      $out['admin_errors_24h'] = (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE level='error' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)")->fetchColumn();
    }
  } catch(Exception $e){ $out['admin_errors_24h']=null; }

  // Placeholder para ataques DDOS (usar integração externa / logs nginx)
  $out['ddos_indicator'] = [ 'note'=>'Integre logs de acesso ou WAF para métricas reais', 'requests_peak_last_hour'=>null ];

  // -------- Métricas de Rede / Serviços --------
  $host = $_SERVER['HTTP_HOST'] ?? php_uname('n');
  $out['network_host'] = $host;
  $dnsStart = microtime(true);
  $ip = gethostbyname($host);
  $out['dns_time_ms'] = round((microtime(true)-$dnsStart)*1000,2);
  $out['network_ip'] = $ip;

  $services = [];
  // HTTP / HTTPS
  foreach([80=>'HTTP',443=>'HTTPS'] as $p=>$label){
    $s=microtime(true); $ok=false; try{ $fp=@fsockopen($ip,$p,$errno,$errstr,0.5); if($fp){$ok=true; fclose($fp);} }catch(Exception $e){}
    $lat=(int)round((microtime(true)-$s)*1000);
    $services[]=['service'=>$label,'port'=>$p,'ok'=>$ok,'latency_ms'=>$lat];
  }
  // MySQL via PDO já estabelecido
  $dbHost = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
  $dbPort = defined('DB_PORT') ? DB_PORT : (getenv('DB_PORT') ?: 3306);
  $mysqlOk=false; $mysqlLatency=null; $mysqlConnectLatency=null; $mysqlMethod='pdo';
  try { $t0=microtime(true); $pdo->query('SELECT 1'); $mysqlLatency=round((microtime(true)-$t0)*1000,2); $mysqlOk=true; } catch(Exception $e){ $mysqlOk=false; }
  if(!$mysqlOk){
    $mysqlMethod='socket';
    $s=microtime(true); try{ $fp=@fsockopen($dbHost,$dbPort,$errno,$errstr,0.8); if($fp){ $mysqlOk=true; fclose($fp);} }catch(Exception $e){}
    $mysqlConnectLatency=(int)round((microtime(true)-$s)*1000);
  }
  $services[]=[ 'service'=>'MySQL','port'=>(int)$dbPort,'ok'=>$mysqlOk,'latency_ms'=>$mysqlLatency ?? $mysqlConnectLatency,'host'=>$dbHost,'method'=>$mysqlMethod ];
  // Redis opcional
  $redisHost = getenv('REDIS_HOST'); $redisPort = getenv('REDIS_PORT') ?: 6379;
  if($redisHost){
    $s=microtime(true); $redisOk=false; try{ $fp=@fsockopen($redisHost,$redisPort,$errno,$errstr,0.4); if($fp){$redisOk=true; fclose($fp);} }catch(Exception $e){}
    $lat=(int)round((microtime(true)-$s)*1000);
    $services[]=['service'=>'Redis','port'=>(int)$redisPort,'ok'=>$redisOk,'latency_ms'=>$lat,'host'=>$redisHost];
  }
  $out['services']=$services;

  // IPs ativos últimos 5 minutos (site e painel separados) - inclui visitantes não logados (site_visit_events)
  try {
    $sqlSite = "SELECT ip, COUNT(*) c, MAX(last_seen) last_seen, MAX(city) city, MAX(region) region, MAX(country) country FROM (
                  SELECT ip, created_at last_seen, city, region, country FROM site_visit_events WHERE ip IS NOT NULL AND ip<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                  UNION ALL
                  SELECT ip, created_at last_seen, city, region, country FROM login_events WHERE user_type='user' AND ip IS NOT NULL AND ip<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                ) u GROUP BY ip ORDER BY last_seen DESC LIMIT 120";
    $out['active_site_ips'] = $pdo->query($sqlSite)->fetchAll(PDO::FETCH_ASSOC);
    $out['visit_stats'] = [
      'site_visits_15m'=>(int)$pdo->query("SELECT COUNT(*) FROM site_visit_events WHERE created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)")->fetchColumn(),
      'site_unique_ips_15m'=>(int)$pdo->query("SELECT COUNT(DISTINCT ip) FROM site_visit_events WHERE created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)")->fetchColumn(),
      'site_visits_declined_15m'=>(int)$pdo->query("SELECT COUNT(*) FROM site_visit_events WHERE declined=1 AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)")->fetchColumn()
    ];
  } catch(Exception $e){ $out['active_site_ips']=[]; $out['active_site_ips_error']=$e->getMessage(); }
  try {
    $sqlAdm = "SELECT t.ip, t.c, t.last_seen, le.city, le.region, le.country
               FROM (
                 SELECT ip, COUNT(*) c, MAX(id) max_id, MAX(created_at) last_seen
                 FROM login_events
                 WHERE user_type='admin' AND ip IS NOT NULL AND ip<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                 GROUP BY ip
                 ORDER BY last_seen DESC
                 LIMIT 30
               ) t
               LEFT JOIN login_events le ON le.id = t.max_id
               ORDER BY t.last_seen DESC";
    $out['active_admin_ips'] = $pdo->query($sqlAdm)->fetchAll(PDO::FETCH_ASSOC);
  } catch(Exception $e){ $out['active_admin_ips']=[]; }

  // -------- Blacklist Candidates (login brute force baseline) --------
  $blacklist = [];
  $sql = "SELECT ip,
            SUM(CASE WHEN success=0 THEN 1 ELSE 0 END) failed_total,
            SUM(CASE WHEN success=0 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) failed_24h,
            SUM(CASE WHEN success=0 AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR) THEN 1 ELSE 0 END) failed_6h,
            MAX(created_at) last_attempt,
            COUNT(*) total_events
          FROM login_events
          WHERE ip IS NOT NULL AND ip<>''
          GROUP BY ip
          HAVING failed_24h > 0
          ORDER BY failed_24h DESC
          LIMIT 80";
  $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
  // Collect user agents per IP (compressed)
  foreach($rows as $r){
    $ip = $r['ip'];
    $uaSql = $pdo->prepare("SELECT user_agent, COUNT(*) c FROM login_events WHERE ip=? AND success=0 AND user_agent IS NOT NULL AND user_agent<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY user_agent ORDER BY c DESC LIMIT 3");
    $uaSql->execute([$ip]);
    $uas = $uaSql->fetchAll(PDO::FETCH_ASSOC);
    $agents = array_map(function($u){ return $u['user_agent'].' ('.$u['c'].')'; }, $uas);
    $cls = 'falhas';
    if($r['failed_6h'] > 40 || $r['failed_total'] > 300) $cls='bruteforce';
    else if($r['failed_6h'] > 15 || $r['failed_24h'] > 60) $cls='alto';
    else if($r['failed_24h'] > 15) $cls='moderado';
    $blacklist[] = [
      'ip'=>$ip,
      'failed_total'=>(int)$r['failed_total'],
      'failed_24h'=>(int)$r['failed_24h'],
      'failed_6h'=>(int)$r['failed_6h'],
      'last_attempt'=>$r['last_attempt'],
      'total_events'=>(int)$r['total_events'],
      'classification'=>$cls,
      'sample_agents'=>$agents
    ];
  }
  $out['blacklist_candidates'] = $blacklist;

  echo json_encode($out);
} catch(Exception $e){
  http_response_code(500);
  echo json_encode(['success'=>false,'message'=>'Erro ao coletar métricas de segurança','error'=>$e->getMessage()]);
}
?>