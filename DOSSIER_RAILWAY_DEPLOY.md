# 🚀 Deploy Sistema de Dossiê no Railway - Guia Rápido

## ✅ Status Atual

- ✅ DNS configurado no Cloudflare:
  - `dossie.scarletredsolutions.com` → 31.97.83.205
  - `adm-dossie.scarletredsolutions.com` → 31.97.83.205
- ✅ SSL/TLS: Flexível (Cloudflare)
- ✅ Frontends rodando localmente (portas 3002 e 3003)
- ✅ Código completo e testado

## 📦 O que será deployado

1. **API Backend** (flowsint-api) → já deployado em `api.scarletredsolutions.com`
2. **Frontend Client** (flowsint-dossier) → `dossie.scarletredsolutions.com`
3. **Frontend Admin** (flowsint-dossier-admin) → `adm-dossie.scarletredsolutions.com`

## 🎯 Passos de Deploy

### Opção 1: Deploy via GitHub + Railway (Recomendado)

#### 1. Preparar Repositório

```bash
# Commit das mudanças
git add .
git commit -m "Sistema de dossiê completo - pronto para deploy"
git push origin main
```

#### 2. No Railway Dashboard

**A) Criar Serviço para Frontend Client**

1. New Project → Deploy from GitHub repo
2. Selecionar repositório `flowsint`
3. Configurações:
   - **Root Directory**: `flowsint-dossier`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://api.scarletredsolutions.com
     ```

4. Settings → Networking → Custom Domain:
   - Adicionar: `dossie.scarletredsolutions.com`
   - Railway fornecerá um CNAME (ex: `abc123.up.railway.app`)

5. No Cloudflare, editar o registro `dossie`:
   - Tipo: CNAME
   - Nome: dossie
   - Conteúdo: `abc123.up.railway.app` (o que o Railway forneceu)
   - Proxy: ✅ Ativado (laranja)

**B) Criar Serviço para Frontend Admin**

1. New Service → Deploy from GitHub repo
2. Configurações:
   - **Root Directory**: `flowsint-dossier-admin`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://api.scarletredsolutions.com
     ```

3. Settings → Networking → Custom Domain:
   - Adicionar: `adm-dossie.scarletredsolutions.com`
   - Railway fornecerá CNAME

4. No Cloudflare, editar o registro `adm-dossie`:
   - Tipo: CNAME
   - Nome: adm-dossie
   - Conteúdo: `xyz789.up.railway.app` (fornecido pelo Railway)
   - Proxy: ✅ Ativado

**C) Atualizar API Backend (se necessário)**

Na API já deployada (`api.scarletredsolutions.com`), verificar se tem as rotas do dossiê:

1. Verificar logs: deve aparecer "dossiers" nos endpoints
2. Testar: `https://api.scarletredsolutions.com/docs`
3. Procurar por endpoints `/api/dossiers`

Se não aparecer, fazer redeploy da API:
```bash
# Railway detecta mudanças e faz redeploy automaticamente
git push origin main
```

#### 3. Executar Migration do Banco de Dados

**No Railway, no serviço da API:**

1. Settings → Variables → Add Variable:
   ```
   RUN_MIGRATIONS=true
   ```

2. Ou conectar via Railway CLI e executar:
   ```bash
   railway run alembic upgrade head
   ```

Ou via terminal local conectando no banco do Railway:
```bash
# Pegar DATABASE_URL do Railway
cd flowsint-api
alembic upgrade head
```

### Opção 2: Deploy Manual (Build Local)

Se preferir fazer build localmente e subir os arquivos:

#### 1. Build dos Frontends

```powershell
# Build Client
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-dossier
npm run build
# Resultado em: dist/

# Build Admin
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-dossier-admin
npm run build
# Resultado em: dist/
```

#### 2. Deploy no Railway

No Railway, criar serviços "Static Site":
- Upload da pasta `dist/` de cada frontend
- Configurar domínios customizados

## 🔍 Verificação Pós-Deploy

### 1. Testar DNS

```powershell
# Verificar resolução DNS
nslookup dossie.scarletredsolutions.com
nslookup adm-dossie.scarletredsolutions.com

# Deve retornar IPs do Cloudflare (proxy ativado)
```

### 2. Testar Endpoints

```powershell
# Testar API
curl https://api.scarletredsolutions.com/docs

# Verificar se endpoints de dossiê aparecem
# Procurar por: /api/dossiers
```

### 3. Testar Frontends

Abrir no navegador:
- https://dossie.scarletredsolutions.com → Deve mostrar tela de login
- https://adm-dossie.scarletredsolutions.com → Deve mostrar tela de login admin

### 4. Testar Fluxo Completo

1. Acessar admin: https://adm-dossie.scarletredsolutions.com
2. Fazer login com credenciais de admin
3. Criar um dossiê de teste
4. Copiar token de acesso
5. Acessar client: https://dossie.scarletredsolutions.com
6. Colar token e acessar
7. Verificar se informações aparecem

## 🐛 Troubleshooting

### "Não é possível acessar o site"

1. Aguardar propagação DNS (5-30 min)
2. Limpar cache DNS local:
   ```powershell
   ipconfig /flushdns
   ```
3. Testar em modo anônimo do navegador

### "Mixed Content" ou "CORS Error"

1. Verificar se `VITE_API_URL` está com HTTPS
2. Verificar configuração SSL no Cloudflare
3. Verificar logs do Railway

### "404 Not Found" ao acessar rotas

1. Adicionar configuração de SPA no Railway
2. Criar arquivo `_redirects` na pasta `public/` dos frontends:
   ```
   /*    /index.html   200
   ```

### API não responde aos endpoints de dossiê

1. Verificar logs do Railway
2. Executar migration: `alembic upgrade head`
3. Verificar se código foi deployado:
   ```bash
   git log --oneline -n 5
   git push origin main
   ```

## 📊 Checklist Final

- [ ] Código commitado no GitHub
- [ ] Serviço Client criado no Railway
- [ ] Serviço Admin criado no Railway
- [ ] Domínios customizados adicionados no Railway
- [ ] DNS atualizado no Cloudflare com CNAMEs
- [ ] Aguardar propagação DNS (5-30 min)
- [ ] Migration executada no banco
- [ ] Testar acesso aos frontends
- [ ] Testar criação de dossiê
- [ ] Testar acesso como cliente
- [ ] Testar upload de arquivo
- [ ] Testar download de arquivo
- [ ] Verificar logs de acesso

## 🎯 Comandos Úteis Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver projetos
railway list

# Conectar ao projeto
railway link

# Ver logs
railway logs

# Executar comando no ambiente Railway
railway run alembic upgrade head

# Abrir no navegador
railway open
```

## 📝 Próximos Passos Após Deploy

1. Criar dossiê de demonstração
2. Adicionar arquivos de exemplo
3. Testar com clientes reais
4. Monitorar logs e performance
5. Configurar backups do banco de dados
6. Adicionar analytics (opcional)

## 🔐 Segurança

- ✅ SSL/TLS via Cloudflare
- ✅ Tokens seguros de 32 bytes
- ✅ Senhas hashadas SHA256
- ✅ Logs de auditoria
- ✅ CORS configurado
- ⚠️ Revisar permissões de arquivos
- ⚠️ Limitar tamanho de uploads (ajustar se necessário)

## 📞 Suporte

**Logs importantes para debug:**
- Railway: Dashboard → Service → Deployments → Logs
- Cloudflare: Analytics → Traffic
- Browser: DevTools → Console (F12)

---

**Sistema pronto para produção!** 🚀

Domínios configurados:
- 🔵 Client: https://dossie.scarletredsolutions.com
- 🟣 Admin: https://adm-dossie.scarletredsolutions.com
- 🔴 API: https://api.scarletredsolutions.com
