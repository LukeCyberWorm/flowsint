# Quick Start - Sistema de Dossiê

## 🚀 Como Rodar Localmente

### 1. Backend (API)

```bash
# Terminal 1
cd flowsint-api

# Executar migração do banco
alembic upgrade head

# Iniciar API
uvicorn app.main:app --reload
```

API disponível em: http://localhost:8000
Documentação: http://localhost:8000/docs

### 2. Frontend Cliente

```bash
# Terminal 2
cd flowsint-dossier

# Instalar dependências (primeira vez)
npm install

# Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3002

### 3. Frontend Admin

```bash
# Terminal 3
cd flowsint-dossier-admin

# Instalar dependências (primeira vez)
npm install

# Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3003

## ✅ Checklist

- [ ] PostgreSQL rodando
- [ ] Variáveis de ambiente configuradas em `.env`
- [ ] Migração executada: `alembic upgrade head`
- [ ] API respondendo: http://localhost:8000/health
- [ ] Frontend cliente rodando: http://localhost:3002
- [ ] Frontend admin rodando: http://localhost:3003

## 🧪 Teste Rápido

```bash
# Testar API
python test_dossier_api.py
```

## 🐛 Problemas Comuns

### Erro de conexão com banco
```bash
# Verificar DATABASE_URL no .env
# Formato: postgresql://user:password@host:port/database
```

### Erro de migração
```bash
cd flowsint-api
alembic stamp head  # Marca como atualizado
alembic upgrade head  # Executa migrações
```

### Porta em uso
```bash
# Mudar porta no vite.config.ts
server: {
  port: 3004  # Nova porta
}
```

## 📖 Mais Informações

- **Documentação Completa**: `DOSSIER_README.md`
- **Guia de Deploy**: `DOSSIER_DEPLOY.md`
- **Resumo do Sistema**: `DOSSIER_SUMMARY.md`
