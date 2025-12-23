# 🔍 Script de Diagnóstico da VPS
# Execute este script para identificar problemas na VPS

$VPS_HOST = "31.97.83.205"
$VPS_USER = "root"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 DIAGNÓSTICO AUTOMÁTICO DA VPS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Função para executar comando remoto
function Invoke-SSH {
    param([string]$Command)
    ssh "${VPS_USER}@${VPS_HOST}" $Command 2>&1
}

# Teste 1: Ping
Write-Host "[1/10] Testando conectividade..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $VPS_HOST -Count 2 -Quiet
if ($pingResult) {
    Write-Host "  ✅ VPS respondendo ao ping" -ForegroundColor Green
}
else {
    Write-Host "  ❌ VPS NÃO RESPONDE ao ping - pode estar offline!" -ForegroundColor Red
    Write-Host "  👉 Verifique o painel da hospedagem" -ForegroundColor Yellow
    exit 1
}

# Teste 2: SSH
Write-Host "`n[2/10] Testando SSH..." -ForegroundColor Yellow
$sshTest = Invoke-SSH "echo 'SSH OK'"
if ($sshTest -match "SSH OK") {
    Write-Host "  ✅ SSH conectado com sucesso" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Falha ao conectar via SSH" -ForegroundColor Red
    Write-Host "  👉 Verifique credenciais ou firewall" -ForegroundColor Yellow
    exit 1
}

# Teste 3: Uso de Disco
Write-Host "`n[3/10] Verificando uso de disco..." -ForegroundColor Yellow
$diskUsage = Invoke-SSH "df -h / | tail -1 | awk '{print `$5}'"
$diskPercent = $diskUsage -replace '%', ''
Write-Host "  📊 Uso de disco: $diskUsage" -ForegroundColor Cyan
if ([int]$diskPercent -gt 90) {
    Write-Host "  ⚠️  DISCO CRÍTICO! Mais de 90% usado!" -ForegroundColor Red
}
elseif ([int]$diskPercent -gt 80) {
    Write-Host "  ⚠️  Disco quase cheio (>80%)" -ForegroundColor Yellow
}
else {
    Write-Host "  ✅ Espaço em disco OK" -ForegroundColor Green
}

# Teste 4: Memória RAM
Write-Host "`n[4/10] Verificando memória RAM..." -ForegroundColor Yellow
$memUsage = Invoke-SSH "free | grep Mem | awk '{printf `"%.0f`", (`$3/`$2)*100}'"
Write-Host "  📊 Uso de RAM: $memUsage%" -ForegroundColor Cyan
if ([int]$memUsage -gt 90) {
    Write-Host "  ⚠️  MEMÓRIA CRÍTICA! Mais de 90% usada!" -ForegroundColor Red
}
elseif ([int]$memUsage -gt 80) {
    Write-Host "  ⚠️  Memória alta (>80%)" -ForegroundColor Yellow
}
else {
    Write-Host "  ✅ Memória RAM OK" -ForegroundColor Green
}

# Teste 5: Docker Daemon
Write-Host "`n[5/10] Verificando Docker..." -ForegroundColor Yellow
$dockerStatus = Invoke-SSH "systemctl is-active docker"
if ($dockerStatus -match "active") {
    Write-Host "  ✅ Docker rodando" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Docker PARADO!" -ForegroundColor Red
    Write-Host "  👉 Execute: systemctl start docker" -ForegroundColor Yellow
}

# Teste 6: Containers
Write-Host "`n[6/10] Verificando containers..." -ForegroundColor Yellow
$containers = @(
    "flowsint-postgres-prod",
    "flowsint-redis-prod",
    "flowsint-neo4j-prod",
    "flowsint-api-prod",
    "flowsint-celery-prod"
)

foreach ($container in $containers) {
    $status = Invoke-SSH "docker inspect -f '{{.State.Running}}' $container 2>/dev/null"
    if ($status -match "true") {
        Write-Host "  ✅ $container - RODANDO" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ $container - PARADO" -ForegroundColor Red
    }
}

# Teste 7: Nginx
Write-Host "`n[7/10] Verificando Nginx..." -ForegroundColor Yellow
$nginxStatus = Invoke-SSH "systemctl is-active nginx"
if ($nginxStatus -match "active") {
    Write-Host "  ✅ Nginx rodando" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Nginx PARADO!" -ForegroundColor Red
    Write-Host "  👉 Execute: systemctl start nginx" -ForegroundColor Yellow
}

# Teste 8: Portas abertas
Write-Host "`n[8/10] Verificando portas..." -ForegroundColor Yellow
$ports = @{
    "80 (HTTP)"   = 80
    "443 (HTTPS)" = 443
    "5001 (API)"  = 5001
}

foreach ($portName in $ports.Keys) {
    $port = $ports[$portName]
    $listening = Invoke-SSH "ss -tuln | grep :$port"
    if ($listening) {
        Write-Host "  ✅ Porta $portName - ABERTA" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Porta $portName - FECHADA" -ForegroundColor Red
    }
}

# Teste 9: Logs de erro recentes
Write-Host "`n[9/10] Verificando logs de erro..." -ForegroundColor Yellow
$errorLogs = Invoke-SSH "journalctl -p err --no-pager -n 5"
if ($errorLogs) {
    Write-Host "  ⚠️  Erros recentes encontrados:" -ForegroundColor Yellow
    Write-Host $errorLogs -ForegroundColor Gray
}
else {
    Write-Host "  ✅ Nenhum erro crítico recente" -ForegroundColor Green
}

# Teste 10: Últimos logs do Docker
Write-Host "`n[10/10] Últimos logs da API..." -ForegroundColor Yellow
$apiLogs = Invoke-SSH "docker logs flowsint-api-prod --tail 10 2>&1"
Write-Host $apiLogs -ForegroundColor Gray

# Resumo final
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 DIAGNÓSTICO COMPLETO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Se containers estão parados:" -ForegroundColor White
Write-Host "   ssh root@31.97.83.205" -ForegroundColor Gray
Write-Host "   cd /root/flowsint" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Se disco/memória cheia:" -ForegroundColor White
Write-Host "   docker system prune -a --volumes  # CUIDADO: apaga dados não usados" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Se Nginx parado:" -ForegroundColor White
Write-Host "   systemctl start nginx" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Para ver logs completos de um container:" -ForegroundColor White
Write-Host "   docker logs flowsint-api-prod -f" -ForegroundColor Gray
Write-Host ""
