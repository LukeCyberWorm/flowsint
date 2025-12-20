Write-Host "Iniciando deploy do frontend..." -ForegroundColor Cyan

# 1. Build do frontend
Write-Host "Construindo frontend..." -ForegroundColor Yellow
Set-Location flowsint-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir frontend!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 2. Limpar diretório de destino no servidor
Write-Host "Limpando diretorio no servidor..." -ForegroundColor Yellow
ssh root@31.97.83.205 'rm -rf /var/www/rsl/* && mkdir -p /var/www/rsl'

# 3. Enviar arquivos
Write-Host "Enviando arquivos para o servidor..." -ForegroundColor Yellow
Set-Location flowsint-app
scp -r dist/* root@31.97.83.205:/var/www/rsl/
Set-Location ..

# 4. Ajustar permissões
Write-Host "Ajustando permissoes..." -ForegroundColor Yellow
ssh root@31.97.83.205 'chown -R www-data:www-data /var/www/rsl'

# 5. Reiniciar nginx
Write-Host "Reiniciando nginx..." -ForegroundColor Yellow
ssh root@31.97.83.205 'systemctl restart nginx'

Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
Write-Host "Acesse: https://rsl.scarletredsolutions.com" -ForegroundColor Cyan
