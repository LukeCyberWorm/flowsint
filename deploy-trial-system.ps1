# Script de Deploy do Sistema de Trial
# Execute este script do diretório raiz do projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy: Sistema de Trial RSL-Scarlet" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variáveis
$VPS_HOST = "31.97.83.205"
$VPS_USER = "root"
$PROJECT_PATH = "/root/flowsint"  # Ajuste conforme necessário
$FRONTEND_PATH = "/var/www/rsl"

# Função para executar comandos SSH
function Invoke-SSHCommand {
    param([string]$Command)
    ssh "${VPS_USER}@${VPS_HOST}" $Command
}

Write-Host "1. Construindo frontend..." -ForegroundColor Yellow
Set-Location flowsint-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir frontend!" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "`n2. Enviando arquivos atualizados do backend..." -ForegroundColor Yellow
scp flowsint-core/src/flowsint_core/core/models.py "${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/flowsint-core/src/flowsint_core/core/"
scp flowsint-api/app/api/routes/auth.py "${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/flowsint-api/app/api/routes/"
scp flowsint-api/alembic/versions/add_trial_period_to_profile.py "${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/flowsint-api/alembic/versions/"

Write-Host "`n3. Parando containers..." -ForegroundColor Yellow
Invoke-SSHCommand "cd ${PROJECT_PATH} && docker-compose -f docker-compose.prod.yml down"

Write-Host "`n4. Reconstruindo imagem da API..." -ForegroundColor Yellow
Invoke-SSHCommand "cd ${PROJECT_PATH} && docker-compose -f docker-compose.prod.yml build api"

Write-Host "`n5. Iniciando containers..." -ForegroundColor Yellow
Invoke-SSHCommand "cd ${PROJECT_PATH} && docker-compose -f docker-compose.prod.yml up -d"

Write-Host "`n6. Aguardando API inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n7. Aplicando migration do banco de dados..." -ForegroundColor Yellow
Invoke-SSHCommand "docker exec flowsint-api-prod alembic upgrade head"

Write-Host "`n8. Verificando schema do banco..." -ForegroundColor Yellow
Invoke-SSHCommand "docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c '\d profiles'"

Write-Host "`n9. Limpando diretório do frontend no servidor..." -ForegroundColor Yellow
Invoke-SSHCommand "rm -rf ${FRONTEND_PATH}/*"

Write-Host "`n10. Enviando frontend..." -ForegroundColor Yellow
scp -r flowsint-app/dist/* "${VPS_USER}@${VPS_HOST}:${FRONTEND_PATH}/"

Write-Host "`n11. Ajustando permissões..." -ForegroundColor Yellow
Invoke-SSHCommand "chown -R www-data:www-data ${FRONTEND_PATH}/ && chmod -R 755 ${FRONTEND_PATH}/"

Write-Host "`n12. Recarregando Nginx..." -ForegroundColor Yellow
Invoke-SSHCommand "systemctl reload nginx"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verificando usuários e trials:" -ForegroundColor Cyan
Invoke-SSHCommand "docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c 'SELECT email, is_paid, trial_ends_at FROM profiles ORDER BY created_at DESC LIMIT 10;'"

Write-Host "`nAcesse: https://rsl.scarletredsolutions.com" -ForegroundColor Cyan
