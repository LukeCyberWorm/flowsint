# 🚀 Guia Rápido de Deploy - Sistema de Dossiê

## ✅ Checklist de Deploy

### 1. Preparação do Banco de Dados

```bash
# 1. Conectar ao PostgreSQL do Railway
psql $DATABASE_URL

# 2. Executar migração
cd flowsint-api
alembic upgrade head
```

### 2. Deploy da API

**No Railway:**
1. Criar novo serviço "flowsint-api"
2. Conectar ao repositório GitHub
3. Configurar variáveis:
   ```
   DATABASE_URL=postgresql://...
   NEO4J_URI_BOLT=bolt://...
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=...
   DOSSIER_STORAGE_PATH=/app/storage/dossiers
   ```
4. Adicionar domínio: `api.scarletredsolutions.com`
5. Deploy automático

### 3. Deploy Frontend Cliente (dossie.scarletredsolutions.com)

**Criar arquivo `.env` em `flowsint-dossier/`:**
```env
VITE_API_URL=https://api.scarletredsolutions.com
```

**No Railway:**
1. Criar serviço "flowsint-dossier"
2. Usar Dockerfile
3. Configurar variável: `VITE_API_URL=https://api.scarletredsolutions.com`
4. Adicionar domínio: `dossie.scarletredsolutions.com`
5. Deploy

### 4. Deploy Frontend Admin (adm-dossie.scarletredsolutions.com)

**Criar arquivo `.env` em `flowsint-dossier-admin/`:**
```env
VITE_API_URL=https://api.scarletredsolutions.com
```

**No Railway:**
1. Criar serviço "flowsint-dossier-admin"
2. Usar Dockerfile
3. Configurar variável: `VITE_API_URL=https://api.scarletredsolutions.com`
4. Adicionar domínio: `adm-dossie.scarletredsolutions.com`
5. Deploy

## 🔧 Configuração DNS

No provedor de DNS (ex: Cloudflare):

```
Tipo    Nome        Destino                           Proxy
CNAME   api         railway.app                       ✓
CNAME   dossie      railway.app                       ✓
CNAME   adm-dossie  railway.app                       ✓
```

## 📋 Teste de Funcionamento

### 1. Testar API
```bash
curl https://api.scarletredsolutions.com/health
# Resposta esperada: {"status":"ok"}
```

### 2. Criar Dossiê de Teste

1. Acesse `https://adm-dossie.scarletredsolutions.com`
2. Login com credenciais admin
3. Criar novo dossiê
4. Adicionar arquivos e notas
5. Tornar público

### 3. Testar Acesso do Cliente

1. Copiar token do dossiê
2. Acessar `https://dossie.scarletredsolutions.com`
3. Inserir token
4. Verificar visualização

## 🚨 Troubleshooting

### Erro de CORS
Verificar em `flowsint-api/app/main.py`:
```python
origins = ["*"]  # ou especificar domínios
```

### Erro de Conexão com Banco
1. Verificar `DATABASE_URL` no Railway
2. Executar migração: `alembic upgrade head`

### Frontend não carrega
1. Verificar `VITE_API_URL`
2. Rebuild do container
3. Checar logs no Railway

### Upload de arquivos falha
1. Verificar `DOSSIER_STORAGE_PATH`
2. Criar diretório: `mkdir -p /app/storage/dossiers`
3. Permissões corretas

## 📊 Monitoramento

### Logs da API
```bash
railway logs -s flowsint-api
```

### Logs Frontend Cliente
```bash
railway logs -s flowsint-dossier
```

### Logs Frontend Admin
```bash
railway logs -s flowsint-dossier-admin
```

## 🔄 Atualização

### Atualizar API
```bash
cd flowsint-api
git pull
railway up
```

### Atualizar Frontends
```bash
cd flowsint-dossier
git pull
railway up

cd ../flowsint-dossier-admin
git pull
railway up
```

## 📞 Contato

Se precisar de ajuda:
- Email: contato@scarletredsolutions.com
- GitHub Issues: [repositório]

---

✅ Sistema pronto para uso!
