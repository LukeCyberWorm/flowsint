# 🌐 Configuração de Domínios - Sistema de Dossiê

## ⚠️ Problema Identificado

Os domínios originalmente planejados já estão em uso:
- `dossie.scarletredsolutions.com` → Especula Trading API (ativo)
- `adm-dossie.scarletredsolutions.com` → Não configurado

## 🎯 Domínios Alternativos Sugeridos

### Opção A: Subdomínios com prefixo "case"
```
casos.scarletredsolutions.com       → Frontend Client
admin-casos.scarletredsolutions.com → Frontend Admin
api-casos.scarletredsolutions.com   → API Backend
```

### Opção B: Subdomínios com prefixo "dossier"
```
dossier-client.scarletredsolutions.com → Frontend Client
dossier-admin.scarletredsolutions.com  → Frontend Admin
dossier-api.scarletredsolutions.com    → API Backend
```

### Opção C: Subdomínios com prefixo "portal"
```
portal-casos.scarletredsolutions.com      → Frontend Client
portal-admin.scarletredsolutions.com      → Frontend Admin
portal-api.scarletredsolutions.com        → API Backend
```

## 📋 Passos para Configuração

### 1. Escolher Domínios

Decida qual opção de domínios usar e anote:
- Domínio Client: `_____________________`
- Domínio Admin: `_____________________`
- Domínio API: `_____________________`

### 2. Configurar DNS

No seu provedor de DNS (ex: Cloudflare, GoDaddy, etc):

```
Tipo    Nome                    Valor                           TTL
CNAME   casos                   [railway-url-client]           Auto
CNAME   admin-casos             [railway-url-admin]            Auto
CNAME   api-casos               [railway-url-api]              Auto
```

### 3. Atualizar Variáveis de Ambiente

#### Frontend Client (.env)
```env
VITE_API_URL=https://api-casos.scarletredsolutions.com
```

#### Frontend Admin (.env)
```env
VITE_API_URL=https://api-casos.scarletredsolutions.com
```

#### API Backend (.env)
```env
# Adicionar CORS para os novos domínios
CORS_ORIGINS=https://casos.scarletredsolutions.com,https://admin-casos.scarletredsolutions.com
```

### 4. Deploy no Railway

#### Criar 3 Serviços:

**A) flowsint-dossier-client**
```bash
# No Railway:
- Name: flowsint-dossier-client
- Source: flowsint-dossier/
- Build Command: npm install && npm run build
- Start Command: npx serve -s dist -l $PORT
- Environment Variables:
  VITE_API_URL=https://api-casos.scarletredsolutions.com
```

**B) flowsint-dossier-admin**
```bash
# No Railway:
- Name: flowsint-dossier-admin
- Source: flowsint-dossier-admin/
- Build Command: npm install && npm run build
- Start Command: npx serve -s dist -l $PORT
- Environment Variables:
  VITE_API_URL=https://api-casos.scarletredsolutions.com
```

**C) flowsint-api-dossier**
```bash
# No Railway:
- Name: flowsint-api-dossier
- Source: flowsint-api/
- Build Command: pip install -e ../flowsint-types --no-deps && pip install -e ../flowsint-core --no-deps && pip install -e ../flowsint-transforms --no-deps && pip install -r requirements.txt
- Start Command: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Environment Variables:
  DATABASE_URL=[seu-postgresql-url]
  NEO4J_URI=[seu-neo4j-uri]
  NEO4J_USER=neo4j
  NEO4J_PASSWORD=[senha]
  SECRET_KEY=[chave-secreta]
  CORS_ORIGINS=https://casos.scarletredsolutions.com,https://admin-casos.scarletredsolutions.com
  DOSSIER_STORAGE_PATH=/app/storage/dossiers
```

### 5. Adicionar Domínios Customizados no Railway

Para cada serviço:
1. Ir em Settings → Networking
2. Clicar em "Generate Domain" (para ter URL temporária)
3. Clicar em "Custom Domain"
4. Adicionar domínio escolhido
5. Railway fornecerá o CNAME para configurar no DNS

### 6. Testar

```bash
# Testar API
curl https://api-casos.scarletredsolutions.com/health

# Acessar no navegador
https://casos.scarletredsolutions.com
https://admin-casos.scarletredsolutions.com
```

## 🔧 Opção Alternativa: Reconfigurar Domínios Existentes

Se você quiser usar os domínios originais (`dossie` e `adm-dossie`), precisará:

1. **Desativar/mover o Especula Trading API** dos domínios atuais
2. **Reconfigurar DNS** para apontar para o novo sistema
3. **Atualizar configurações** no Railway/servidor atual

⚠️ **Atenção**: Isso afetará o sistema Especula Trading API que está rodando atualmente.

## 📊 Matriz de Decisão

| Critério | Novos Domínios | Reconfigurar Existentes |
|----------|----------------|------------------------|
| Impacto em sistemas existentes | ✅ Nenhum | ❌ Alto - quebra Especula API |
| Tempo de implementação | ✅ Rápido (~30 min) | ⚠️ Médio (~2 horas) |
| Complexidade | ✅ Baixa | ⚠️ Média |
| Risco | ✅ Nenhum | ❌ Alto |
| Reversibilidade | ✅ Fácil | ⚠️ Difícil |

## 🎯 Recomendação

**Use novos subdomínios** (Opção A, B ou C) para:
- Evitar conflitos com sistemas existentes
- Deploy mais rápido e seguro
- Fácil rollback se necessário
- Melhor organização de serviços

## 📝 Checklist de Deploy

- [ ] Escolher domínios
- [ ] Atualizar `.env` dos frontends
- [ ] Atualizar `.env` da API
- [ ] Build dos frontends localmente para testar
- [ ] Criar serviços no Railway
- [ ] Configurar variáveis de ambiente
- [ ] Deploy dos serviços
- [ ] Configurar DNS
- [ ] Adicionar domínios customizados no Railway
- [ ] Aguardar propagação DNS (5-30 minutos)
- [ ] Testar acesso
- [ ] Executar migration do banco
- [ ] Criar primeiro dossiê de teste
- [ ] Testar fluxo completo

## 🆘 Troubleshooting

### DNS não resolve
- Aguardar propagação (até 48h, geralmente 5-30 min)
- Verificar configuração no provedor DNS
- Usar `nslookup seu-dominio.com` para testar

### CORS error
- Verificar `CORS_ORIGINS` na API
- Verificar protocolo (http vs https)
- Checar se domínio está correto

### API não conecta
- Verificar `VITE_API_URL` nos frontends
- Testar API diretamente com curl
- Verificar logs no Railway

---

**Qual opção você prefere?**
- A: casos.scarletredsolutions.com
- B: dossier-client.scarletredsolutions.com
- C: portal-casos.scarletredsolutions.com
- Outra: ____________________
