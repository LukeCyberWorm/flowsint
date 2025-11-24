<?php
// Envio de alerta de login administrativo
// Usa mesmo formato simplificado (mail()) com config global email_config.php (fora da pasta ADM)
$EMAIL_CFG_PATH = dirname(__DIR__,2) . '/api/email_config.php';
if(file_exists($EMAIL_CFG_PATH)){
  $EMAIL_CFG = require $EMAIL_CFG_PATH;
} else {
  $EMAIL_CFG = [
    'from_email'=>'no-reply@localhost','from_name'=>'Painel Reclame Golpe','charset'=>'UTF-8'
  ];
}

function send_admin_login_alert($admin, $ip, $ua){
  global $EMAIL_CFG;
  $toList = [
    'lucasaugustodeoliveira@gmail.com'=>'Lucas Oliveira',
    'douglasmunizdutra@gmail.com'=>'Douglas Dutra'
  ];
  // Evitar loop se config notificação padrão igual a um dos destinatários, apenas adiciona.
  if(!empty($EMAIL_CFG['notification_email'])){
    $toList[$EMAIL_CFG['notification_email']] = $EMAIL_CFG['notification_name'] ?? 'Notificação';
  }
  $dt = date('d/m/Y H:i:s');
  $subject = 'Alerta: Login no Painel ADM (' . $admin['email'] . ')';
  $body = "<h2>Login Administrativo</h2>"
        ."<p>Um login foi realizado no painel administrativo.</p>"
        ."<table style='font-family:Arial;font-size:13px;border-collapse:collapse'>"
        .row('Admin', htmlspecialchars($admin['name']).' ('.$admin['email'].')')
        .row('ID', (int)$admin['id'])
        .row('IP', htmlspecialchars($ip ?: 'desconhecido'))
        .row('User-Agent', htmlspecialchars(substr($ua,0,300)))
        .row('Data/Hora', $dt)
        ."</table>"
        ."<p style='font-size:12px;color:#666'>Se não foi você revise acessos e altere senhas.</p>";
  $headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=' . ($EMAIL_CFG['charset'] ?? 'UTF-8'),
    'From: '.(($EMAIL_CFG['from_name'] ?? 'Painel').' <'.($EMAIL_CFG['from_email'] ?? 'no-reply@localhost').'>')
  ];
  $additionalParams = !empty($EMAIL_CFG['from_email']) ? '-f '.$EMAIL_CFG['from_email'] : '';
  $logDir = __DIR__ . '/../logs';
  if(!is_dir($logDir)) @mkdir($logDir,0775,true);
  $logFile = $logDir . '/admin_login_alerts.log';
  foreach($toList as $email=>$name){
    if(!filter_var($email,FILTER_VALIDATE_EMAIL)) continue;
    $ok = @mail($email,$subject,$body,implode("\r\n",$headers),$additionalParams);
    $line = sprintf('[%s] admin_login id=%d email=%s ip=%s ua="%s" -> to=%s result=%s',
      date('Y-m-d H:i:s'),
      (int)$admin['id'],
      $admin['email'],
      $ip ?: '-',
      substr(preg_replace('/\s+/',' ', $ua??'-'),0,180),
      $email,
      $ok?'OK':'FAIL'
    );
    @file_put_contents($logFile, $line."\n", FILE_APPEND);
  }
}
function row($k,$v){ return "<tr><td style='padding:4px 8px;background:#f2f5f7;font-weight:bold'>".htmlspecialchars($k)."</td><td style='padding:4px 8px;border:1px solid #e1e5e8'>". (is_scalar($v)?$v:json_encode($v)) ."</td></tr>"; }
