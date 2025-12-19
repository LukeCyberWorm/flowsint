# Sistema de Dossiê de Casos - Scarlet Red Solutions

Sistema completo para apresentação de dossiês de casos aos clientes, com painel administrativo e interface de visualização pública.

## 📋 Funcionalidades

### Para Clientes (dossie.scarletredsolutions.com)
- ✅ Login com token de acesso
- ✅ Visualização de informações do caso
- ✅ Download de arquivos e documentos
- ✅ Leitura de notas e anotações
- ✅ Interface limpa e responsiva
- 🔄 Chat com IA (planejado)

### Para Administradores (adm-dossie.scarletredsolutions.com)
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de dossiês
- ✅ Upload de arquivos (imagens, documentos, vídeos)
- ✅ Sistema de notas (internas e públicas)
- ✅ Geração automática de token de acesso
- ✅ Controle de visibilidade
- ✅ Log de acessos

## 🏗️ Arquitetura

```
flowsint/
├── flowsint-api/              # Backend API (FastAPI)
│   ├── app/
│   │   ├── models/dossier.py  # Modelos SQLAlchemy
│   │   ├── api/
│   │   │   ├── routes/dossier.py
│   │   │   └── schemas/dossier.py
│   │   └── main.py
│   └── alembic/versions/       # Migrações do banco
│
├── flowsint-dossier/           # Frontend Cliente
│   ├── src/
│   │   ├── pages/
│   │   ├── api/
│   │   └── components/
│   └── Dockerfile
│
└── flowsint-dossier-admin/     # Frontend Admin
    ├── src/
    │   ├── pages/
    │   ├── api/
    │   └── components/
    └── Dockerfile
```

## 🚀 Deploy no Railway

### Pré-requisitos
- Conta no Railway
- PostgreSQL configurado
- Domínios configurados no Railway:
  - `api.scarletredsolutions.com` → API
  - `dossie.scarletredsolutions.com` → Frontend Cliente
  - `adm-dossie.scarletredsolutions.com` → Frontend Admin

### Passo 1: Deploy da API

```bash
cd flowsint-api

# Criar migration do banco de dados
alembic upgrade head

# Deploy no Railway (configurar variáveis de ambiente)
railway up
```

**Variáveis de Ambiente da API:**
```env
NEO4J_URI_BOLT=bolt://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...
DATABASE_URL=postgresql://...
DOSSIER_STORAGE_PATH=/app/storage/dossiers
```

### Passo 2: Deploy Frontend Cliente

```bash
cd flowsint-dossier

# Build da imagem Docker
docker build -t flowsint-dossier .

# Deploy no Railway
railway up
```

**Variáveis de Ambiente:**
```env
VITE_API_URL=https://api.scarletredsolutions.com
```

### Passo 3: Deploy Frontend Admin

```bash
cd flowsint-dossier-admin

# Build da imagem Docker
docker build -t flowsint-dossier-admin .

# Deploy no Railway
railway up
```

**Variáveis de Ambiente:**
```env
VITE_API_URL=https://api.scarletredsolutions.com
```

### Passo 4: Configurar Domínios no Railway

No painel do Railway:

1. **API Service**
   - Settings → Domains
   - Adicionar: `api.scarletredsolutions.com`

2. **Dossier Service**
   - Settings → Domains
   - Adicionar: `dossie.scarletredsolutions.com`

3. **Dossier Admin Service**
   - Settings → Domains
   - Adicionar: `adm-dossie.scarletredsolutions.com`

## 📊 Banco de Dados

### Modelos Criados

- **dossiers**: Dossiê principal
- **dossier_files**: Arquivos anexados
- **dossier_notes**: Anotações
- **dossier_ia_chats**: Histórico de chat com IA
- **dossier_access_logs**: Logs de acesso

### Executar Migração

```bash
cd flowsint-api
alembic upgrade head
```

## 🔐 Segurança

- ✅ Autenticação JWT para admins
- ✅ Token único por dossiê para clientes
- ✅ Senha opcional para proteção adicional
- ✅ Logs de acesso
- ✅ Controle de visibilidade de arquivos

## 📱 Uso

### Como Admin

1. Acesse `https://adm-dossie.scarletredsolutions.com`
2. Faça login com suas credenciais RSL-Scarlet
3. Crie um novo dossiê vinculado a uma investigação
4. Adicione arquivos, notas e informações
5. Torne público e copie o link de acesso
6. Envie o link ao cliente

### Como Cliente

1. Receba o link do dossiê
2. Acesse `https://dossie.scarletredsolutions.com/dossier/TOKEN`
3. Insira senha se solicitado
4. Visualize informações, arquivos e notas do caso

## 🛠️ Desenvolvimento Local

### Backend

```bash
cd flowsint-api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Cliente

```bash
cd flowsint-dossier
npm install
npm run dev
```

### Frontend Admin

```bash
cd flowsint-dossier-admin
npm install
npm run dev
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/token` - Login

### Dossiês (Admin)
- `GET /api/dossiers/` - Listar dossiês
- `POST /api/dossiers/` - Criar dossiê
- `GET /api/dossiers/{id}` - Obter dossiê
- `PUT /api/dossiers/{id}` - Atualizar dossiê
- `DELETE /api/dossiers/{id}` - Deletar dossiê

### Arquivos
- `POST /api/dossiers/{id}/files` - Upload arquivo
- `GET /api/dossiers/{id}/files` - Listar arquivos
- `GET /api/dossiers/{id}/files/{file_id}/download` - Download
- `DELETE /api/dossiers/{id}/files/{file_id}` - Deletar arquivo

### Notas
- `POST /api/dossiers/{id}/notes` - Criar nota
- `GET /api/dossiers/{id}/notes` - Listar notas
- `PUT /api/dossiers/{id}/notes/{note_id}` - Atualizar nota
- `DELETE /api/dossiers/{id}/notes/{note_id}` - Deletar nota

### Acesso Cliente
- `POST /api/dossiers/client/access` - Validar acesso
- `GET /api/dossiers/client/{token}/files` - Listar arquivos
- `GET /api/dossiers/client/{token}/notes` - Listar notas

## 🔮 Próximas Funcionalidades

- [ ] Assistente de IA integrado ao Scarlet IA
- [ ] Versionamento de arquivos
- [ ] Comentários do cliente
- [ ] Notificações por email
- [ ] Timeline do caso
- [ ] Export para PDF
- [ ] Assinatura digital

## 📄 Licença

Propriedade de Scarlet Red Solutions © 2025

## 📞 Suporte

- Email: contato@scarletredsolutions.com
- Website: https://scarletredsolutions.com
