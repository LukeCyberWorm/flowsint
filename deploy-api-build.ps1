$password = "@Lcw25257946"
$commands = @"
cd /opt/flowsint
docker compose -f docker-compose.prod.yml build --no-cache api
docker compose -f docker-compose.prod.yml up -d
docker ps | grep api
docker logs flowsint-api-prod --tail 20
"@

Write-Host "Conectando e executando build..."
echo $password | ssh root@31.97.83.205 $commands
