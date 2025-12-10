# Deploy Scarlet-IA para VPS
# Data: 2025-12-09

Write-Host "=== Deploy Scarlet-IA para VPS ===" -ForegroundColor Cyan

# 1. Copiar arquivos Python atualizados
Write-Host "`n[1/4] Copiando código Python atualizado..." -ForegroundColor Yellow
scp flowsint-api/app/models/scarlet_ia.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/models/
scp flowsint-api/app/services/scarlet_ia_service.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/services/
scp flowsint-api/app/api/routes/scarlet_ia.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/api/routes/

# 2. Copiar main.py atualizado
Write-Host "`n[2/4] Copiando main.py atualizado..." -ForegroundColor Yellow
scp flowsint-api/app/main.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/

# 3. Copiar build do frontend
Write-Host "`n[3/4] Copiando build do frontend..." -ForegroundColor Yellow
scp -r flowsint-app/dist/* root@31.97.83.205:/var/www/rsl/flowsint-app/

# 4. Copiar e executar script de deploy na VPS
Write-Host "`n[4/4] Executando deploy na VPS..." -ForegroundColor Yellow
scp deploy-vps.sh root@31.97.83.205:/tmp/
ssh root@31.97.83.205 "bash /tmp/deploy-vps.sh"

Write-Host "`n=== Deploy concluído! ===" -ForegroundColor Green
Write-Host "`nAcesse: https://rsl.scarletredsolutions.com/dashboard/scarlet-ia" -ForegroundColor Cyan
Write-Host "`nVerificar logs:" -ForegroundColor Yellow
Write-Host "  ssh root@31.97.83.205 'docker logs flowsint-api-prod --tail 50'" -ForegroundColor Gray
Write-Host "  ssh root@31.97.83.205 'docker logs flowsint-app-prod --tail 50'" -ForegroundColor Gray
