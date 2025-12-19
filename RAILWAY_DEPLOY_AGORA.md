# 🚀 DEPLOY NO RAILWAY - PASSO A PASSO VISUAL

## ✅ Código já está no GitHub!
Commit: `8fab1ecc`  
Branch: `main`

---

## 📍 PASSO 1: Acessar Railway

1. Abra: https://railway.app
2. Faça login
3. Vá para o dashboard do projeto **flowsint**

---

## 📦 PASSO 2: Criar Serviço Frontend Client

### A) Criar Novo Serviço

1. No projeto flowsint, clique em **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: **LukeCyberWorm/flowsint**
4. Clique em **"Add Service"**

### B) Configurar Build

Na aba **Settings** do novo serviço:

**Service Name:**
```
dossier-client
```

**Root Directory:**
```
flowsint-dossier
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npx serve -s dist -l $PORT
```

**Watch Paths:**
```
flowsint-dossier/**
```

### C) Adicionar Variáveis de Ambiente

Na aba **Variables**, adicione:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### D) Configurar Domínio

1. Vá para **Settings → Networking**
2. Clique em **"Custom Domain"**
3. Digite: `dossie.scarletredsolutions.com`
4. Railway vai gerar um CNAME (ex: `abc123.up.railway.app`)
5. **COPIE esse CNAME!**

### E) Atualizar Cloudflare

1. Vá para Cloudflare → DNS → Registros
2. Encontre o registro **dossie** (tipo A)
3. Clique em **"Editar"**
4. Mude:
   - **Tipo**: A → **CNAME**
   - **Conteúdo**: 31.97.83.205 → **[CNAME do Railway]**
   - **Proxy**: ✅ Ativado (laranja)
5. Salve

---

## 📦 PASSO 3: Criar Serviço Frontend Admin

### A) Criar Novo Serviço

1. No projeto flowsint, clique em **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: **LukeCyberWorm/flowsint**
4. Clique em **"Add Service"**

### B) Configurar Build

Na aba **Settings** do novo serviço:

**Service Name:**
```
dossier-admin
```

**Root Directory:**
```
flowsint-dossier-admin
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npx serve -s dist -l $PORT
```

**Watch Paths:**
```
flowsint-dossier-admin/**
```

### C) Adicionar Variáveis de Ambiente

Na aba **Variables**, adicione:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### D) Configurar Domínio

1. Vá para **Settings → Networking**
2. Clique em **"Custom Domain"**
3. Digite: `adm-dossie.scarletredsolutions.com`
4. Railway vai gerar um CNAME (ex: `xyz789.up.railway.app`)
5. **COPIE esse CNAME!**

### E) Atualizar Cloudflare

1. Vá para Cloudflare → DNS → Registros
2. Encontre o registro **adm-dossie** (tipo A)
3. Clique em **"Editar"**
4. Mude:
   - **Tipo**: A → **CNAME**
   - **Conteúdo**: 31.97.83.205 → **[CNAME do Railway]**
   - **Proxy**: ✅ Ativado (laranja)
5. Salve

---

## 🔧 PASSO 4: Atualizar API (Executar Migration)

### A) Encontrar o Serviço da API

No Railway, procure pelo serviço **flowsint-api** (já deve existir)

### B) Conectar ao Database

1. Clique no serviço da API
2. Vá para **Settings → Variables**
3. Verifique se `DATABASE_URL` está configurada

### C) Executar Migration

**Opção 1: Via Railway CLI**
```bash
# Instalar Railway CLI (se ainda não tem)
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Executar migration
railway run --service flowsint-api alembic upgrade head
```

**Opção 2: Via Terminal Local**
```bash
# Conectar ao banco do Railway
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-api
$env:DATABASE_URL = "[COPIAR_DO_RAILWAY]"
alembic upgrade head
```

**Opção 3: Adicionar no Start Command**

No serviço da API, editar Start Command para:
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## ⏱️ PASSO 5: Aguardar Deploy

### Monitorar Build

Para cada serviço (dossier-client e dossier-admin):

1. Vá para aba **Deployments**
2. Clique no deploy mais recente
3. Observe os logs em tempo real
4. Aguarde status: ✅ **SUCCESS**

### Tempo Estimado
- Build Client: ~2-3 minutos
- Build Admin: ~2-3 minutos
- DNS Propagação: ~5-30 minutos

---

## 🧪 PASSO 6: Testar

### A) Testar DNS
```powershell
nslookup dossie.scarletredsolutions.com
nslookup adm-dossie.scarletredsolutions.com
```

### B) Testar Endpoints da API
```powershell
# Ver documentação
curl https://api.scarletredsolutions.com/docs

# Procurar por /api/dossiers nos endpoints listados
```

### C) Testar Frontends

**Client:**
1. Abrir: https://dossie.scarletredsolutions.com
2. Deve aparecer tela de login com campo de token
3. Verificar se carrega sem erros no console (F12)

**Admin:**
1. Abrir: https://adm-dossie.scarletredsolutions.com
2. Deve aparecer tela de login de admin
3. Verificar console (F12)

### D) Testar Fluxo Completo

1. Login no admin com suas credenciais
2. Criar um dossiê de teste
3. Fazer upload de um arquivo
4. Copiar token de acesso
5. Abrir o client
6. Colar token
7. Verificar se vê as informações
8. Testar download do arquivo

---

## 🐛 Troubleshooting

### Erro "Cannot GET /" ou 404 nas rotas

**Causa:** Configuração SPA incorreta  
**Solução:** Verificar se arquivo `_redirects` existe em `public/`

### Erro "Failed to load resource" ou CORS

**Causa:** VITE_API_URL incorreto  
**Solução:** 
1. Verificar variável no Railway
2. Fazer redeploy: Settings → Redeploy

### Domínio não carrega

**Causa:** DNS não propagou  
**Solução:**
1. Aguardar 5-30 minutos
2. Limpar cache DNS: `ipconfig /flushdns`
3. Testar em navegador anônimo

### Build falha

**Causa:** Dependências ou comando incorreto  
**Solução:**
1. Ver logs no Railway
2. Verificar package.json tem script "build"
3. Verificar Node version compatibility

### API não tem endpoints de dossiê

**Causa:** Migration não executada  
**Solução:**
1. Executar: `railway run alembic upgrade head`
2. Ou adicionar no Start Command da API

---

## 📊 Checklist Final

- [ ] Serviço dossier-client criado no Railway
- [ ] Serviço dossier-admin criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios customizados adicionados
- [ ] CNAMEs atualizados no Cloudflare
- [ ] Aguardou propagação DNS (5-30 min)
- [ ] Migration executada no banco
- [ ] Testou acesso aos domínios
- [ ] Testou login admin
- [ ] Criou dossiê de teste
- [ ] Testou acesso como cliente
- [ ] Verificou upload/download de arquivos
- [ ] Sem erros no console do navegador

---

## ✅ Deploy Concluído!

Após completar todos os passos:

**URLs Funcionais:**
- 🔵 Client: https://dossie.scarletredsolutions.com
- 🟣 Admin: https://adm-dossie.scarletredsolutions.com
- 🔴 API: https://api.scarletredsolutions.com

**Sistema 100% operacional!** 🎉

---

## 📞 Comandos Úteis

```bash
# Ver logs em tempo real
railway logs --service dossier-client
railway logs --service dossier-admin

# Restart serviço
railway restart --service dossier-client

# Abrir Railway no navegador
railway open

# Status dos serviços
railway status
```

---

**Precisa de ajuda?** Consulte os logs no Railway ou verifique o console do navegador (F12).
