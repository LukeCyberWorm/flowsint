# 🚀 CONFIGURAÇÃO RAILWAY - GUIA SIMPLIFICADO

## ✅ Código atualizado no GitHub!
Commit: `f9d8d3d7`

---

## 🔧 DELETAR SERVIÇO COM ERRO

Primeiro, delete o serviço "dossie-RSL" que falhou:

1. No Railway, clique no serviço **dossie-RSL**
2. Vá em **Settings** (engrenagem)
3. Role até o final
4. Clique em **Delete Service**
5. Confirme

---

## 📦 CRIAR SERVIÇO 1: Frontend Client

### 1. Criar Serviço
- Clique em **"+ New"** no projeto
- Selecione **"GitHub Repo"**
- Escolha: **LukeCyberWorm/flowsint**
- Clique em **"Deploy"**

### 2. Configurar

Quando o serviço for criado, clique nele e vá em **Settings**:

**Service Name:**
```
flowsint-dossier-client
```

**Root Directory:**
```
flowsint-dossier
```

**Custom Build Command:** (Deixar vazio, usa nixpacks.toml)

**Custom Start Command:** (Deixar vazio, usa nixpacks.toml)

### 3. Variáveis de Ambiente

Clique em **Variables** e adicione:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### 4. Domínio Customizado

Em **Settings → Networking**:
- Clique em **"Custom Domain"**
- Digite: `dossie.scarletredsolutions.com`
- Railway mostrará um CNAME (ex: `abc123.up.railway.app`)
- **COPIE ESSE CNAME!**

### 5. Atualizar Cloudflare

1. Cloudflare → DNS → Registros
2. Edite o registro **dossie**
3. Mude:
   - **Tipo**: A → **CNAME**
   - **Conteúdo**: 31.97.83.205 → `[CNAME do Railway]`
   - **Proxy**: ✅ Ativado
4. Salve

### 6. Deploy

O serviço deve começar a fazer deploy automaticamente. Aguarde até ver **"SUCCESS"** nos logs.

---

## 📦 CRIAR SERVIÇO 2: Frontend Admin

### 1. Criar Serviço
- Clique em **"+ New"** no projeto
- Selecione **"GitHub Repo"**
- Escolha: **LukeCyberWorm/flowsint**
- Clique em **"Deploy"**

### 2. Configurar

Quando o serviço for criado, clique nele e vá em **Settings**:

**Service Name:**
```
flowsint-dossier-admin
```

**Root Directory:**
```
flowsint-dossier-admin
```

**Custom Build Command:** (Deixar vazio)

**Custom Start Command:** (Deixar vazio)

### 3. Variáveis de Ambiente

Clique em **Variables** e adicione:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### 4. Domínio Customizado

Em **Settings → Networking**:
- Clique em **"Custom Domain"**
- Digite: `adm-dossie.scarletredsolutions.com`
- Railway mostrará um CNAME (ex: `xyz789.up.railway.app`)
- **COPIE ESSE CNAME!**

### 5. Atualizar Cloudflare

1. Cloudflare → DNS → Registros
2. Edite o registro **adm-dossie**
3. Mude:
   - **Tipo**: A → **CNAME**
   - **Conteúdo**: 31.97.83.205 → `[CNAME do Railway]`
   - **Proxy**: ✅ Ativado
4. Salve

### 6. Deploy

Aguarde deploy completar.

---

## 🗄️ CONFIGURAR API (Executar Migration)

### Encontre o serviço da API existente no Railway

Procure por um serviço chamado **flowsint-api** ou similar.

### Opção A: Redeploy com Migration

1. Clique no serviço da API
2. Settings → Deploy
3. Em **"Custom Start Command"**, mude para:
   ```
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Clique em **"Redeploy"**

### Opção B: Executar via terminal local

```powershell
# Pegar DATABASE_URL do Railway
# (Settings → Variables → copiar DATABASE_URL)

cd C:\Users\Platzeck\Desktop\flowsint\flowsint-api
$env:DATABASE_URL="[COLAR_DATABASE_URL_AQUI]"
alembic upgrade head
```

---

## ✅ VERIFICAR DEPLOY

### 1. Aguardar DNS (5-30 minutos)

```powershell
nslookup dossie.scarletredsolutions.com
nslookup adm-dossie.scarletredsolutions.com
```

### 2. Testar Domínios

- Client: https://dossie.scarletredsolutions.com
- Admin: https://adm-dossie.scarletredsolutions.com

### 3. Verificar Console (F12)

Abrir DevTools e verificar se não há erros.

---

## 🎯 CHECKLIST

- [ ] Deletou serviço "dossie-RSL" com erro
- [ ] Criou serviço "flowsint-dossier-client"
- [ ] Configurou Root Directory: flowsint-dossier
- [ ] Adicionou variáveis de ambiente (VITE_API_URL)
- [ ] Configurou domínio: dossie.scarletredsolutions.com
- [ ] Copiou CNAME do Railway
- [ ] Atualizou DNS no Cloudflare
- [ ] Criou serviço "flowsint-dossier-admin"
- [ ] Configurou Root Directory: flowsint-dossier-admin
- [ ] Adicionou variáveis de ambiente
- [ ] Configurou domínio: adm-dossie.scarletredsolutions.com
- [ ] Atualizou DNS no Cloudflare
- [ ] Executou migration (alembic upgrade head)
- [ ] Aguardou propagação DNS
- [ ] Testou acesso aos domínios
- [ ] Verificou sem erros no console

---

## 🆘 TROUBLESHOOTING

**Build falha com "Error creating build plan":**
- Os arquivos `nixpacks.toml` agora estão no repositório
- Faça um novo deploy

**"Cannot GET /" ou rotas 404:**
- Arquivo `_redirects` está configurado
- Verificar se build foi bem sucedido

**CORS Error:**
- Verificar VITE_API_URL nas variáveis
- Deve ser https://api.scarletredsolutions.com

**DNS não resolve:**
- Aguardar 5-30 minutos
- Limpar cache: `ipconfig /flushdns`
- Testar em navegador anônimo

---

✨ **Após completar, o sistema estará 100% online!** 🎉
