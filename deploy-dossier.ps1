Write-Host "Iniciando deploy do Dossie..." -ForegroundColor Cyan

# 1. Build
Write-Host "Construindo aplicacao..." -ForegroundColor Yellow
Set-Location flowsint-dossier
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 2. Limpar servidor
Write-Host "Limpando servidor..." -ForegroundColor Yellow
ssh root@31.97.83.205 'rm -rf /var/www/dossie/* && mkdir -p /var/www/dossie'

# 3. Enviar arquivos
Write-Host "Enviando arquivos..." -ForegroundColor Yellow
Set-Location flowsint-dossier
scp -r dist/* root@31.97.83.205:/var/www/dossie/
Set-Location ..

# 4. Permissões
Write-Host "Ajustando permissoes..." -ForegroundColor Yellow
ssh root@31.97.83.205 'chown -R www-data:www-data /var/www/dossie'

Write-Host "Deploy concluido!" -ForegroundColor Green
