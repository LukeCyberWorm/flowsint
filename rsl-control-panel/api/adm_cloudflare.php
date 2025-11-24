<?php
// Admin Cloudflare control (placeholder/stub with optional real API calls)
require_once __DIR__.'/_bootstrap.php';
$admin = require_admin($pdo);

$stateFile = __DIR__.'/../logs/cloudflare_state.json';
if(!file_exists(dirname($stateFile))) @mkdir(dirname($stateFile),0775,true);

function load_state($file){
  if(is_file($file)){
    $js = json_decode(@file_get_contents($file),true); if(is_array($js)) return $js;
  }
  return ['active'=>false,'last_purge'=>null,'last_check'=>null];
}
function save_state($file,$data){ @file_put_contents($file,json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)); }

$state = load_state($stateFile);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');

$token   = getenv('CF_API_TOKEN') ?: (defined('CF_API_TOKEN')?CF_API_TOKEN:null);
$zone    = getenv('CF_ZONE_ID') ?: (defined('CF_ZONE_ID')?CF_ZONE_ID:null);
$account = getenv('CF_ACCOUNT_ID') ?: (defined('CF_ACCOUNT_ID')?CF_ACCOUNT_ID:null); // opcional
// Validação simples (zone id 32 hex). Se formato inválido, trata como não configurado.
$validZone = $zone && preg_match('/^[a-f0-9]{32}$/i',$zone);
$configured = $token && $validZone;

// Helper to call Cloudflare API
function cf_api($method,$path,$token,$payload=null){
  $ch=curl_init("https://api.cloudflare.com/client/v4".$path);
  $hdr=[ 'Authorization: Bearer '.$token, 'Content-Type: application/json' ];
  curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>30,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$hdr]);
  if($payload!==null){ curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($payload)); }
  $resp=curl_exec($ch); $http=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
  return [$http,json_decode($resp,true),$resp];
}

// Try to get current development mode status (only on demand for performance)
function get_dev_mode($zone,$token){
  if(!$zone || !$token) return null;
  [$http,$data] = cf_api('GET',"/zones/$zone/settings/development_mode",$token);
  if($http!==200) return null;
  return $data['result']['value'] ?? null; // 'on' | 'off'
}
function get_paused($zone,$token){
  if(!$zone || !$token) return null;
  [$http,$data] = cf_api('GET',"/zones/$zone/settings/paused",$token);
  if($http!==200) return null;
  return $data['result']['value'] ?? null; // 'on' | 'off' (Cloudflare retorna 'on' quando pausado)
}

if($method === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $action = $input['action'] ?? '';
  try {
    if($action==='toggle' || $action==='toggle_dev_mode'){
      if($configured){
        $current = get_dev_mode($zone,$token);
        $target = $current==='on' ? 'off':'on';
        [$http,$data] = cf_api('PATCH',"/zones/$zone/settings/development_mode",$token,['value'=>$target]);
        if($http!==200) json_out(['success'=>false,'message'=>'Falha ao alternar Development Mode','http'=>$http,'raw'=>$data],500);
        $state['active'] = ($target==='on');
        $state['last_check'] = date('c');
        save_state($stateFile,$state);
        json_out(['success'=>true,'state'=>$state,'dev_mode'=>$target,'message'=>'Development Mode atualizado']);
      } else {
        // fallback local toggle
        $state['active'] = isset($input['value']) ? (bool)$input['value'] : !$state['active'];
        $state['last_check'] = date('c');
        save_state($stateFile,$state);
        json_out(['success'=>true,'state'=>$state,'message'=>'Estado (local) atualizado']);
      }
    }
    elseif($action==='purge_cache'){
      if(!$configured){ json_out(['success'=>false,'message'=>'Credenciais Cloudflare ausentes (defina CF_API_TOKEN e CF_ZONE_ID).']); }
      // Real purge request
      $ch=curl_init("https://api.cloudflare.com/client/v4/zones/$zone/purge_cache");
      curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>30,CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>[
        'Authorization: Bearer '.$token,
        'Content-Type: application/json'
      ],CURLOPT_POSTFIELDS=>json_encode(['purge_everything'=>true])]);
      $resp=curl_exec($ch); $http=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
      $ok = $http===200; $state['last_purge']=date('c'); save_state($stateFile,$state);
      json_out(['success'=>$ok,'state'=>$state,'http'=>$http,'response'=>json_decode($resp,true)], $ok?200:500);
    }
    elseif($action==='dns_records'){
      if(!$configured){ json_out(['success'=>false,'message'=>'Credenciais Cloudflare ausentes.']); }
      $ch=curl_init("https://api.cloudflare.com/client/v4/zones/$zone/dns_records?per_page=100");
      curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>30,CURLOPT_HTTPHEADER=>[
        'Authorization: Bearer '.$token,
        'Content-Type: application/json'
      ]]);
      $resp=curl_exec($ch); $http=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
      $data=json_decode($resp,true);
      if($http!==200) json_out(['success'=>false,'message'=>'Falha ao obter DNS','http'=>$http,'raw'=>$data],500);
      json_out(['success'=>true,'dns'=>$data['result']??[],'count'=>count($data['result']??[])]);
    }
    elseif($action==='toggle_pause'){
      if(!$configured){ json_out(['success'=>false,'message'=>'Credenciais Cloudflare ausentes.']); }
      $current = get_paused($zone,$token); // 'on' quando já pausado
      $target = ($current==='on') ? false : true; // invert
      [$http,$data] = cf_api('PATCH',"/zones/$zone/settings/paused",$token,['value'=>$target]);
      if($http!==200) json_out(['success'=>false,'message'=>'Falha ao alternar pausa','http'=>$http,'raw'=>$data],500);
      $new = $data['result']['value'] ?? ($target? 'on':'off');
      json_out(['success'=>true,'paused'=>$new,'message'=>'Estado de pausa atualizado']);
    }
    else {
      json_out(['success'=>false,'message'=>'Ação inválida']);
    }
  } catch(Exception $e){ json_out(['success'=>false,'message'=>$e->getMessage()],500); }
  exit;
}

// GET => status + basic derived info
$serverHost = $_SERVER['HTTP_HOST'] ?? php_uname('n');
$serverIp = gethostbyname($serverHost);
// Quick service scan (basic TCP connect) for common ports
$ports = [80=>'HTTP',443=>'HTTPS',3306=>'MySQL',6379=>'Redis'];
$services=[];
foreach($ports as $p=>$label){
  $start=microtime(true);
  $ok=false; $lat=null;
  try { $fp=@fsockopen($serverIp,$p,$errno,$errstr,0.6); if($fp){ $ok=true; fclose($fp); } } catch(Exception $e){}
  $lat=(int)round((microtime(true)-$start)*1000);
  $services[]=['port'=>$p,'service'=>$label,'ok'=>$ok,'latency_ms'=>$lat];
}

// Top failed login IPs (reuse security metrics light version)
$topFailed=[];
try {
  $st=$pdo->query("SELECT ip, COUNT(*) c FROM login_events WHERE success=0 AND ip IS NOT NULL AND ip<>'' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY ip ORDER BY c DESC LIMIT 8");
  $topFailed=$st->fetchAll(PDO::FETCH_ASSOC);
} catch(Exception $e){}

// If configured, fetch development mode status (cached inside state.active for backward compat)
$devMode = $configured ? get_dev_mode($zone,$token) : ($state['active']?'on':'off');
$paused = $configured ? get_paused($zone,$token) : null; // 'on' = paused
$state['active'] = ($devMode==='on');
$state['last_check']=date('c'); save_state($stateFile,$state);
json_out([
  'success'=>true,
  'state'=>$state,
  'configured'=>$configured,
  'server_host'=>$serverHost,
  'server_ip'=>$serverIp,
  'zone'=>$configured?$zone:null,
  'account'=>$account?:null,
  'zone_valid'=>$validZone,
  'dev_mode'=>$devMode,
  'paused'=>$paused,
  'services'=>$services,
  'top_failed_ips'=>$topFailed
]);
?>