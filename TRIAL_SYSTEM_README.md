# Atualização: Sistema de Trial de 5 Dias

## O que foi implementado?

1. **Modelo de dados atualizado**:
   - Adicionado `created_at` ao perfil do usuário
   - Adicionado `trial_ends_at` para controlar data de expiração do trial
   - Adicionado `is_paid` para identificar usuários com licença paga

2. **Regras de negócio**:
   - Todos os novos usuários recebem 5 dias de trial automaticamente
   - Usuário `lucas.oliveira@scarletredsolutions.com` tem acesso permanente (is_paid=true)
   - Usuários existentes receberão 5 dias de trial a partir da data da migration
   - Após 5 dias, usuários sem licença paga são bloqueados no login

3. **Mensagem de bloqueio profissional**:
   - Quando o trial expira, o usuário vê uma mensagem clara e profissional
   - A mensagem inclui contato direto: contato@scarletredsolutions.com
   - Link para o site da empresa para mais informações

## Como aplicar a atualização?

### Passo 1: Conectar ao servidor VPS

```bash
ssh root@31.97.83.205
```

### Passo 2: Navegar até o diretório do projeto

```bash
cd /caminho/do/projeto/flowsint
```

### Passo 3: Parar os containers

```bash
docker-compose -f docker-compose.prod.yml down
```

### Passo 4: Fazer pull das atualizações (se estiver usando Git)

```bash
git pull origin main
```

**OU** fazer upload manual dos arquivos atualizados:
- `flowsint-core/src/flowsint_core/core/models.py`
- `flowsint-api/app/api/routes/auth.py`
- `flowsint-api/alembic/versions/add_trial_period_to_profile.py`

### Passo 5: Rebuild da API

```bash
docker-compose -f docker-compose.prod.yml build api
```

### Passo 6: Iniciar os containers

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Passo 7: Rodar a migration do banco de dados

```bash
docker exec -it flowsint-api-prod alembic upgrade head
```

### Passo 8: Verificar que a migration foi aplicada

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "\d profiles"
```

Você deve ver as novas colunas:
- `created_at`
- `trial_ends_at`
- `is_paid`

### Passo 9: Verificar usuários e suas datas de expiração

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles ORDER BY created_at DESC;"
```

### Passo 10: Fazer deploy do frontend atualizado

No seu computador local (Windows):

```powershell
cd C:\Users\Platzeck\Desktop\flowsint\flowsint-app
npm run build
scp -r dist\* root@31.97.83.205:/var/www/rsl/
ssh root@31.97.83.205 'chown -R www-data:www-data /var/www/rsl/ && chmod -R 755 /var/www/rsl/ && systemctl reload nginx'
```

## Testando o sistema

### Teste 1: Criar novo usuário
1. Acesse https://rsl.scarletredsolutions.com/register
2. Cadastre um novo usuário com email de teste
3. Verifique no banco que o usuário tem `trial_ends_at` = hoje + 5 dias

### Teste 2: Login com usuário admin
1. Faça login com `lucas.oliveira@scarletredsolutions.com`
2. Deve funcionar normalmente (sem bloqueio)

### Teste 3: Simular trial expirado (opcional)
Para testar a mensagem de bloqueio sem esperar 5 dias:

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = 'teste@exemplo.com';"
```

Tente fazer login com esse usuário - deve aparecer a mensagem de trial expirado.

## Gerenciamento de licenças

### Conceder acesso pago a um usuário

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = true, trial_ends_at = NULL WHERE email = 'cliente@empresa.com';"
```

### Estender o período de trial

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE email = 'cliente@empresa.com';"
```

### Revogar acesso pago

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "UPDATE profiles SET is_paid = false, trial_ends_at = NOW() + INTERVAL '5 days' WHERE email = 'cliente@empresa.com';"
```

### Listar todos os usuários com trial expirado

```bash
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, trial_ends_at, is_paid FROM profiles WHERE is_paid = false AND trial_ends_at < NOW() ORDER BY trial_ends_at DESC;"
```

## Próximos passos sugeridos

1. **Gateway de pagamento**: Integrar Stripe, Mercado Pago ou outro gateway no endpoint `/register`
2. **Painel de administração**: Criar página para gerenciar usuários e licenças
3. **Notificações por email**: Avisar usuários 1 dia antes do trial expirar
4. **Métricas**: Dashboard com conversão de trial para pago

## Rollback (reverter alterações)

Se algo der errado, você pode reverter a migration:

```bash
docker exec -it flowsint-api-prod alembic downgrade -1
```

Isso removerá as colunas adicionadas e voltará ao estado anterior.
