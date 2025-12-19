# ✅ Deploy Manual no Railway - 5 Minutos

## 📋 Checklist Rápido

Você vai criar **2 serviços** no seu projeto Railway:
1. ✅ `dossier-client` → dossie.scarletredsolutions.com
2. ✅ `dossier-admin` → adm-dossie.scarletredsolutions.com

---

## 🚀 Passo 1: Criar Serviço Client

1. Acesse: https://railway.app/project/73e89fe9-8940-40e7-8cc8-069f9440c83d
2. Clique **"+ New Service"** → **"GitHub Repo"**
3. Selecione repositório: **LukeCyberWorm/flowsint**
4. Clique no serviço criado → **Settings**

### Configurações do Client:

| Campo | Valor |
|-------|-------|
| **Service Name** | `dossier-client` |
| **Root Directory** | `flowsint-dossier` |
| **Environment** | production |

### Variáveis de Ambiente (Tab "Variables"):

Adicione estas 2 variáveis:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### Domínio Customizado (Tab "Settings" → "Domains"):

Adicione:
```
dossie.scarletredsolutions.com
```

---

## 🚀 Passo 2: Criar Serviço Admin

Repita o processo:

1. **"+ New Service"** → **"GitHub Repo"** → **LukeCyberWorm/flowsint**
2. Settings:

| Campo | Valor |
|-------|-------|
| **Service Name** | `dossier-admin` |
| **Root Directory** | `flowsint-dossier-admin` |
| **Environment** | production |

### Variáveis de Ambiente:

```
VITE_API_URL=https://api.scarletredsolutions.com
NODE_ENV=production
```

### Domínio Customizado:

```
adm-dossie.scarletredsolutions.com
```

---

## 🌐 Passo 3: Atualizar DNS na Cloudflare

Após Railway criar os domínios, você verá algo como:

```
dossie.scarletredsolutions.com → abc123xyz.up.railway.app
adm-dossie.scarletredsolutions.com → def456uvw.up.railway.app
```

### No Cloudflare:

1. Acesse: https://dash.cloudflare.com
2. Domínio: **scarletredsolutions.com**
3. DNS → DNS Records

**Substitua** os registros A por CNAME:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | dossie | `abc123xyz.up.railway.app` | ✅ Proxied |
| CNAME | adm-dossie | `def456uvw.up.railway.app` | ✅ Proxied |

> ⚠️ Use o CNAME que o Railway mostrar (formato: xxx.up.railway.app)

---

## ✨ Pronto!

Depois de 2-5 minutos de build:

✅ Client: https://dossie.scarletredsolutions.com
✅ Admin: https://adm-dossie.scarletredsolutions.com

---

## 🔧 Se algo não funcionar:

### 1. Build falhou?
- Verifique os logs em: **Deployments → View Logs**
- Confirme que **Root Directory** está correto
- Confirme que `serve` está em `package.json` dependencies

### 2. Domínio não carrega?
- Aguarde 5-10 min para propagação DNS
- Teste o domínio Railway direto: `https://xxx.up.railway.app`
- Verifique CNAME no Cloudflare

### 3. Página carrega mas API não funciona?
- Verifique `VITE_API_URL` nas variáveis
- Teste: `https://api.scarletredsolutions.com/health`

---

## 📝 Arquivos Já Configurados

Tudo já está pronto no GitHub:

✅ `flowsint-dossier/nixpacks.toml` - Build config
✅ `flowsint-dossier/package.json` - Dependência "serve"
✅ `flowsint-dossier-admin/nixpacks.toml` - Build config
✅ `flowsint-dossier-admin/package.json` - Dependência "serve"

O Railway vai detectar automaticamente e fazer o build correto! 🎉
