Write-Host "Iniciando atualizacao do backend..." -ForegroundColor Cyan

# 1. Enviar arquivos de configuracao modificados
Write-Host "Enviando configuracoes corrigidas..." -ForegroundColor Yellow
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\pyproject.toml root@31.97.83.205:/opt/flowsint/flowsint-api/pyproject.toml
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\poetry.lock root@31.97.83.205:/opt/flowsint/flowsint-api/poetry.lock
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-core\pyproject.toml root@31.97.83.205:/opt/flowsint/flowsint-core/pyproject.toml

# 2. Rebuild do container
Write-Host "Reconstruindo container da API..." -ForegroundColor Yellow
ssh root@31.97.83.205 'cd /opt/flowsint && docker-compose -f docker-compose.prod.yml build api && docker-compose -f docker-compose.prod.yml up -d api'

# 3. Criar admin
Write-Host "Criando usuario administrador..." -ForegroundColor Yellow
# Enviar script atualizado
scp C:\Users\Platzeck\Desktop\flowsint\flowsint-api\create_admin.py root@31.97.83.205:/root/create_admin.py
# Copiar para dentro do container e executar
ssh root@31.97.83.205 'docker cp /root/create_admin.py flowsint-api-prod:/app/flowsint-api/create_admin.py && docker exec flowsint-api-prod python create_admin.py'

Write-Host "Backend atualizado e admin criado!" -ForegroundColor Green
