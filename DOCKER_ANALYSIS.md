# ANÁLISE DOS PROBLEMAS E SOLUÇÕES - SCARLET-IA DEPLOY

## ❌ Problemas Encontrados no Docker

### 1. **Estrutura de diretórios na VPS diferente do esperado**
- **Problema**: Tentei copiar para `/var/www/rsl/flowsint-api/app/` mas não existe
- **Realidade**: Código está dentro do container em `/app/flowsint-api/app/`
- **Solução**: Copiar arquivos para `/tmp/` na VPS e depois usar `docker cp` para dentro do container

### 2. **Diretórios `models/` e `services/` não existiam**
- **Problema**: Container original não tem esses diretórios
- **Solução**: Criar com `docker exec flowsint-api-prod mkdir -p /app/flowsint-api/app/models /app/flowsint-api/app/services`

### 3. **Import de `face_recognition` não existe**
- **Problema**: `main.py` importa `from app.api.routes import face_recognition` mas arquivo não existe
- **Causa**: Código desatualizado ou módulo removido
- **Solução**: Remover linhas de import e router.include do face_recognition
- **Arquivo**: `c:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\main.py` (linhas 21 e 81)

### 4. **Import circular em `scarlet_ia.py` models**
- **Problema**: Copiei arquivo errado - usei routes no lugar de models
- **Causa**: Comando `scp ... scarlet_ia.py` sem distinguir origem
- **Solução**: Renomear arquivos temporários: `scarlet_ia_models.py`, `scarlet_ia_routes.py`, `scarlet_ia_service.py`

### 5. **Módulo `app.models.base` não existe**
- **Problema**: `from app.models.base import Base` falha
- **Realidade**: Projeto usa `flowsint_core.core.models` para models
- **Solução**: Criar `Base = declarative_base()` localmente no arquivo scarlet_ia.py
- **Arquivo corrigido**: `c:\Users\Platzeck\Desktop\flowsint\flowsint-api\app\models\scarlet_ia.py` linha 8

### 6. **Falta módulo `openai`**
- **Problema**: `ModuleNotFoundError: No module named 'openai'`
- **Causa**: `pyproject.toml` não incluía openai nas dependências
- **Solução**: 
  - Adicionar `openai = "^1.54.0"` no pyproject.toml
  - Fazer rebuild do container: `docker build -t flowsint-prod-api:latest -f flowsint-api/Dockerfile .`
  - OU instalar manualmente: `docker exec flowsint-api-prod pip install openai`

### 7. **Falta arquivo `__init__.py` nos novos diretórios**
- **Problema**: Python não reconhece `models/` e `services/` como módulos
- **Solução**: `docker exec flowsint-api-prod touch /app/flowsint-api/app/models/__init__.py /app/flowsint-api/app/services/__init__.py`

### 8. **Container em loop de restart**
- **Problema**: Erros de import causam falha na inicialização
- **Comportamento**: Container reinicia continuamente tentando corrigir
- **Solução**: `docker stop` antes de fazer alterações, depois `docker start` após correções

## ✅ Solução Definitiva

### Opção 1: Rebuild Completo (Recomendado)

```powershell
# 1. Adicionar openai ao pyproject.toml (JÁ FEITO)

# 2. Rebuild da imagem
cd C:\Users\Platzeck\Desktop\flowsint
docker build -t flowsint-prod-api:latest -f flowsint-api/Dockerfile .

# 3. Salvar e copiar para VPS
docker save flowsint-prod-api:latest | gzip > flowsint-api-scarlet.tar.gz
scp flowsint-api-scarlet.tar.gz root@31.97.83.205:/tmp/

# 4. Na VPS: carregar imagem e recriar container
ssh root@31.97.83.205
docker load < /tmp/flowsint-api-scarlet.tar.gz
docker stop flowsint-api-prod
docker rm flowsint-api-prod
docker run -d --name flowsint-api-prod --network host \
  -v /var/www/rsl/.env:/app/.env \
  --restart unless-stopped \
  flowsint-prod-api:latest

# 5. Verificar
docker logs flowsint-api-prod --tail 50
curl https://rsl.scarletredsolutions.com/api/scarlet-ia/tools
```

### Opção 2: Instalação Manual no Container Atual

```bash
# Na VPS via SSH
docker stop flowsint-api-prod

# Instalar openai
docker start flowsint-api-prod
sleep 5
docker exec flowsint-api-prod pip install openai

# Verificar instalação
docker exec flowsint-api-prod pip show openai

# Reiniciar
docker restart flowsint-api-prod
docker logs flowsint-api-prod --tail 30
```

## 📊 Status Atual

### ✅ Completado
1. Migration SQL aplicada (3 tabelas criadas)
2. OPENAI_API_KEY adicionada ao .env do container
3. Arquivos Python copiados para container:
   - `/app/flowsint-api/app/models/scarlet_ia.py` ✅
   - `/app/flowsint-api/app/services/scarlet_ia_service.py` ✅
   - `/app/flowsint-api/app/api/routes/scarlet_ia.py` ✅
   - `/app/flowsint-api/app/main.py` ✅ (sem face_recognition)
4. Diretórios `models/` e `services/` criados com `__init__.py`
5. Build do frontend completado
6. Frontend copiado para VPS (`/var/www/rsl/`)

### ❌ Pendente
1. Instalar módulo `openai` no container
2. Testar endpoint `/api/scarlet-ia/tools`
3. Testar streaming `/api/scarlet-ia/chat`

## 🚀 Próximos Passos Recomendados

### Imediato (Resolver openai)
```bash
ssh root@31.97.83.205
docker exec flowsint-api-prod pip install openai==1.54.0
docker restart flowsint-api-prod
docker logs flowsint-api-prod --tail 50 -f
```

### Teste Completo
```bash
# 1. Testar ferramentas
curl https://rsl.scarletredsolutions.com/api/scarlet-ia/tools | jq

# 2. Testar chat (precisa token)
TOKEN="seu_token_aqui"
curl -N -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","messages":[{"id":"msg1","role":"user","parts":[{"type":"text","text":"olá"}]}],"trigger":"submit-message"}' \
  https://rsl.scarletredsolutions.com/api/scarlet-ia/chat
```

### Deploy Final (Quando funcionando local)
1. Fazer rebuild completo (Opção 1 acima)
2. Deploy via docker-compose na VPS
3. Configurar monitoramento de logs
4. Teste de carga

## 🔍 Comandos Úteis para Debug

```bash
# Ver estrutura do container
docker exec flowsint-api-prod find /app/flowsint-api/app -name '*.py' -type f

# Ver imports de um arquivo
docker exec flowsint-api-prod grep -E '^from|^import' /app/flowsint-api/app/main.py

# Ver logs em tempo real
docker logs flowsint-api-prod --tail 100 -f

# Entrar no container
docker exec -it flowsint-api-prod /bin/bash

# Ver módulos Python instalados
docker exec flowsint-api-prod pip list | grep openai

# Verificar tabelas do banco
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "\dt scarlet*"
```

## 📝 Lições Aprendidas

1. **Sempre usar `docker cp` para containers sem volumes montados**
2. **Verificar estrutura interna do container antes de copiar**
3. **Criar diretórios antes de copiar arquivos**
4. **Parar container antes de fazer alterações críticas**
5. **Adicionar dependências no pyproject.toml antes do build**
6. **Usar nomes descritivos para arquivos temporários (evita confusão)**
7. **Verificar imports e módulos existentes antes de criar novos models**
8. **Rebuild completo é mais confiável que patches manuais**
