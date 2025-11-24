<?php
require_once __DIR__.'/_bootstrap.php';
$u = require_admin($pdo);
$id = (int)($_GET['id'] ?? 0);
if($id<=0) json_out(['success'=>false,'message'=>'ID inválido'],422);

function column_exists(PDO $pdo, $table, $col){
  static $cache=[]; $k=$table; if(!isset($cache[$k])){ try { $cache[$k]=array_flip($pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN)); } catch(Throwable $e){ $cache[$k]=[]; } } return isset($cache[$k][$col]);
}
function table_exists(PDO $pdo,$table){ try { $st=$pdo->query("SHOW TABLES LIKE '".addslashes($table)."'"); return (bool)$st->fetch(); } catch(Throwable $e){ return false; } }

try {
  // Garante que nenhum aviso/notice quebre o JSON
  ob_start();
  // Campos básicos + opcionais (phone)
  $cols = 'id,name,email,provider,created_at';
  if(column_exists($pdo,'users','phone')) $cols .= ',phone';
  if(column_exists($pdo,'users','profile_completed')) $cols .= ',profile_completed';
  if(column_exists($pdo,'users','full_name')) $cols .= ',full_name';
  $st = $pdo->prepare("SELECT $cols FROM users WHERE id=?");
  $st->execute([$id]);
  $user=$st->fetch(PDO::FETCH_ASSOC);
  if(!$user) json_out(['success'=>false,'message'=>'Usuário não encontrado'],404);

  // Evitar cache em qualquer proxy/browser
  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
  header('Pragma: no-cache');

  // Últimos logins + agregados
  $logins=[]; $loginAgg=['success'=>0,'failed'=>0];
  if(table_exists($pdo,'login_events')){
    $le = $pdo->prepare("SELECT ip,city,region,country,user_agent,success,created_at FROM login_events WHERE user_type='user' AND principal_id=? ORDER BY id DESC LIMIT 10");
    $le->execute([$id]);
    $logins=$le->fetchAll(PDO::FETCH_ASSOC);
    try { $agg=$pdo->prepare("SELECT SUM(success=1) s, SUM(success=0) f FROM login_events WHERE user_type='user' AND principal_id=?"); $agg->execute([$id]); $row=$agg->fetch(PDO::FETCH_ASSOC); if($row){ $loginAgg['success']=(int)$row['s']; $loginAgg['failed']=(int)$row['f']; } } catch(Throwable $e){ /* ignore */ }
  }

  // Comentários recentes
  $comments=[]; if(table_exists($pdo,'report_comments')){ $cm = $pdo->prepare('SELECT c.id,c.report_id,c.comment,c.created_at,r.title AS report_title FROM report_comments c LEFT JOIN reports r ON r.id=c.report_id WHERE c.user_id=? ORDER BY c.id DESC LIMIT 10'); $cm->execute([$id]); $comments=$cm->fetchAll(PDO::FETCH_ASSOC); }

  // Denúncias recentes do usuário
  $reports=[]; if(table_exists($pdo,'reports')){ $rp=$pdo->prepare('SELECT id,title,status,created_at,category,reporter_city FROM reports WHERE user_id=? ORDER BY id DESC LIMIT 10'); $rp->execute([$id]); $reports=$rp->fetchAll(PDO::FETCH_ASSOC); }

  // Likes recentes
  $likesRecent=[]; if(table_exists($pdo,'report_likes')){ $lr=$pdo->prepare('SELECT rl.report_id, rl.created_at, r.title FROM report_likes rl LEFT JOIN reports r ON r.id=rl.report_id WHERE rl.user_id=? ORDER BY rl.id DESC LIMIT 10'); $lr->execute([$id]); $likesRecent=$lr->fetchAll(PDO::FETCH_ASSOC); }

  // Contagens agregadas
  $reports_cnt = 0; $report_status=[]; $first_report_at=null; $last_report_at=null;
  if(table_exists($pdo,'reports')){
    $stc=$pdo->prepare('SELECT COUNT(*) FROM reports WHERE user_id=?'); $stc->execute([$id]); $reports_cnt=(int)$stc->fetchColumn();
    try { $stStatus=$pdo->prepare('SELECT status, COUNT(*) c FROM reports WHERE user_id=? GROUP BY status'); $stStatus->execute([$id]); foreach($stStatus->fetchAll(PDO::FETCH_ASSOC) as $row){ $report_status[$row['status']] = (int)$row['c']; } } catch(Throwable $e){ /* ignore */ }
    try { $stSpan=$pdo->prepare('SELECT MIN(created_at) first_at, MAX(created_at) last_at FROM reports WHERE user_id=?'); $stSpan->execute([$id]); $span=$stSpan->fetch(PDO::FETCH_ASSOC); if($span){ $first_report_at=$span['first_at']; $last_report_at=$span['last_at']; } } catch(Throwable $e){ }
  }
  $comments_cnt = table_exists($pdo,'report_comments') ? (function($pdo,$id){ $st=$pdo->prepare('SELECT COUNT(*) FROM report_comments WHERE user_id=?'); $st->execute([$id]); return (int)$st->fetchColumn(); })($pdo,$id) : 0;
  $likes_cnt = table_exists($pdo,'report_likes') ? (function($pdo,$id){ $st=$pdo->prepare('SELECT COUNT(*) FROM report_likes WHERE user_id=?'); $st->execute([$id]); return (int)$st->fetchColumn(); })($pdo,$id) : 0;

  // Último snapshot de dados preenchidos em denúncia (para endereço/cidade e cpf hash)
  $profileReport=null; $has_cpf_hash=false; $cpf_last2=null; $cpf_full=null;
  if(table_exists($pdo,'reports')){
    $pr=$pdo->prepare('SELECT reporter_name,reporter_email,reporter_phone,reporter_city,reporter_cpf FROM reports WHERE user_id=? ORDER BY id DESC LIMIT 1');
    $pr->execute([$id]);
    $profileReport=$pr->fetch(PDO::FETCH_ASSOC);
    if($profileReport && !empty($profileReport['reporter_cpf'])){
      $has_cpf_hash=true; $cpf=$profileReport['reporter_cpf']; if(strlen($cpf)<=4) $cpf_last2=$cpf; }
    // Se existir tabela segura com CPF completo cifrado tentar recuperar o mais recente
    if(table_exists($pdo,'report_cpfs')){
      try {
        $stc=$pdo->prepare('SELECT cpf_full_enc FROM report_cpfs WHERE user_id=? ORDER BY id DESC LIMIT 1');
        $stc->execute([$id]);
        $enc=$stc->fetchColumn();
        if($enc){
          $keyEnv=getenv('CPF_KEY');
          if($keyEnv){
            $bin=base64_decode($enc,true);
            if($bin && strlen($bin)>28){
              $iv=substr($bin,0,12); $tag=substr($bin,12,16); $cipher=substr($bin,28);
              $key=substr(hash('sha256',$keyEnv,true),0,32);
              $plain=openssl_decrypt($cipher,'aes-256-gcm',$key,OPENSSL_RAW_DATA,$iv,$tag);
              if($plain && preg_match('/^\d{11}$/',$plain)) $cpf_full=$plain; // sanity
            }
          }
        }
      } catch(Throwable $e){ /* ignore */ }
    }
  }

  $payload = [
    'success'=>true,
    'user'=>$user,
    'logins'=>$logins,
    'comments'=>$comments,
    'reports'=>$reports,
    'likes_recent'=>$likesRecent,
    'counts'=>[
      'reports'=>$reports_cnt,
      'comments'=>$comments_cnt,
      'likes'=>$likes_cnt,
      'logins'=>count($logins),
      'logins_success'=>$loginAgg['success'],
      'logins_failed'=>$loginAgg['failed'],
      'report_status'=>$report_status,
      'first_report_at'=>$first_report_at,
      'last_report_at'=>$last_report_at
    ],
    'profile_report'=>$profileReport,
  'has_cpf_hash'=>$has_cpf_hash,
  'cpf_last2'=>$cpf_last2,
  'cpf_full'=>$cpf_full
  ];
  $noise = trim(ob_get_clean());
  if($noise!==''){
    // Loga e segue – não quebra resposta
    error_log('adm_user_detail noise: '.str_replace(["\n","\r"],' ',$noise));
  }
  json_out($payload);
} catch(Exception $e){ error_log('adm_user_detail: '.$e->getMessage()); json_out(['success'=>false,'message'=>'Erro interno'],500);} 
