# 🚀 PRÓXIMOS PASSOS - Sistema de Trial

## ⚡ AÇÃO IMEDIATA (Hoje)

### 1. Deploy do Backend no Servidor ⏳

Você tem duas opções:

#### Opção A: Script Automatizado (Recomendado) ⭐
```powershell
# No seu Windows, execute:
cd C:\Users\Platzeck\Desktop\flowsint
.\deploy-trial-system.ps1
```

**O script irá:**
- ✅ Build do frontend
- ✅ Upload de arquivos para o servidor
- ✅ Rebuild do container da API
- ✅ Aplicar migration do banco
- ✅ Deploy do frontend
- ✅ Verificação final

**Tempo estimado**: ~5 minutos

---

#### Opção B: Manual (Passo a Passo)

**1. Conectar ao servidor**
```bash
ssh root@31.97.83.205
```

**2. Fazer upload dos arquivos modificados**

No Windows (abra novo terminal):
```powershell
cd C:\Users\Platzeck\Desktop\flowsint

# Upload do modelo
scp flowsint-core/src/flowsint_core/core/models.py root@31.97.83.205:/root/flowsint/flowsint-core/src/flowsint_core/core/

# Upload da rota de auth
scp flowsint-api/app/api/routes/auth.py root@31.97.83.205:/root/flowsint/flowsint-api/app/api/routes/

# Upload da migration
scp flowsint-api/alembic/versions/add_trial_period_to_profile.py root@31.97.83.205:/root/flowsint/flowsint-api/alembic/versions/

# Upload do script de gerenciamento
scp scripts/manage_licenses.py root@31.97.83.205:/root/flowsint/scripts/
```

**3. No servidor, reconstruir API**
```bash
cd /root/flowsint
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build api
docker-compose -f docker-compose.prod.yml up -d
```

**4. Aguardar API inicializar**
```bash
sleep 10
docker logs flowsint-api-prod --tail 20
```

**5. Aplicar migration**
```bash
docker exec flowsint-api-prod alembic upgrade head
```

**6. Verificar schema**
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "\d profiles"
```

Deve mostrar as novas colunas:
- `created_at`
- `trial_ends_at`
- `is_paid`

**7. Verificar usuários**
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles ORDER BY created_at DESC;"
```

**Tempo estimado**: ~10-15 minutos

---

## 🧪 AÇÃO IMEDIATA (Logo Após Deploy)

### 2. Testar o Sistema

#### Teste 1: Registro de Novo Usuário
```bash
# No navegador:
# 1. Acesse https://rsl.scarletredsolutions.com/register
# 2. Cadastre: teste_trial@teste.com
# 3. Observe o banner "5 dias de avaliação gratuita"
# 4. Complete o registro

# No servidor, verificar:
ssh root@31.97.83.205
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles WHERE email = 'teste_trial@teste.com';"

# Deve mostrar:
# - is_paid = false
# - trial_ends_at = data atual + 5 dias
```

#### Teste 2: Login Normal (Trial Ativo)
```bash
# No navegador:
# 1. Faça login com teste_trial@teste.com
# 2. Deve entrar normalmente no dashboard
```

#### Teste 3: Login do Admin
```bash
# No navegador:
# 1. Faça login com lucas.oliveira@scarletredsolutions.com
# 2. Deve entrar normalmente (sem bloqueio)

# No servidor, verificar:
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles WHERE email = 'lucas.oliveira@scarletredsolutions.com';"

# Deve mostrar:
# - is_paid = true
# - trial_ends_at = NULL (sem expiração)
```

#### Teste 4: Simular Trial Expirado
```bash
# No servidor:
ssh root@31.97.83.205

# Expirar o trial do usuário de teste
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = 'teste_trial@teste.com';"

# No navegador:
# 1. Tente fazer login com teste_trial@teste.com
# 2. Deve aparecer a mensagem:
#    "⏰ Período de Avaliação Encerrado"
#    "Seu período de avaliação expirou. Para continuar
#     utilizando o RSL-Scarlet, entre em contato conosco
#     para contratar uma licença ou consultoria de
#     implantação. Email: contato@scarletredsolutions.com"
# 3. Verificar que o link para scarletredsolutions.com está funcionando
```

#### Teste 5: Conceder Acesso Pago
```bash
# No servidor:
ssh root@31.97.83.205
cd /root/flowsint

# Conceder acesso ao usuário de teste
python scripts/manage_licenses.py grant teste_trial@teste.com

# No navegador:
# 1. Tente fazer login com teste_trial@teste.com
# 2. Agora deve entrar normalmente
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Após completar os testes, marque cada item:

- [ ] Migration aplicada com sucesso
- [ ] Colunas novas apareceram na tabela `profiles`
- [ ] Novos usuários recebem trial de 5 dias
- [ ] Admin (lucas.oliveira@) tem `is_paid=true`
- [ ] Login com trial ativo funciona
- [ ] Login com trial expirado mostra mensagem
- [ ] Mensagem de bloqueio está profissional e clara
- [ ] Link para scarletredsolutions.com funciona
- [ ] Script `manage_licenses.py` funciona
- [ ] Conceder acesso pago libera o usuário

---

## 📊 PRÓXIMOS DIAS (Opcional)

### 3. Monitorar Comportamento
```bash
# Ver logs da API em tempo real
ssh root@31.97.83.205
docker logs flowsint-api-prod -f

# Listar todos os usuários e status
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "
SELECT 
  email, 
  is_paid,
  trial_ends_at,
  CASE 
    WHEN is_paid THEN '✓ PAGO'
    WHEN trial_ends_at > NOW() THEN '⏳ TRIAL'
    ELSE '✗ EXPIRADO'
  END as status
FROM profiles 
ORDER BY created_at DESC;
"
```

### 4. Criar Backups Regulares
```bash
# Backup diário do banco
ssh root@31.97.83.205

# Criar script de backup
cat > /root/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec flowsint-postgres-prod pg_dump -U flowsint flowsint > /root/backups/flowsint_$DATE.sql
find /root/backups -name "flowsint_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup_db.sh
mkdir -p /root/backups

# Adicionar ao cron (backup diário às 3h)
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup_db.sh") | crontab -
```

---

## 🎯 PRÓXIMAS SEMANAS

### 5. Implementar Notificações por Email
- [ ] Configurar Amazon SES ou SendGrid
- [ ] Criar templates de email
- [ ] Email: Trial em 3 dias
- [ ] Email: Trial em 1 dia
- [ ] Email: Trial expirado

**Estimativa**: 1-2 dias de desenvolvimento

### 6. Gateway de Pagamento
Consulte `PAYMENT_GATEWAY_PLAN.md` para plano completo.

**Estimativa**: 6-8 semanas

---

## 📞 Suporte

### Precisa de Ajuda?

**Documentação disponível**:
- `IMPLEMENTATION_COMPLETE.md` - Resumo executivo
- `TRIAL_SYSTEM_README.md` - Guia completo
- `QUICK_COMMANDS.md` - Comandos rápidos
- `SYSTEM_FLOW_DIAGRAM.md` - Fluxos visuais
- `PAYMENT_GATEWAY_PLAN.md` - Próximos passos

**Contato**:
- Email: contato@scarletredsolutions.com
- Website: https://scarletredsolutions.com

---

## ✅ RESUMO: O QUE FAZER AGORA

1. **⚡ AGORA**: Executar deploy do backend
   - Usar script `deploy-trial-system.ps1` OU
   - Seguir passos manuais acima

2. **🧪 LOGO DEPOIS**: Executar todos os 5 testes
   - Garantir que tudo funciona corretamente

3. **📊 PRÓXIMOS DIAS**: Monitorar comportamento
   - Verificar logs
   - Observar conversões
   - Ajustar se necessário

4. **🚀 FUTURO**: Implementar melhorias
   - Emails de notificação
   - Gateway de pagamento
   - Dashboard de métricas

---

**Status Atual**: ✅ Frontend deployado | ⏳ Backend aguardando deploy  
**Próximo Passo**: Executar deploy do backend  
**Data**: 23 de Novembro de 2025
