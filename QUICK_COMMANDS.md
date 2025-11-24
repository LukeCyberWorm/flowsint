# ⚡ Comandos Rápidos - Sistema de Trial

## 🚀 Deploy Completo
```powershell
# Windows (PowerShell)
cd C:\Users\Platzeck\Desktop\flowsint
.\deploy-trial-system.ps1
```

## 🔍 Verificações Rápidas

### Ver todos os usuários e status
```bash
ssh root@31.97.83.205
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at, CASE WHEN is_paid THEN '✓ PAGO' WHEN trial_ends_at < NOW() THEN '✗ EXPIRADO' ELSE '⏳ TRIAL' END as status FROM profiles ORDER BY created_at DESC;"
```

### Ver apenas trials expirados
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, trial_ends_at FROM profiles WHERE is_paid = false AND trial_ends_at < NOW();"
```

### Contar usuários por status
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT CASE WHEN is_paid THEN 'Pagos' WHEN trial_ends_at < NOW() THEN 'Expirados' ELSE 'Trial Ativo' END as status, COUNT(*) FROM profiles GROUP BY status;"
```

## 💰 Gerenciar Licenças

### Conceder acesso pago permanente
```bash
# Via script Python (no servidor)
python /root/flowsint/scripts/manage_licenses.py grant cliente@empresa.com

# Via SQL direto
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = true, trial_ends_at = NULL WHERE email = 'cliente@empresa.com';"
```

### Estender trial por 30 dias
```bash
# Via script Python
python /root/flowsint/scripts/manage_licenses.py extend cliente@empresa.com 30

# Via SQL direto
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE email = 'cliente@empresa.com';"
```

### Revogar acesso pago e voltar para trial
```bash
# Via script Python (5 dias de trial padrão)
python /root/flowsint/scripts/manage_licenses.py revoke cliente@empresa.com

# Com dias personalizados
python /root/flowsint/scripts/manage_licenses.py revoke cliente@empresa.com 10

# Via SQL direto
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = false, trial_ends_at = NOW() + INTERVAL '10 days' WHERE email = 'cliente@empresa.com';"
```

## 🧪 Testes

### Simular trial expirado (para testes)
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = 'teste@teste.com';"
```

### Resetar trial de um usuário (mais 5 dias)
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() + INTERVAL '5 days' WHERE email = 'teste@teste.com';"
```

### Ver informações detalhadas de um usuário
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT * FROM profiles WHERE email = 'cliente@empresa.com';"
```

## 🔧 Manutenção

### Ver logs da API
```bash
docker logs flowsint-api-prod --tail 100 -f
```

### Reiniciar apenas a API
```bash
cd /root/flowsint
docker-compose -f docker-compose.prod.yml restart api
```

### Aplicar migration manualmente
```bash
docker exec flowsint-api-prod alembic upgrade head
```

### Reverter última migration
```bash
docker exec flowsint-api-prod alembic downgrade -1
```

### Ver histórico de migrations
```bash
docker exec flowsint-api-prod alembic history
```

### Ver migration atual
```bash
docker exec flowsint-api-prod alembic current
```

## 📊 Relatórios

### Usuários cadastrados nos últimos 7 dias
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, created_at FROM profiles WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC;"
```

### Trials que expiram nos próximos 3 dias
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, trial_ends_at FROM profiles WHERE is_paid = false AND trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days';"
```

### Taxa de conversão (exemplo)
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT COUNT(CASE WHEN is_paid THEN 1 END) as pagos, COUNT(CASE WHEN NOT is_paid THEN 1 END) as trial, ROUND(100.0 * COUNT(CASE WHEN is_paid THEN 1 END) / COUNT(*), 2) as taxa_conversao FROM profiles;"
```

## 🚨 Troubleshooting

### Migration não aplicou
```bash
# Verificar status
docker exec flowsint-api-prod alembic current

# Forçar upgrade
docker exec flowsint-api-prod alembic upgrade head

# Se falhar, verificar logs
docker logs flowsint-api-prod --tail 50
```

### Usuário bloqueado indevidamente
```bash
# Verificar status do usuário
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles WHERE email = 'usuario@exemplo.com';"

# Se necessário, estender trial ou conceder acesso pago (ver seção Gerenciar Licenças)
```

### Restaurar acesso do admin
```bash
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = true, trial_ends_at = NULL WHERE email = 'lucas.oliveira@scarletredsolutions.com';"
```

## 💾 Backup

### Backup completo do banco
```bash
docker exec flowsint-postgres-prod pg_dump -U flowsint flowsint > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup apenas da tabela profiles
```bash
docker exec flowsint-postgres-prod pg_dump -U flowsint -t profiles flowsint > backup_profiles_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup
```bash
docker exec -i flowsint-postgres-prod psql -U flowsint flowsint < backup_20251123_120000.sql
```

## 🌐 Frontend

### Rebuild e deploy apenas do frontend
```powershell
# No Windows
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-app
npm run build
scp -r dist\* root@31.97.83.205:/var/www/rsl/
ssh root@31.97.83.205 'chown -R www-data:www-data /var/www/rsl/ && chmod -R 755 /var/www/rsl/ && systemctl reload nginx'
```

### Verificar se frontend está servindo corretamente
```bash
ssh root@31.97.83.205
curl -I https://rsl.scarletredsolutions.com
```

## 📞 Contatos de Emergência

- **Suporte Técnico**: contato@scarletredsolutions.com
- **VPS**: 31.97.83.205 (root)
- **URL Produção**: https://rsl.scarletredsolutions.com

---

💡 **Dica**: Adicione este arquivo aos favoritos para acesso rápido aos comandos mais utilizados!
