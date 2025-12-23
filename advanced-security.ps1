# 🛡️ Script de Proteção Avançada - Camada Extra de Segurança
# Execute este script para implementar proteções adicionais

$VPS_HOST = "31.97.83.205"
$VPS_USER = "root"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🛡️ PROTEÇÃO AVANÇADA - CAMADA 2" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSH {
    param([string]$Command, [string]$Description)
    Write-Host "`n⚙️  $Description..." -ForegroundColor Yellow
    $result = ssh "${VPS_USER}@${VPS_HOST}" $Command 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️  Aviso: $Description retornou código $LASTEXITCODE" -ForegroundColor Yellow
    }
    return $result
}

# 1. Criar script de monitoramento de CPU
Write-Host "`n📋 Configurando auditoria de processos..." -ForegroundColor Cyan
ssh root@31.97.83.205 @"
cat > /usr/local/bin/cpu-monitor.sh << 'EOFSCRIPT'
#!/bin/bash
while true; do
    HIGH_CPU=`$(ps aux --sort=-%cpu | head -2 | tail -1 | awk '{if(`$3 > 80) print `$0}')
    if [ ! -z "`$HIGH_CPU" ]; then
        echo "[ALERT `$(date)] High CPU detected: `$HIGH_CPU" >> /var/log/cpu-monitor.log
    fi
    sleep 60
done
EOFSCRIPT
chmod +x /usr/local/bin/cpu-monitor.sh
"@

# 2. Criar serviço systemd para monitor
Write-Host "`n⚡ Criando serviço de monitoramento..." -ForegroundColor Cyan
$systemdService = @'
[Unit]
Description=CPU Usage Monitor
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cpu-monitor.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
'@

$systemdService | ssh root@31.97.83.205 "cat > /etc/systemd/system/cpu-monitor.service"
Invoke-SSH "systemctl daemon-reload && systemctl enable cpu-monitor.service && systemctl start cpu-monitor.service" "Iniciando monitor"

# 3. Configurar limite de taxa para SSH
Write-Host "`n🚦 Configurando rate limiting para SSH..." -ForegroundColor Cyan
Invoke-SSH "iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set" "Configurando iptables"
Invoke-SSH "iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP" "Limitando conexões"
Invoke-SSH "iptables-save > /etc/iptables/rules.v4" "Salvando regras"

# 4. Instalar AIDE (Advanced Intrusion Detection Environment)
Write-Host "`n🔍 Instalando AIDE (detector de alterações)..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y aide aide-common -qq" "Instalando AIDE"
Invoke-SSH "aideinit" "Inicializando database"

# 5. Configurar PSAcct (Process Accounting)
Write-Host "`n📊 Instalando monitoramento de processos..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y acct -qq" "Instalando acct"
Invoke-SSH "systemctl enable acct && systemctl start acct" "Iniciando acct"

# 6. Configurar Logwatch para relatórios diários
Write-Host "`n📧 Configurando relatórios de log..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y logwatch -qq" "Instalando Logwatch"

# 7. Desabilitar ICMP (ping) para stealth
Write-Host "`n👻 Habilitando modo stealth..." -ForegroundColor Cyan
Invoke-SSH "echo 1 > /proc/sys/net/ipv4/icmp_echo_ignore_all" "Desabilitando ping"
Invoke-SSH "echo 'net.ipv4.icmp_echo_ignore_all = 1' >> /etc/sysctl.conf" "Tornando permanente"

# 8. Configurar proteção contra SYN Flood
Write-Host "`n🌊 Proteção contra SYN Flood..." -ForegroundColor Cyan
$synProtection = @'
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5
'@
$synProtection | ssh root@31.97.83.205 "cat >> /etc/sysctl.conf"
Invoke-SSH "sysctl -p" "Aplicando configurações"

# 9. Configurar limites de arquivo
Write-Host "`n📁 Configurando limites de sistema..." -ForegroundColor Cyan
$limits = @'
* hard core 0
* soft nproc 65535
* hard nproc 65535
* soft nofile 65535
* hard nofile 65535
'@
$limits | ssh root@31.97.83.205 "cat > /etc/security/limits.d/99-security.conf"

# 10. Criar script de checagem diária
Write-Host "`n✅ Criando script de verificação diária..." -ForegroundColor Cyan
$dailyCheck = @'
#!/bin/bash
echo "=== RELATÓRIO DIÁRIO DE SEGURANÇA ===" > /tmp/daily-security.txt
echo "Data: $(date)" >> /tmp/daily-security.txt
echo "" >> /tmp/daily-security.txt

echo "=== IPs Banidos (Fail2ban) ===" >> /tmp/daily-security.txt
fail2ban-client status sshd >> /tmp/daily-security.txt

echo "" >> /tmp/daily-security.txt
echo "=== Processos com mais CPU ===" >> /tmp/daily-security.txt
ps aux --sort=-%cpu | head -10 >> /tmp/daily-security.txt

echo "" >> /tmp/daily-security.txt
echo "=== Processos com mais Memória ===" >> /tmp/daily-security.txt
ps aux --sort=-%mem | head -10 >> /tmp/daily-security.txt

echo "" >> /tmp/daily-security.txt
echo "=== Conexões de Rede Ativas ===" >> /tmp/daily-security.txt
ss -tupn state established >> /tmp/daily-security.txt

echo "" >> /tmp/daily-security.txt
echo "=== Logins do Dia ===" >> /tmp/daily-security.txt
grep "Accepted" /var/log/auth.log | tail -20 >> /tmp/daily-security.txt

echo "" >> /tmp/daily-security.txt
echo "=== Tentativas de Login Falhadas ===" >> /tmp/daily-security.txt
grep "Failed" /var/log/auth.log | tail -20 >> /tmp/daily-security.txt

# Aqui você pode enviar por email
# cat /tmp/daily-security.txt | mail -s "Relatório Diário VPS" seu@email.com
cat /tmp/daily-security.txt
'@

$dailyCheck | ssh root@31.97.83.205 "cat > /usr/local/bin/daily-security-check.sh && chmod +x /usr/local/bin/daily-security-check.sh"

# Agendar no crontab
Invoke-SSH "(crontab -l 2>/dev/null; echo '0 8 * * * /usr/local/bin/daily-security-check.sh > /var/log/daily-security.log') | crontab -" "Agendando verificação"

# 11. Criar lista de processos conhecidos
Write-Host "`n📝 Criando baseline de processos..." -ForegroundColor Cyan
Invoke-SSH "ps aux > /root/baseline-processes.txt" "Salvando baseline"
Invoke-SSH "docker ps -a --format 'table {{.Names}}\t{{.Image}}' > /root/baseline-containers.txt" "Salvando containers"

# 12. Instalar e configurar Tiger (Security Audit Tool)
Write-Host "`n🐯 Instalando Tiger Security..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y tiger -qq" "Instalando Tiger"
Invoke-SSH "tiger -H" "Executando primeira varredura"

# Relatório Final
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ PROTEÇÃO AVANÇADA INSTALADA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🛡️ Novas Proteções Ativas:" -ForegroundColor Yellow
Write-Host "  ✅ Monitor de CPU em tempo real" -ForegroundColor Green
Write-Host "  ✅ Rate limiting SSH (máx 4 conexões/min)" -ForegroundColor Green
Write-Host "  ✅ AIDE (detector de alterações em arquivos)" -ForegroundColor Green
Write-Host "  ✅ Process Accounting ativo" -ForegroundColor Green
Write-Host "  ✅ Logwatch (relatórios diários)" -ForegroundColor Green
Write-Host "  ✅ Ping desabilitado (modo stealth)" -ForegroundColor Green
Write-Host "  ✅ Proteção contra SYN Flood" -ForegroundColor Green
Write-Host "  ✅ Limites de sistema otimizados" -ForegroundColor Green
Write-Host "  ✅ Verificação diária automática" -ForegroundColor Green
Write-Host "  ✅ Baseline de processos criada" -ForegroundColor Green
Write-Host "  ✅ Tiger Security instalado" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitoramento:" -ForegroundColor Yellow
Write-Host "  • CPU Monitor: systemctl status cpu-monitor" -ForegroundColor White
Write-Host "  • Logs diários: cat /var/log/daily-security.log" -ForegroundColor White
Write-Host "  • Alertas CPU: tail -f /var/log/cpu-monitor.log" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Configure email para receber alertas!" -ForegroundColor Red
Write-Host ""
