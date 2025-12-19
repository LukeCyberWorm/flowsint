# Setup Script - Sistema de Dossiê
# Execute: .\setup-dossier.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Sistema de Dossiê - Setup" -ForegroundColor Cyan
Write-Host "  Scarlet Red Solutions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Instalar dependências do frontend cliente
Write-Host "📦 Instalando dependências do frontend cliente..." -ForegroundColor Yellow
Set-Location flowsint-dossier
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Dependências do cliente instaladas!" -ForegroundColor Green
}
else {
    Write-Host "❌ package.json não encontrado em flowsint-dossier" -ForegroundColor Red
}
Set-Location ..

Write-Host ""

# 2. Instalar dependências do frontend admin
Write-Host "📦 Instalando dependências do frontend admin..." -ForegroundColor Yellow
Set-Location flowsint-dossier-admin
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Dependências do admin instaladas!" -ForegroundColor Green
}
else {
    Write-Host "❌ package.json não encontrado em flowsint-dossier-admin" -ForegroundColor Red
}
Set-Location ..

Write-Host ""

# 3. Criar arquivos .env
Write-Host "📝 Criando arquivos .env..." -ForegroundColor Yellow

# .env para cliente
if (!(Test-Path "flowsint-dossier\.env")) {
    Copy-Item "flowsint-dossier\.env.example" "flowsint-dossier\.env"
    Write-Host "✅ Arquivo .env criado para cliente" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .env já existe para cliente" -ForegroundColor DarkYellow
}

# .env para admin
if (!(Test-Path "flowsint-dossier-admin\.env")) {
    Copy-Item "flowsint-dossier-admin\.env.example" "flowsint-dossier-admin\.env"
    Write-Host "✅ Arquivo .env criado para admin" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .env já existe para admin" -ForegroundColor DarkYellow
}

Write-Host ""

# 4. Executar migração do banco
Write-Host "🗄️  Executando migração do banco de dados..." -ForegroundColor Yellow
Set-Location flowsint-api
$migrateChoice = Read-Host "Deseja executar 'alembic upgrade head' agora? (S/N)"
if ($migrateChoice -eq "S" -or $migrateChoice -eq "s") {
    alembic upgrade head
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migração executada com sucesso!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Erro ao executar migração" -ForegroundColor Red
    }
}
else {
    Write-Host "⏭️  Migração pulada. Execute manualmente: alembic upgrade head" -ForegroundColor DarkYellow
}
Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure as variáveis de ambiente nos arquivos .env" -ForegroundColor White
Write-Host "2. Para desenvolvimento local:" -ForegroundColor White
Write-Host "   - Frontend Cliente: cd flowsint-dossier && npm run dev" -ForegroundColor Gray
Write-Host "   - Frontend Admin:   cd flowsint-dossier-admin && npm run dev" -ForegroundColor Gray
Write-Host "   - API:              cd flowsint-api && uvicorn app.main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Para deploy no Railway, consulte:" -ForegroundColor White
Write-Host "   DOSSIER_DEPLOY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentação completa: DOSSIER_README.md" -ForegroundColor Cyan
Write-Host ""
