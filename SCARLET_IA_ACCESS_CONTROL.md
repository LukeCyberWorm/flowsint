# Scarlet-IA: Controle de Acesso e Isolamento por Usuário

## ✅ Implementado

### 1. **Isolamento por Usuário**
Cada chat, mensagem e nota do Scarlet-IA é vinculada ao `user_id` do usuário autenticado:

- **Tabelas**: `scarlet_ia_messages`, `scarlet_ia_notes`, `scarlet_ia_chat_sessions`
- **Coluna**: `user_id UUID NOT NULL` (foreign key para `profiles.id`)
- **Comportamento**: Todas as queries filtram automaticamente por `user_id`

**Exemplo**:
```python
# Usuario A cria chat
chat_session = ScarletIAChatSession(
    chat_id="chat-123",
    user_id=UUID("user-a-uuid"),
    ...
)

# Usuario B não consegue ver o chat do Usuario A
query = db.query(ScarletIAChatSession).filter(
    ScarletIAChatSession.chat_id == "chat-123",
    ScarletIAChatSession.user_id == UUID("user-b-uuid")  # Não retorna nada
)
```

### 2. **Restrição de Acesso: Apenas ADMIN**

Criada dependency `get_admin_user()` que verifica se o usuário está na lista de emails ADMIN:

```python
# app/api/deps.py
def get_admin_user(current_user: Profile = Depends(get_current_user)) -> Profile:
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access restricted to admins")
    return current_user
```

**Todos os endpoints do Scarlet-IA** usam `Depends(get_admin_user)`:
- POST `/scarlet-ia/chat` - Iniciar chat
- GET `/scarlet-ia/history` - Ver histórico
- POST/GET/DELETE `/scarlet-ia/notes` - Gerenciar notas
- POST `/scarlet-ia/execute-tool` - Executar ferramentas OSINT/Kali
- GET `/scarlet-ia/tools` - Listar ferramentas
- GET `/scarlet-ia/kali-tools` - Listar ferramentas Kali

### 3. **Configuração de ADMINs**

Variável de ambiente:
```bash
SCARLET_IA_ADMIN_EMAILS=lucas.oliveira@scarletredsolutions.com,admin@example.com
```

**Lista separada por vírgula** de emails que têm acesso ao Scarlet-IA.

## 📋 Resumo das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| `app/api/deps.py` | + `ADMIN_EMAILS` (env var)<br>+ `get_admin_user()` dependency |
| `app/api/routes/scarlet_ia.py` | + Import `Profile`<br>+ Todas as rotas usam `get_admin_user`<br>+ Correção de tipos `dict` → `Profile`<br>+ Filtros por `user_id` em queries |
| `app/models/scarlet_ia.py` | ✅ Já tinha `user_id` |
| `alembic/versions/add_scarlet_ia_tables.py` | ✅ Migration já cria `user_id` |

## 🚀 Deploy no VPS

### 1. Adicionar variável de ambiente

SSH no VPS e editar:
```bash
ssh root@31.97.83.205
docker stop flowsint-api-prod
docker rm flowsint-api-prod

# Recriar com SCARLET_IA_ADMIN_EMAILS
docker run -d --name flowsint-api-prod \
  --network host \
  --restart unless-stopped \
  -e OPENAI_API_KEY=... \
  -e DATABASE_URL=postgresql://flowsint:flowsint@localhost:5433/flowsint \
  -e NEO4J_URI_BOLT=bolt://localhost:7687 \
  -e NEO4J_USERNAME=neo4j \
  -e NEO4J_PASSWORD=password \
  -e REDIS_URL=redis://localhost:6379/0 \
  -e SCARLET_IA_ADMIN_EMAILS=lucas.oliveira@scarletredsolutions.com \
  flowsint-prod-api:latest
```

### 2. Rebuild da imagem com código atualizado

```bash
# No local Windows
cd C:\Users\Platzeck\Desktop\flowsint
docker build -t flowsint-prod-api:latest -f flowsint-api/Dockerfile .

# Salvar e transferir
docker save flowsint-prod-api:latest | gzip > flowsint-api.tar.gz
scp flowsint-api.tar.gz root@31.97.83.205:/tmp/

# No VPS
ssh root@31.97.83.205
docker load < /tmp/flowsint-api.tar.gz
docker stop flowsint-api-prod
docker rm flowsint-api-prod
# ... (recriar com docker run acima)
```

## ✅ Verificações

### Usuário ADMIN consegue acessar:
```bash
curl -H "Authorization: Bearer <token-admin>" https://rsl.scarletredsolutions.com/api/scarlet-ia/tools
# Retorna: {"tools": [...]}
```

### Usuário NÃO-ADMIN é bloqueado:
```bash
curl -H "Authorization: Bearer <token-nao-admin>" https://rsl.scarletredsolutions.com/api/scarlet-ia/tools
# Retorna: 403 {"detail": "Access to Scarlet-IA is restricted to administrators only"}
```

### Isolamento entre usuários:
- Admin A cria chat → apenas Admin A vê
- Admin B cria chat → apenas Admin B vê
- Notas e mensagens separadas por `user_id`

## 🔧 Manutenção

### Adicionar novo ADMIN:
```bash
# Editar variável de ambiente no container
docker exec -it flowsint-api-prod bash
export SCARLET_IA_ADMIN_EMAILS="lucas.oliveira@scarletredsolutions.com,novo@admin.com"
# Ou recriar container com nova lista
```

### Remover restrição ADMIN (permitir todos):
```python
# app/api/routes/scarlet_ia.py
# Trocar get_admin_user por get_current_user em todas as rotas
```

## 📚 Referências

- Models: `flowsint-api/app/models/scarlet_ia.py`
- Routes: `flowsint-api/app/api/routes/scarlet_ia.py`
- Dependencies: `flowsint-api/app/api/deps.py`
- Migration: `flowsint-api/alembic/versions/add_scarlet_ia_tables.py`
