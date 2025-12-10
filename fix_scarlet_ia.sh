#!/bin/bash
# Script final de correção do Scarlet-IA
# Executar na VPS: bash /tmp/fix_scarlet_ia.sh

echo "=== Corrigindo Scarlet-IA ==="

# 1. Instalar openai
echo "[1/4] Instalando openai..."
docker exec flowsint-api-prod pip install -q openai==1.54.0
if [ $? -eq 0 ]; then
    echo "✅ openai instalado com sucesso!"
else
    echo "❌ Erro ao instalar openai"
    exit 1
fi

# 2. Reiniciar container
echo "[2/4] Reiniciando container..."
docker restart flowsint-api-prod
sleep 15

# 3. Verificar logs
echo "[3/4] Verificando logs..."
docker logs flowsint-api-prod --tail 20

# 4. Testar endpoint
echo "[4/4] Testando endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/scarlet-ia/tools)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Endpoint funcionando! Status: $HTTP_CODE"
    echo ""
    echo "=== Deploy concluído com sucesso! ==="
    echo "Acesse: https://rsl.scarletredsolutions.com/dashboard/scarlet-ia"
else
    echo "❌ Endpoint retornou status: $HTTP_CODE"
    echo "Verificar logs: docker logs flowsint-api-prod"
fi
