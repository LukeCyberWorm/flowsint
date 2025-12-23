# 🚑 Script de Recuperação Emergencial da VPS
# Execute este script para tentar restaurar os serviços

$VPS_HOST = "31.97.83.205"
$VPS_USER = "root"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  🚑 RECUPERAÇÃO EMERGENCIAL DA VPS" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  Este script tentará restaurar todos os serviços" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Gray
    exit 0
}

function Invoke-SSH {
    param([string]$Command, [string]$Description)
    Write-Host "`n⚙️  $Description..." -ForegroundColor Yellow
    $result = ssh "${VPS_USER}@${VPS_HOST}" $Command 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Sucesso" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Falha: $result" -ForegroundColor Red
    }
    return $result
}

# Passo 1: Parar tudo
Invoke-SSH "cd /root/flowsint && docker-compose -f docker-compose.prod.yml down" "Parando containers"

# Passo 2: Limpar logs antigos (liberar espaço)
Write-Host "`n📦 Limpando logs antigos..." -ForegroundColor Yellow
Invoke-SSH "journalctl --vacuum-time=7d" "Limpar logs do sistema"
Invoke-SSH "find /var/log -type f -name '*.log' -mtime +7 -delete 2>/dev/null || true" "Limpar logs antigos"

# Passo 3: Limpar cache do Docker (CUIDADO)
Write-Host "`n🧹 Limpando cache do Docker..." -ForegroundColor Yellow
Write-Host "  ⚠️  Isso pode demorar alguns minutos..." -ForegroundColor Yellow
Invoke-SSH "docker system prune -f" "Remover containers/imagens não utilizados"

# Passo 4: Verificar volumes
Invoke-SSH "docker volume ls" "Listando volumes"

# Passo 5: Reiniciar Docker
Invoke-SSH "systemctl restart docker" "Reiniciando Docker daemon"
Start-Sleep -Seconds 5

# Passo 6: Subir containers novamente
Write-Host "`n🚀 Subindo containers..." -ForegroundColor Yellow
Write-Host "  ⚠️  Isso pode demorar 2-3 minutos..." -ForegroundColor Yellow
Invoke-SSH "cd /root/flowsint && docker-compose -f docker-compose.prod.yml up -d" "Iniciando containers"
Start-Sleep -Seconds 30

# Passo 7: Verificar status
Write-Host "`n📊 Verificando status dos containers..." -ForegroundColor Yellow
$status = Invoke-SSH "docker ps --format 'table {{.Names}}\t{{.Status}}'" "Status atual"
Write-Host $status -ForegroundColor Cyan

# Passo 8: Verificar Nginx
Invoke-SSH "nginx -t" "Testando configuração do Nginx"
Invoke-SSH "systemctl restart nginx" "Reiniciando Nginx"

# Passo 9: Teste de saúde
Write-Host "`n🏥 Testando endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
$healthCheck = Invoke-SSH "curl -s http://localhost:5001/health" "Health check da API"
if ($healthCheck -match "ok") {
    Write-Host "  ✅ API respondendo!" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  API não está respondendo ainda" -ForegroundColor Yellow
    Write-Host "  👉 Aguarde mais alguns segundos e tente: curl http://localhost:5001/health" -ForegroundColor Gray
}

# Passo 10: Logs finais
Write-Host "`n📋 Últimos logs da API..." -ForegroundColor Yellow
Invoke-SSH "docker logs flowsint-api-prod --tail 20" "Logs da API"

# Resumo
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ RECUPERAÇÃO CONCLUÍDA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 VERIFICAÇÕES FINAIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifique se todos os containers estão UP:" -ForegroundColor White
Write-Host "   ssh root@31.97.83.205 'docker ps'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Teste o site:" -ForegroundColor White
Write-Host "   https://rsl.scarletredsolutions.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Teste a API:" -ForegroundColor White
Write-Host "   curl https://rsl.scarletredsolutions.com/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Monitore os logs:" -ForegroundColor White
Write-Host "   ssh root@31.97.83.205 'docker logs flowsint-api-prod -f'" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Se ainda não funcionar, execute diagnose-vps.ps1" -ForegroundColor Yellow
Write-Host ""
