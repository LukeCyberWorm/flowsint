# Script de Build para Deploy - Sistema de Dossiê
# Este script faz o build de produção dos frontends

Write-Host "🚀 Iniciando build de produção..." -ForegroundColor Cyan
Write-Host ""

# Build Frontend Client
Write-Host "📦 Building Frontend Client (dossie.scarletredsolutions.com)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\flowsint-dossier"

if (Test-Path "dist") {
    Write-Host "  Limpando build anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force dist
}

Write-Host "  Instalando dependências..." -ForegroundColor Gray
npm install

Write-Host "  Compilando..." -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Client build concluído!" -ForegroundColor Green
    $clientSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  📊 Tamanho: $([math]::Round($clientSize, 2)) MB" -ForegroundColor Gray
}
else {
    Write-Host "  ❌ Erro no build do client!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build Frontend Admin
Write-Host "📦 Building Frontend Admin (adm-dossie.scarletredsolutions.com)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\flowsint-dossier-admin"

if (Test-Path "dist") {
    Write-Host "  Limpando build anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force dist
}

Write-Host "  Instalando dependências..." -ForegroundColor Gray
npm install

Write-Host "  Compilando..." -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Admin build concluído!" -ForegroundColor Green
    $adminSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  📊 Tamanho: $([math]::Round($adminSize, 2)) MB" -ForegroundColor Gray
}
else {
    Write-Host "  ❌ Erro no build do admin!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Build de produção concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Arquivos gerados:" -ForegroundColor Cyan
Write-Host "  - flowsint-dossier/dist/" -ForegroundColor White
Write-Host "  - flowsint-dossier-admin/dist/" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Commit e push para GitHub" -ForegroundColor White
Write-Host "  2. Deploy no Railway seguindo DOSSIER_RAILWAY_DEPLOY.md" -ForegroundColor White
Write-Host "  3. Configurar domínios customizados" -ForegroundColor White
Write-Host ""

Set-Location $PSScriptRoot
