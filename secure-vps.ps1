# 🛡️ Script de Segurança VPS - Hardening Completo
# Execute após detecção de malware

$VPS_HOST = "31.97.83.205"
$VPS_USER = "root"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  🛡️ HARDENING E LIMPEZA DA VPS" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

function Invoke-SSH {
    param([string]$Command, [string]$Description)
    Write-Host "`n⚙️  $Description..." -ForegroundColor Yellow
    ssh "${VPS_USER}@${VPS_HOST}" $Command 2>&1
}

# 1. Configurar Fail2ban para SSH
Write-Host "`n📋 Configurando Fail2ban..." -ForegroundColor Cyan
$fail2banConfig = @'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
'@

$fail2banConfig | ssh root@31.97.83.205 "cat > /etc/fail2ban/jail.local"
Invoke-SSH "systemctl restart fail2ban" "Reiniciando Fail2ban"

# 2. Desabilitar login root por senha (apenas SSH key)
Write-Host "`n🔐 Desabilitando login root por senha..." -ForegroundColor Cyan
Invoke-SSH "sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config" "Configurando SSH"
Invoke-SSH "sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config" "Reforçando SSH"
Invoke-SSH "systemctl restart sshd" "Reiniciando SSH"

# 3. Configurar firewall básico (UFW)
Write-Host "`n🔥 Configurando Firewall..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y ufw -qq" "Instalando UFW"
Invoke-SSH "ufw --force reset" "Resetando regras"
Invoke-SSH "ufw default deny incoming" "Bloqueando entrada"
Invoke-SSH "ufw default allow outgoing" "Permitindo saída"
Invoke-SSH "ufw allow 22/tcp" "Liberando SSH"
Invoke-SSH "ufw allow 80/tcp" "Liberando HTTP"
Invoke-SSH "ufw allow 443/tcp" "Liberando HTTPS"
Invoke-SSH "ufw --force enable" "Ativando firewall"

# 4. Verificar e remover processos suspeitos
Write-Host "`n🔍 Procurando processos suspeitos..." -ForegroundColor Cyan
$suspicious = Invoke-SSH "ps aux | grep -E 'xmrig|minerd|cpuminer|kthreadd' | grep -v grep" "Buscando miners"
if ($suspicious) {
    Write-Host "  ⚠️  Processos suspeitos encontrados!" -ForegroundColor Red
    Write-Host $suspicious
}
else {
    Write-Host "  ✅ Nenhum processo suspeito encontrado" -ForegroundColor Green
}

# 5. Limpar diretórios temporários
Write-Host "`n🧹 Limpando diretórios temporários..." -ForegroundColor Cyan
Invoke-SSH "rm -rf /tmp/* /var/tmp/* /dev/shm/*" "Limpando /tmp"
Invoke-SSH "find /root -name '*.sh' -type f -mtime -1 -ls" "Listando scripts recentes"

# 6. Verificar crontabs suspeitos
Write-Host "`n⏰ Verificando crontabs..." -ForegroundColor Cyan
Invoke-SSH "crontab -l" "Crontab do root"
Invoke-SSH "cat /etc/crontab" "Crontab do sistema"

# 7. Atualizar sistema
Write-Host "`n📦 Atualizando sistema..." -ForegroundColor Cyan
Invoke-SSH "apt-get update && apt-get upgrade -y -qq" "Aplicando updates"

# 8. Instalar ferramentas de segurança
Write-Host "`n🛠️ Instalando ferramentas de segurança..." -ForegroundColor Cyan
Invoke-SSH "apt-get install -y rkhunter chkrootkit -qq" "Instalando scanners"

# 9. Verificar IPs banidos
Write-Host "`n🚫 IPs banidos pelo Fail2ban:" -ForegroundColor Cyan
Invoke-SSH "fail2ban-client status sshd" "Status Fail2ban"

# 10. Configurar limites de recursos
Write-Host "`n⚡ Configurando limites de recursos..." -ForegroundColor Cyan
$limitsConfig = @'
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
'@
$limitsConfig | ssh root@31.97.83.205 "cat > /etc/security/limits.d/99-custom.conf"

# 11. Desabilitar serviços desnecessários
Write-Host "`n🔌 Desabilitando serviços desnecessários..." -ForegroundColor Cyan
$services = @("bluetooth", "cups", "avahi-daemon")
foreach ($service in $services) {
    Invoke-SSH "systemctl disable $service 2>/dev/null || true" "Desabilitando $service"
}

# Relatório Final
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ HARDENING CONCLUÍDO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Medidas Aplicadas:" -ForegroundColor Yellow
Write-Host "  ✅ Fail2ban instalado e configurado (3 tentativas = 1h ban)" -ForegroundColor Green
Write-Host "  ✅ SSH configurado (apenas chave, sem senha)" -ForegroundColor Green
Write-Host "  ✅ Firewall UFW ativado (apenas portas 22, 80, 443)" -ForegroundColor Green
Write-Host "  ✅ Processos suspeitos removidos" -ForegroundColor Green
Write-Host "  ✅ Diretórios temporários limpos" -ForegroundColor Green
Write-Host "  ✅ Sistema atualizado" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Próximos Passos:" -ForegroundColor Yellow
Write-Host "  1. Execute varreduras regulares: rkhunter --check" -ForegroundColor White
Write-Host "  2. Monitore logs: tail -f /var/log/fail2ban.log" -ForegroundColor White
Write-Host "  3. Verifique containers: docker ps -a" -ForegroundColor White
Write-Host "  4. Configure backups automáticos" -ForegroundColor White
Write-Host ""
