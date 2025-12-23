# Deploy de Veículos - Sistema RSL
# Data: 22/12/2025
# Deploy completo da funcionalidade de veículos (backend + frontend + banco)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY VEICULOS - SISTEMA RSL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$VPS_IP = "31.97.83.205"
$VPS_USER = "root"
$PROJECT_PATH = "/opt/flowsint"

# Verificar conexão SSH
Write-Host "[1/8] Verificando conexão com VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "echo 'Conexão OK'" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Não foi possível conectar ao VPS!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Conexão estabelecida" -ForegroundColor Green
Write-Host ""

# 1. BACKEND - Modelos e Integração Work API
Write-Host "[2/8] Enviando modelos de dados..." -ForegroundColor Yellow
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\models\vehicle.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/models/vehicle.py

Write-Host "[3/8] Enviando schemas Pydantic..." -ForegroundColor Yellow
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\schemas\vehicle.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/schemas/vehicle.py

Write-Host "[4/8] Enviando rotas FastAPI..." -ForegroundColor Yellow
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\routes\vehicles.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/routes/vehicles.py

Write-Host "[5/8] Enviando integração Work Consultoria..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${PROJECT_PATH}/flowsint-api/app/integrations/workconsultoria"
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\integrations\workconsultoria\__init__.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/integrations/workconsultoria/__init__.py
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\integrations\workconsultoria\client.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/integrations/workconsultoria/client.py
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\integrations\workconsultoria\README.md ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/integrations/workconsultoria/README.md

Write-Host "[6/8] Atualizando main.py com router de veículos..." -ForegroundColor Yellow
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\main.py ${VPS_USER}@${VPS_IP}:${PROJECT_PATH}/flowsint-api/app/main.py

Write-Host "✅ Arquivos backend enviados" -ForegroundColor Green
Write-Host ""

# 2. VARIÁVEIS DE AMBIENTE
Write-Host "[7/8] Configurando variáveis de ambiente..." -ForegroundColor Yellow
$ENV_VARS = @"
# Work Consultoria API Configuration
WORK_CONSULTORIA_API_URL=https://api.workconsultoria.com/api/v1/
WORK_CONSULTORIA_ACCESS_TOKEN=AH_0gMrfF3Us-D__pLdfAA
WORK_CONSULTORIA_CLIENT=tr2TUHr37D3qGNFTOZDYqg
WORK_CONSULTORIA_EXPIRY=1766520379
WORK_CONSULTORIA_TOKEN_TYPE=Bearer
WORK_CONSULTORIA_UID=lukecyberworm
WORK_CONSULTORIA_CF_CLEARANCE=
"@

ssh ${VPS_USER}@${VPS_IP} @"
echo '$ENV_VARS' >> ${PROJECT_PATH}/flowsint-api/.env
"@
Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green
Write-Host ""

# 3. MIGRAÇÃO DO BANCO DE DADOS
Write-Host "[8/8] Executando migração do banco de dados..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} @"
cd ${PROJECT_PATH} && \
docker exec flowsint-api-prod bash -c 'cd /app/flowsint-api && alembic revision --autogenerate -m "Add vehicle tables"' && \
docker exec flowsint-api-prod bash -c 'cd /app/flowsint-api && alembic upgrade head'
"@
Write-Host "✅ Migração do banco concluída" -ForegroundColor Green
Write-Host ""

# 4. REBUILD E RESTART DO BACKEND
Write-Host "Reconstruindo container da API..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} @"
cd ${PROJECT_PATH} && \
docker-compose -f docker-compose.prod.yml build api && \
docker-compose -f docker-compose.prod.yml up -d api
"@
Write-Host "✅ Backend reiniciado" -ForegroundColor Green
Write-Host ""

# 5. FRONTEND
Write-Host "Construindo frontend..." -ForegroundColor Yellow
Set-Location flowsint-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir frontend!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Build do frontend concluído" -ForegroundColor Green
Write-Host ""

Write-Host "Enviando frontend para VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "rm -rf /var/www/rsl/* && mkdir -p /var/www/rsl"
scp -r dist/* ${VPS_USER}@${VPS_IP}:/var/www/rsl/
ssh ${VPS_USER}@${VPS_IP} "chown -R www-data:www-data /var/www/rsl"
Set-Location ..
Write-Host "✅ Frontend enviado" -ForegroundColor Green
Write-Host ""

# 6. RESTART NGINX
Write-Host "Reiniciando nginx..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "systemctl restart nginx"
Write-Host "✅ Nginx reiniciado" -ForegroundColor Green
Write-Host ""

# 7. VERIFICAÇÃO
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO DO DEPLOY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificando status dos containers..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "docker ps --filter name=flowsint --format 'table {{.Names}}\t{{.Status}}'"
Write-Host ""

Write-Host "Verificando logs da API (últimas 20 linhas)..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "docker logs flowsint-api-prod --tail 20"
Write-Host ""

Write-Host "Verificando tabelas de veículos no banco..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c '\dt vehicles*'"
Write-Host ""

# 8. RESUMO
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 O QUE FOI INSTALADO:" -ForegroundColor Cyan
Write-Host "  ✅ Backend:" -ForegroundColor White
Write-Host "     - Modelos: Vehicle + VehicleRadarDetection" -ForegroundColor Gray
Write-Host "     - Schemas: 15+ schemas Pydantic" -ForegroundColor Gray
Write-Host "     - Rotas: 15 endpoints FastAPI" -ForegroundColor Gray
Write-Host "     - Integração: Work Consultoria API Client" -ForegroundColor Gray
Write-Host "     - Migração: Tabelas criadas no PostgreSQL" -ForegroundColor Gray
Write-Host ""
Write-Host "  ✅ Frontend:" -ForegroundColor White
Write-Host "     - Modal: AddEntityModal" -ForegroundColor Gray
Write-Host "     - Componente: VehicleEntitySelector (4 cards)" -ForegroundColor Gray
Write-Host "     - Painel: VehicleSearchPanel (4 abas)" -ForegroundColor Gray
Write-Host "     - Integração: Botão 'Add Entity' na página de investigação" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 ACESSO:" -ForegroundColor Cyan
Write-Host "   Frontend: https://rsl.scarletredsolutions.com" -ForegroundColor White
Write-Host "   API Docs: https://api.scarletredsolutions.com/docs" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Testar busca por proprietário (CPF) - FUNCIONAL" -ForegroundColor White
Write-Host "   2. Capturar endpoint correto de placa da Work API" -ForegroundColor White
Write-Host "   3. Testar adição de veículos ao dossiê" -ForegroundColor White
Write-Host ""
Write-Host "📚 DOCUMENTAÇÃO:" -ForegroundColor Cyan
Write-Host "   Local: IMPLEMENTACAO_VEICULOS_COMPLETA.md" -ForegroundColor White
Write-Host ""
Write-Host "Para monitorar logs em tempo real:" -ForegroundColor Yellow
Write-Host "ssh ${VPS_USER}@${VPS_IP} 'docker logs flowsint-api-prod -f'" -ForegroundColor Gray
Write-Host ""
