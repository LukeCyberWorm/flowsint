# 🛡️ Proteção Rápida e Segura - Versão Simplificada
# Este script aplica proteções essenciais sem complicações

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🛡️ PROTEÇÃO EXTRA - INSTALAÇÃO RÁPIDA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Configurar rate limiting SSH com iptables
Write-Host "`n🚦 Configurando limite de conexões SSH..." -ForegroundColor Yellow
ssh root@31.97.83.205 "iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH"
ssh root@31.97.83.205 "iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP"
ssh root@31.97.83.205 "apt-get install -y iptables-persistent && iptables-save > /etc/iptables/rules.v4"
Write-Host "  ✅ Limite: máximo 4 conexões por minuto" -ForegroundColor Green

# 2. Instalar AIDE (detector de alterações)
Write-Host "`n🔍 Instalando AIDE (Advanced Intrusion Detection)..." -ForegroundColor Yellow
ssh root@31.97.83.205 "apt-get update -qq && apt-get install -y aide aide-common -qq 2>&1 | grep -v 'debconf'"
Write-Host "  ✅ AIDE instalado" -ForegroundColor Green

# 3. Inicializar database do AIDE (pode demorar)
Write-Host "`n📦 Inicializando database do AIDE (pode levar alguns minutos)..." -ForegroundColor Yellow
Write-Host "  ⏳ Aguarde..." -ForegroundColor Cyan
ssh root@31.97.83.205 "aideinit 2>&1 | tail -1"
ssh root@31.97.83.205 "if [ -f /var/lib/aide/aide.db.new ]; then mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db; fi"
Write-Host "  ✅ Database criada" -ForegroundColor Green

# 4. Instalar Logwatch (relatórios de log)
Write-Host "`n📧 Instalando Logwatch..." -ForegroundColor Yellow
ssh root@31.97.83.205 "apt-get install -y logwatch -qq 2>&1 | grep -v 'debconf'"
Write-Host "  ✅ Logwatch instalado" -ForegroundColor Green

# 5. Configurar proteção SYN Flood
Write-Host "`n🌊 Configurando proteção contra SYN Flood..." -ForegroundColor Yellow
ssh root@31.97.83.205 "echo 'net.ipv4.tcp_syncookies = 1' >> /etc/sysctl.conf"
ssh root@31.97.83.205 "echo 'net.ipv4.tcp_max_syn_backlog = 2048' >> /etc/sysctl.conf"
ssh root@31.97.83.205 "echo 'net.ipv4.tcp_synack_retries = 2' >> /etc/sysctl.conf"
ssh root@31.97.83.205 "sysctl -p 2>&1 | grep -E 'tcp_syn|tcp_max'" 
Write-Host "  ✅ Proteção SYN Flood ativada" -ForegroundColor Green

# 6. Configurar limites de processo
Write-Host "`n📁 Configurando limites de sistema..." -ForegroundColor Yellow
ssh root@31.97.83.205 "echo '* hard core 0' > /etc/security/limits.d/99-security.conf"
ssh root@31.97.83.205 "echo '* soft nproc 65535' >> /etc/security/limits.d/99-security.conf"
ssh root@31.97.83.205 "echo '* hard nproc 65535' >> /etc/security/limits.d/99-security.conf"
Write-Host "  ✅ Limites configurados" -ForegroundColor Green

# 7. Criar baseline de processos
Write-Host "`n📝 Criando snapshot de processos atuais..." -ForegroundColor Yellow
ssh root@31.97.83.205 "ps aux > /root/baseline-processes.txt"
ssh root@31.97.83.205 "docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' > /root/baseline-containers.txt"
ssh root@31.97.83.205 "ss -tupn > /root/baseline-connections.txt"
Write-Host "  ✅ Baselines salvos em /root/" -ForegroundColor Green

# 8. Criar script de verificação rápida
Write-Host "`n✅ Criando script de verificação diária..." -ForegroundColor Yellow
ssh root@31.97.83.205 @'
cat > /usr/local/bin/security-check.sh << 'EOF'
#!/bin/bash
echo "=== SECURITY CHECK $(date) ==="
echo ""
echo "Top 5 CPU:"
ps aux --sort=-%cpu | head -6
echo ""
echo "Top 5 Memory:"
ps aux --sort=-%mem | head -6
echo ""
echo "Fail2ban status:"
fail2ban-client status sshd | grep "Currently banned"
echo ""
echo "Active connections:"
ss -tupn state established | wc -l
EOF
chmod +x /usr/local/bin/security-check.sh
'@
Write-Host "  ✅ Script criado: /usr/local/bin/security-check.sh" -ForegroundColor Green

# 9. Agendar verificação AIDE semanal
Write-Host "`n📅 Agendando verificação AIDE semanal..." -ForegroundColor Yellow
ssh root@31.97.83.205 "(crontab -l 2>/dev/null | grep -v aide; echo '0 2 * * 0 /usr/bin/aide --check > /var/log/aide-check.log 2>&1') | crontab -"
Write-Host "  ✅ AIDE rodará todo domingo às 2h" -ForegroundColor Green

# 10. Verificação final
Write-Host "`n🔍 Executando verificação final..." -ForegroundColor Yellow
ssh root@31.97.83.205 "/usr/local/bin/security-check.sh"

# Relatório Final
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ PROTEÇÃO EXTRA INSTALADA COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🛡️ Proteções Adicionadas:" -ForegroundColor Yellow
Write-Host "  ✅ Rate limiting SSH (máx 4 conexões/min)" -ForegroundColor Green
Write-Host "  ✅ AIDE (detector de alterações em arquivos)" -ForegroundColor Green
Write-Host "  ✅ Logwatch (análise de logs)" -ForegroundColor Green
Write-Host "  ✅ Proteção SYN Flood" -ForegroundColor Green
Write-Host "  ✅ Limites de processo otimizados" -ForegroundColor Green
Write-Host "  ✅ Baseline de sistema criada" -ForegroundColor Green
Write-Host "  ✅ Verificação AIDE semanal agendada" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Comandos Úteis:" -ForegroundColor Yellow
Write-Host "  • Verificação rápida:" -ForegroundColor White
Write-Host "    ssh root@31.97.83.205 '/usr/local/bin/security-check.sh'" -ForegroundColor Cyan
Write-Host ""
Write-Host "  • Verificar alterações AIDE:" -ForegroundColor White
Write-Host "    ssh root@31.97.83.205 'aide --check'" -ForegroundColor Cyan
Write-Host ""
Write-Host "  • Ver relatório Logwatch:" -ForegroundColor White
Write-Host "    ssh root@31.97.83.205 'logwatch --detail High --service All --range today'" -ForegroundColor Cyan
Write-Host ""
Write-Host "  • Comparar com baseline:" -ForegroundColor White
Write-Host "    ssh root@31.97.83.205 'diff <(ps aux) /root/baseline-processes.txt'" -ForegroundColor Cyan
Write-Host ""
