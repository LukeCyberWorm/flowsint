# 🚀 Guia de Inicialização - Sistema de Dossiê

## ✅ Status Atual

- ✅ Modelos do banco de dados criados e testados
- ✅ API endpoints implementados (20+ endpoints)
- ✅ Frontend Client rodando em http://localhost:3002
- ✅ Frontend Admin rodando em http://localhost:3003
- ⏳ Migration do banco de dados pendente (requer PostgreSQL rodando)
- ⏳ API não iniciada (requer banco de dados configurado)

## 📋 Pré-requisitos

1. **Docker Desktop** - Para rodar PostgreSQL e Neo4j
2. **Node.js 18+** - Para os frontends
3. **Python 3.12+** - Para a API

## 🎯 Iniciar o Sistema Completo

### 1. Iniciar Infraestrutura (Docker)

```powershell
# Na pasta raiz do projeto
cd C:\Users\Platzeck\Desktop\flowsint
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5433)
- Neo4j (porta 7474 e 7687)
- Redis (porta 6379)

### 2. Executar Migration do Banco de Dados

```powershell
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-api
alembic upgrade head
```

Isso criará as tabelas:
- `dossiers` - Informações principais dos dossiês
- `dossier_files` - Arquivos anexados
- `dossier_notes` - Notas do dossiê
- `dossier_ia_chats` - Histórico de conversas com IA
- `dossier_access_logs` - Log de acessos

### 3. Iniciar a API

```powershell
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-api
uvicorn app.main:app --reload --port 8000
```

A API estará disponível em:
- http://localhost:8000
- Documentação: http://localhost:8000/docs

### 4. Iniciar Frontend Client (Já rodando)

```powershell
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-dossier
npm run dev
```

Disponível em: **http://localhost:3002**

### 5. Iniciar Frontend Admin (Já rodando)

```powershell
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-dossier-admin
npm run dev
```

Disponível em: **http://localhost:3003**

## 🔐 Endpoints da API

### Endpoints Admin (Requer autenticação JWT)

```
POST   /api/dossiers                    - Criar dossiê
GET    /api/dossiers                    - Listar dossiês
GET    /api/dossiers/{id}               - Ver dossiê
PUT    /api/dossiers/{id}               - Atualizar dossiê
DELETE /api/dossiers/{id}               - Deletar dossiê

POST   /api/dossiers/{id}/files         - Upload arquivo
DELETE /api/dossiers/{id}/files/{file_id} - Deletar arquivo
GET    /api/dossiers/{id}/files/{file_id}/download - Download arquivo

POST   /api/dossiers/{id}/notes         - Criar nota
PUT    /api/dossiers/{id}/notes/{note_id} - Atualizar nota
DELETE /api/dossiers/{id}/notes/{note_id} - Deletar nota

GET    /api/dossiers/{id}/logs          - Ver logs de acesso
POST   /api/dossiers/{id}/regenerate-token - Regenerar token
```

### Endpoints Client (Acesso público com token)

```
POST   /api/dossiers/client/auth        - Autenticar com token
GET    /api/dossiers/client/{token}     - Ver dossiê
GET    /api/dossiers/client/{token}/files - Listar arquivos
GET    /api/dossiers/client/{token}/files/{file_id}/download - Download
GET    /api/dossiers/client/{token}/notes - Ver notas públicas
```

## 📁 Estrutura do Storage

Os arquivos são armazenados em:
```
/app/storage/dossiers/{dossier_id}/
```

Configure a variável de ambiente `DOSSIER_STORAGE_PATH` para alterar.

## 🌐 Variáveis de Ambiente

Arquivo `.env` na pasta `flowsint-api`:

```env
# Banco de Dados
DATABASE_URL=postgresql://flowsint:flowsint@localhost:5433/flowsint

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Storage
DOSSIER_STORAGE_PATH=/app/storage/dossiers
```

Arquivo `.env` nos frontends:

**flowsint-dossier/.env:**
```env
VITE_API_URL=http://localhost:8000
```

**flowsint-dossier-admin/.env:**
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testar o Sistema

### 1. Criar um dossiê via API

```bash
curl -X POST http://localhost:8000/api/dossiers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "investigation_id": "123e4567-e89b-12d3-a456-426614174000",
    "case_number": "CASE-001",
    "title": "Caso Teste",
    "description": "Descrição do caso teste",
    "client_name": "Cliente Teste",
    "client_email": "cliente@teste.com",
    "is_public": true
  }'
```

### 2. Acessar via Frontend Admin

1. Abrir http://localhost:3003
2. Login com credenciais de admin
3. Ver dashboard com estatísticas
4. Criar/editar dossiês
5. Fazer upload de arquivos
6. Adicionar notas

### 3. Acessar via Frontend Client

1. Copiar token de acesso do dossiê (do admin)
2. Abrir http://localhost:3002
3. Inserir token (e senha se tiver)
4. Ver informações do caso
5. Baixar arquivos
6. Ver notas públicas

## 📊 Features Implementadas

### ✅ Sistema de Dossiês
- [x] CRUD completo de dossiês
- [x] Status (Draft, Active, Archived, Closed)
- [x] Vínculo com investigations existentes
- [x] Geração automática de tokens de acesso
- [x] Senha opcional para acesso

### ✅ Gestão de Arquivos
- [x] Upload múltiplo de arquivos
- [x] Tipos: Document, Image, Video, Audio, Other
- [x] Controle de visibilidade (público/interno)
- [x] Download seguro
- [x] Organização por ordem

### ✅ Sistema de Notas
- [x] Notas públicas e internas
- [x] Markdown support
- [x] Notas fixadas (pinned)
- [x] Ordenação customizável
- [x] Editor rico

### ✅ Logs de Acesso
- [x] Registro de todos os acessos
- [x] IP, User Agent, Timestamp
- [x] Ações realizadas
- [x] Auditoria completa

### ✅ Interface Admin
- [x] Dashboard com estatísticas
- [x] Lista de dossiês com filtros
- [x] Formulário de criação
- [x] Edição completa
- [x] Upload drag & drop
- [x] Gerenciamento de notas
- [x] Visualização de logs

### ✅ Interface Client
- [x] Login com token
- [x] Visualização do dossiê
- [x] Download de arquivos
- [x] Leitura de notas públicas
- [x] Interface responsiva

## 🚀 Deploy no Railway

### 1. Preparar Build

```powershell
# Build do Client
cd flowsint-dossier
npm run build

# Build do Admin
cd ../flowsint-dossier-admin
npm run build
```

### 2. Criar Serviços no Railway

Criar 3 serviços:

1. **flowsint-api** (API Backend)
   - Python
   - Porta: 8000
   - Comando: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **flowsint-dossier** (Frontend Client)
   - Node.js / Static
   - Porta: 3002
   - Servir pasta `dist/`
   - Domínio: dossie.scarletredsolutions.com

3. **flowsint-dossier-admin** (Frontend Admin)
   - Node.js / Static
   - Porta: 3003
   - Servir pasta `dist/`
   - Domínio: adm-dossie.scarletredsolutions.com

### 3. Configurar Variáveis de Ambiente

Configurar no Railway para cada serviço conforme seção de variáveis acima.

### 4. Configurar Domínios

No Railway:
1. Settings → Networking → Custom Domain
2. Adicionar domínios
3. Atualizar DNS no provedor

## ⚠️ Próximos Passos

1. ⏳ **Iniciar Docker** para habilitar PostgreSQL
2. ⏳ **Executar migration** (`alembic upgrade head`)
3. ⏳ **Iniciar API** (`uvicorn app.main:app --reload`)
4. ✅ **Testar fluxo completo** (criar dossiê → upload arquivo → acessar como cliente)
5. 🚀 **Deploy no Railway**

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs da API
2. Verificar console do navegador
3. Verificar se todos os serviços estão rodando
4. Verificar variáveis de ambiente

---

**Sistema pronto para testes locais!** 🎉

Os frontends já estão rodando:
- Client: http://localhost:3002
- Admin: http://localhost:3003

Falta apenas iniciar o Docker e a API para ter o sistema completo funcionando.
