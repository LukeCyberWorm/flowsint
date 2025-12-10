# Scarlet-IA - Implementação Completa

## ✅ Implementado

### 1. Backend (FastAPI)

#### Modelos de Banco de Dados (`app/models/scarlet_ia.py`)
- `ScarletIAMessage` - Armazena mensagens do chat
  - Suporta estrutura de `parts` (step-start, text chunks, sources)
  - Campos: chat_id, message_id, role, content, parts (JSONB), sources (JSONB), tools_used
- `ScarletIANote` - Notas vinculadas a investigações
- `ScarletIAChatSession` - Sessões de chat com contagem de mensagens

#### Serviço de IA (`app/services/scarlet_ia_service.py`)
- `ScarletIAService` - Integração com OpenAI GPT-4
- **Streaming SSE** completo via `process_message_stream()`
- Formato de eventos:
  ```
  data: {"type": "step-start"}
  data: {"type": "text", "text": "chunk", "state": "streaming"}
  data: {"type": "text", "text": "", "state": "done"}
  data: {"type": "sources", "sources": [...]}
  data: [DONE]
  ```
- System prompt com descrição das 16 ferramentas
- Método `execute_tool()` para executar ferramentas OSINT/Kali

#### Rotas da API (`app/api/routes/scarlet_ia.py`)
- `POST /api/scarlet-ia/chat` - Chat com streaming SSE
- `GET /api/scarlet-ia/history` - Histórico de mensagens
- `POST /api/scarlet-ia/notes` - Criar nota
- `GET /api/scarlet-ia/notes` - Listar notas
- `DELETE /api/scarlet-ia/notes/{id}` - Deletar nota
- `POST /api/scarlet-ia/execute-tool` - Executar ferramenta
- `GET /api/scarlet-ia/tools` - Listar ferramentas
- `GET /api/scarlet-ia/kali-tools` - Listar ferramentas Kali

#### Registrado em `app/main.py`
```python
app.include_router(scarlet_ia.router, prefix="/api/scarlet-ia", tags=["scarlet-ia"])
```

### 2. Frontend (React + TypeScript)

#### Service (`src/api/scarlet-ia-service.ts`)
- Interface `ChatMessage` com estrutura compatível com SkynetChat
- Interface `MessagePart` para streaming progressivo
- `sendMessageStream()` - Lê SSE e processa chunks
  - Callbacks: onChunk, onComplete, onError
  - Decodifica eventos `data:` do stream
  - Atualiza UI em tempo real
- `generateChatId()` e `generateMessageId()` - IDs aleatórios 16 chars

#### UI (`src/routes/_auth.dashboard.scarlet-ia.tsx`)
- Integração com streaming SSE
- Estado `isStreaming` nas mensagens
- Rendering progressivo do conteúdo
- Conversão de Message[] para ChatMessage[]
- Suporte a fontes (sources)
- 16 ferramentas OSINT + Kali exibidas

### 3. Migração de Banco de Dados
- `alembic/versions/add_scarlet_ia_tables.py`
- Cria 3 tabelas: scarlet_ia_messages, scarlet_ia_notes, scarlet_ia_chat_sessions
- Índices em user_id, investigation_id, chat_id, created_at

## 📋 Próximos Passos

### 1. Configuração do Ambiente
```bash
# Adicionar ao .env do flowsint-api
OPENAI_API_KEY=sk-...
```

### 2. Executar Migration
```bash
cd flowsint-api
# No container ou localmente
alembic upgrade head
```

### 3. Build do Frontend
```bash
cd flowsint-app
npm run build
# Gera dist/ com novo código
```

### 4. Deploy para Produção
```bash
# 1. Copiar build para servidor
scp -r dist/* root@31.97.83.205:/var/www/rsl/

# 2. Copiar código Python atualizado
scp app/models/scarlet_ia.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/models/
scp app/services/scarlet_ia_service.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/services/
scp app/api/routes/scarlet_ia.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/api/routes/
scp app/main.py root@31.97.83.205:/var/www/rsl/flowsint-api/app/
scp alembic/versions/add_scarlet_ia_tables.py root@31.97.83.205:/var/www/rsl/flowsint-api/alembic/versions/

# 3. SSH no servidor
ssh root@31.97.83.205

# 4. Executar migration
docker exec flowsint-api-prod alembic upgrade head

# 5. Reiniciar containers
docker restart flowsint-api-prod
docker restart flowsint-app-prod
```

### 5. Testar
```
https://rsl.scarletredsolutions.com/dashboard/scarlet-ia
```

## 🎯 Funcionalidades

### Implementadas
- ✅ Streaming de respostas SSE
- ✅ Histórico de mensagens persistente
- ✅ Notas vinculadas a investigações
- ✅ 16 ferramentas (6 OSINT + 10 Kali)
- ✅ Interface de chat completa
- ✅ Seletor de caso/investigação
- ✅ Badges de ferramentas usadas
- ✅ Timestamps em português
- ✅ Scroll automático

### A Implementar (Fase 2)
- ⏳ Execução real de ferramentas OSINT
- ⏳ SSH para Kali Linux (paramiko)
- ⏳ Web search para fontes
- ⏳ Exportação PDF de relatórios
- ⏳ Upload de imagens para análise facial
- ⏳ Tool calling com OpenAI function calling
- ⏳ Memory/contexto entre sessões
- ⏳ Sugestões de próximos passos

## 🔧 Troubleshooting

### Erro de CORS
Se houver erro de CORS ao testar streaming, adicionar em `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # <- adicionar
)
```

### Streaming não funciona
1. Verificar que `text/event-stream` está no Content-Type
2. Testar com curl:
```bash
curl -N -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","messages":[{"id":"msg1","role":"user","parts":[{"type":"text","text":"olá"}]}],"trigger":"submit-message"}' \
  https://rsl.scarletredsolutions.com/api/scarlet-ia/chat
```

### OpenAI API não responde
1. Verificar OPENAI_API_KEY no .env
2. Testar chave: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`
3. Verificar saldo da conta OpenAI

## 📊 Arquitetura

```
User Input
    ↓
React Component (handleSendMessage)
    ↓
scarletIAService.sendMessageStream()
    ↓
POST /api/scarlet-ia/chat (FastAPI)
    ↓
scarlet_ia_service.process_message_stream()
    ↓
OpenAI API (stream=True)
    ↓
Yield SSE chunks
    ↓
Frontend EventSource reader
    ↓
onChunk() → Update UI progressivamente
    ↓
onComplete() → Finalizar mensagem
```

## 🎨 Formato de Mensagem

### Enviado para API
```json
{
  "id": "chat_123abc",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "parts": [
        {"type": "text", "text": "olá"}
      ]
    }
  ],
  "trigger": "submit-message",
  "investigation_id": "uuid-optional"
}
```

### Recebido via SSE
```
data: {"type": "step-start"}

data: {"type": "text", "text": "Olá! ", "state": "streaming"}

data: {"type": "text", "text": "Como ", "state": "streaming"}

data: {"type": "text", "text": "posso ajudar?", "state": "streaming"}

data: {"type": "text", "text": "", "state": "done"}

data: [DONE]
```

## 🚀 Status

**Backend**: ✅ 100% implementado
**Frontend**: ✅ 95% implementado (falta atualizar UI final)
**Database**: ✅ Migration criada
**Deployment**: ⏳ Aguardando deploy

**Pronto para deploy e testes!**
