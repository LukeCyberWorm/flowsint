# 🔒 Sistema de Trial e Licenciamento RSL-Scarlet

## ✅ Implementações Concluídas

### 1. **Backend - Modelo de Dados**
**Arquivo**: `flowsint-core/src/flowsint_core/core/models.py`
- ✅ Adicionado campo `created_at` (data de criação da conta)
- ✅ Adicionado campo `trial_ends_at` (data de expiração do trial)
- ✅ Adicionado campo `is_paid` (indica se o usuário tem licença paga)

### 2. **Backend - Lógica de Autenticação**
**Arquivo**: `flowsint-api/app/api/routes/auth.py`

#### Login (`POST /api/auth/token`)
- ✅ Verifica se o trial do usuário expirou
- ✅ Bloqueia acesso de usuários com trial expirado
- ✅ Exceção: `lucas.oliveira@scarletredsolutions.com` sempre tem acesso
- ✅ Retorna mensagem profissional com contato comercial

**Mensagem de bloqueio**:
> "Seu período de avaliação expirou. Para continuar utilizando o RSL-Scarlet, entre em contato conosco para contratar uma licença ou consultoria de implantação. Email: contato@scarletredsolutions.com"

#### Registro (`POST /api/auth/register`)
- ✅ Novos usuários recebem automaticamente 5 dias de trial
- ✅ Usuário admin (`lucas.oliveira@scarletredsolutions.com`) recebe `is_paid=true` automaticamente
- ✅ Retorna informações sobre o trial no response

### 3. **Frontend - Página de Login**
**Arquivo**: `flowsint-app/src/routes/login.tsx`
- ✅ Exibe mensagem estilizada quando trial expira
- ✅ Diferencia erro de autenticação de trial expirado
- ✅ Inclui link para o site da empresa
- ✅ Design profissional com ícones e formatação adequada

### 4. **Frontend - Página de Registro**
**Arquivo**: `flowsint-app/src/routes/register.tsx`
- ✅ Banner informativo sobre os 5 dias de trial gratuito
- ✅ Mensagem clara sobre necessidade de licença após trial
- ✅ Design atraente com cor azul para informação positiva

### 5. **Migration do Banco de Dados**
**Arquivo**: `flowsint-api/alembic/versions/add_trial_period_to_profile.py`
- ✅ Script de migration para adicionar as novas colunas
- ✅ Atualiza usuários existentes com trial de 5 dias
- ✅ Define `lucas.oliveira@scarletredsolutions.com` como pago automaticamente
- ✅ Inclui script de rollback (downgrade)

### 6. **Documentação**
**Arquivo**: `TRIAL_SYSTEM_README.md`
- ✅ Instruções completas de deploy
- ✅ Comandos SQL para gerenciar licenças
- ✅ Guia de testes
- ✅ Troubleshooting

### 7. **Scripts de Automação**

#### PowerShell Deploy Script
**Arquivo**: `deploy-trial-system.ps1`
- ✅ Deploy automatizado do sistema completo
- ✅ Build do frontend
- ✅ Upload de arquivos atualizados
- ✅ Rebuild do backend
- ✅ Aplicação da migration
- ✅ Deploy do frontend
- ✅ Verificação final

#### Python License Manager
**Arquivo**: `scripts/manage_licenses.py`
- ✅ Conceder acesso pago: `python manage_licenses.py grant email@exemplo.com`
- ✅ Revogar acesso: `python manage_licenses.py revoke email@exemplo.com [dias]`
- ✅ Estender trial: `python manage_licenses.py extend email@exemplo.com 30`
- ✅ Listar usuários: `python manage_licenses.py list`
- ✅ Listar expirados: `python manage_licenses.py expired`

## 🎯 Regras de Negócio Implementadas

1. **Trial de 5 dias para novos usuários**
   - Automático no registro
   - Contador inicia imediatamente
   - Sem necessidade de cartão de crédito

2. **Acesso permanente do admin**
   - Email: `lucas.oliveira@scarletredsolutions.com`
   - Nunca expira
   - Flag `is_paid=true`

3. **Bloqueio após expiração**
   - Verifica no login
   - Mensagem profissional e direta
   - Inclui contato comercial

4. **Usuários existentes**
   - Recebem 5 dias a partir da data da migration
   - Tratamento especial para admin

## 📦 Próximos Passos (Sugeridos)

### Gateway de Pagamento
- [ ] Integrar Stripe ou Mercado Pago
- [ ] Criar planos de preços (Mensal, Anual, Empresarial)
- [ ] Webhook para ativação automática após pagamento
- [ ] Painel de gerenciamento de assinaturas

### Notificações
- [ ] Email 3 dias antes do trial expirar
- [ ] Email 1 dia antes do trial expirar
- [ ] Email no dia da expiração
- [ ] Configurar SMTP (SendGrid, Amazon SES, etc)

### Painel Administrativo
- [ ] Dashboard de usuários e licenças
- [ ] Métricas de conversão (trial → pago)
- [ ] Gestão de renovações
- [ ] Relatórios financeiros

### Melhorias de UX
- [ ] Mostrar dias restantes no dashboard
- [ ] Badge "TRIAL" no header quando aplicável
- [ ] Página de pricing/planos
- [ ] FAQ sobre licenciamento

## 🚀 Como Aplicar o Deploy

### Opção 1: Script Automatizado (Recomendado)
```powershell
cd C:\Users\Platzeck\Desktop\flowsint
.\deploy-trial-system.ps1
```

### Opção 2: Deploy Manual
Siga as instruções detalhadas em `TRIAL_SYSTEM_README.md`

## 🧪 Como Testar

### Teste 1: Novo Registro
1. Acesse https://rsl.scarletredsolutions.com/register
2. Crie uma conta de teste
3. Verifique no banco que `trial_ends_at = hoje + 5 dias`

### Teste 2: Login Admin
1. Faça login com `lucas.oliveira@scarletredsolutions.com`
2. Deve entrar normalmente (sem bloqueio)

### Teste 3: Trial Expirado (Simulação)
```bash
# Conectar ao VPS
ssh root@31.97.83.205

# Expirar o trial de um usuário de teste
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = 'teste@teste.com';"
```

Tente fazer login com esse usuário - deve aparecer a mensagem de trial expirado.

## 📊 Gerenciamento de Licenças

### Via Script Python (Recomendado)
```bash
# Conceder acesso pago
python scripts/manage_licenses.py grant cliente@empresa.com

# Estender trial
python scripts/manage_licenses.py extend cliente@empresa.com 30

# Listar todos os usuários
python scripts/manage_licenses.py list

# Listar expirados
python scripts/manage_licenses.py expired
```

### Via SQL Direto
```bash
# Conceder acesso pago
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = true, trial_ends_at = NULL WHERE email = 'cliente@empresa.com';"

# Verificar usuários
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles ORDER BY created_at DESC;"
```

## ⚠️ Observações Importantes

1. **Backup antes do deploy**: Sempre faça backup do banco antes de aplicar migrations
2. **Downtime**: O deploy requer restart dos containers (~30 segundos de downtime)
3. **Email do admin**: Está hardcoded como `lucas.oliveira@scarletredsolutions.com`
4. **Limite de usuários**: Ainda mantém o limite de 30 usuários no registro

## 📞 Suporte

Para dúvidas sobre a implementação:
- Email: contato@scarletredsolutions.com
- Documentação: `TRIAL_SYSTEM_README.md`

---

**Desenvolvido por**: Scarlet Red Solutions LTDA  
**CNPJ**: 57.238.225/0001-06  
**Data**: Novembro 2025
