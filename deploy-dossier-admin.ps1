Write-Host "Iniciando deploy do Dossie Admin..." -ForegroundColor Cyan

# 1. Build
Write-Host "Construindo aplicacao..." -ForegroundColor Yellow
Set-Location flowsint-dossier-admin
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 2. Limpar servidor
Write-Host "Limpando servidor..." -ForegroundColor Yellow
ssh root@31.97.83.205 'rm -rf /var/www/adm-dossie/* && mkdir -p /var/www/adm-dossie'

# 3. Enviar arquivos
Write-Host "Enviando arquivos..." -ForegroundColor Yellow
Set-Location flowsint-dossier-admin
scp -r dist/* root@31.97.83.205:/var/www/adm-dossie/
Set-Location ..

# 4. Permissões
Write-Host "Ajustando permissoes..." -ForegroundColor Yellow
ssh root@31.97.83.205 'chown -R www-data:www-data /var/www/adm-dossie'

Write-Host "Deploy concluido!" -ForegroundColor Green
