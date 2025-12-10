#!/bin/bash
# Script robusto de correção - Scarlet-IA
# Executar na VPS: bash /tmp/fix_scarlet_final.sh

echo "=== Scarlet-IA - Correção Final ==="

# 1. Parar container completamente
echo "[1/6] Parando container..."
docker stop flowsint-api-prod
docker wait flowsint-api-prod 2>/dev/null
sleep 3

# 2. Instalar openai
echo "[2/6] Instalando openai..."
docker start flowsint-api-prod
sleep 10
docker exec flowsint-api-prod pip install --no-cache-dir openai==1.54.0
docker stop flowsint-api-prod
sleep 3

# 3. Commit das alterações na imagem
echo "[3/6] Salvando alterações na imagem..."
docker commit flowsint-api-prod flowsint-prod-api:scarlet-ia
docker tag flowsint-prod-api:scarlet-ia flowsint-prod-api:latest

# 4. Recriar container com nova imagem
echo "[4/6] Recriando container..."
docker rm flowsint-api-prod
docker run -d --name flowsint-api-prod \
  --network host \
  --restart unless-stopped \
  -v /var/www/rsl/.env:/app/.env \
  flowsint-prod-api:latest

# 5. Aguardar inicialização
echo "[5/6] Aguardando inicialização (20 segundos)..."
sleep 20

# 6. Verificar status
echo "[6/6] Verificando status..."
echo ""
echo "=== Logs ==="
docker logs flowsint-api-prod --tail 25
echo ""
echo "=== Status do Container ==="
docker ps --filter "name=flowsint-api-prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Teste de Endpoint ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health)
echo "Health check: $HTTP_CODE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/scarlet-ia/tools)
echo "Scarlet-IA tools: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Acesse: https://rsl.scarletredsolutions.com/dashboard/scarlet-ia"
else
    echo ""
    echo "⚠️ Container iniciado mas endpoint retornou: $HTTP_CODE"
    echo "Verificar logs: docker logs flowsint-api-prod -f"
fi
