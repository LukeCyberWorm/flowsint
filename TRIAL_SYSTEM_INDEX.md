# 📚 Índice - Sistema de Trial RSL-Scarlet

## 🎯 Início Rápido

**Status**: ✅ Frontend deployado | ⏳ Backend aguardando deploy

**Próximo passo**: Consulte [NEXT_STEPS.md](NEXT_STEPS.md)

---

## 📖 Documentação Disponível

### 🚀 Para Deploy e Implementação
1. **[NEXT_STEPS.md](NEXT_STEPS.md)** ⭐ **COMECE AQUI**
   - Ações imediatas
   - Guia de deploy passo a passo
   - Testes obrigatórios

2. **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)**
   - Resumo executivo
   - O que foi implementado
   - Checklist de verificação

3. **[TRIAL_SYSTEM_README.md](TRIAL_SYSTEM_README.md)**
   - Guia completo de instalação
   - Instruções detalhadas de deploy
   - Troubleshooting

---

### 🛠️ Para Operação e Gerenciamento
4. **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** ⭐ **MUITO ÚTIL**
   - Comandos rápidos para o dia a dia
   - Gerenciar licenças
   - Verificações de status
   - Backup e manutenção

5. **[scripts/manage_licenses.py](scripts/manage_licenses.py)**
   - Script CLI para gestão de licenças
   - Conceder/revogar acesso
   - Estender trials
   - Listar usuários

---

### 📊 Para Entender o Sistema
6. **[SYSTEM_FLOW_DIAGRAM.md](SYSTEM_FLOW_DIAGRAM.md)**
   - Fluxos visuais do sistema
   - Estados do usuário
   - Matriz de permissões
   - Timeline de exemplo

7. **[TRIAL_IMPLEMENTATION_SUMMARY.md](TRIAL_IMPLEMENTATION_SUMMARY.md)**
   - Detalhes técnicos completos
   - Arquivos modificados
   - Estrutura do banco de dados
   - Lógica implementada

---

### 💳 Para Planejamento Futuro
8. **[PAYMENT_GATEWAY_PLAN.md](PAYMENT_GATEWAY_PLAN.md)**
   - Plano de implementação de gateway de pagamento
   - Comparação de gateways
   - Planos de preços sugeridos
   - Arquitetura detalhada
   - Cronograma de 8 semanas

---

### 🤖 Scripts e Automação
9. **[deploy-trial-system.ps1](deploy-trial-system.ps1)**
   - Script PowerShell de deploy automatizado
   - Build + Upload + Migration + Verificação
   - Para usar: `.\deploy-trial-system.ps1`

---

## 🗂️ Estrutura de Arquivos Modificados

### Backend
```
flowsint-api/
├── app/api/routes/auth.py              ⬅️ Lógica de bloqueio
└── alembic/versions/
    └── add_trial_period_to_profile.py  ⬅️ Migration do banco

flowsint-core/
└── src/flowsint_core/core/
    └── models.py                        ⬅️ Modelo com campos de trial
```

### Frontend
```
flowsint-app/
└── src/routes/
    ├── login.tsx                        ⬅️ Mensagem de trial expirado
    ├── register.tsx                     ⬅️ Banner de trial
    └── _auth.dashboard.docs.tsx         ⬅️ Documentação (já deployado)
```

### Scripts
```
scripts/
└── manage_licenses.py                   ⬅️ CLI para gerenciar licenças
```

---

## 🎯 Casos de Uso Comuns

### Caso 1: Cliente Pagou - Liberar Acesso
```bash
# Conectar ao servidor
ssh root@31.97.83.205

# Conceder acesso pago
python /root/flowsint/scripts/manage_licenses.py grant cliente@empresa.com
```
📖 Detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#conceder-acesso-pago)

---

### Caso 2: Cliente Pediu Extensão de Trial
```bash
# Estender por 30 dias
python /root/flowsint/scripts/manage_licenses.py extend cliente@empresa.com 30
```
📖 Detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#estender-trial)

---

### Caso 3: Ver Todos os Usuários e Status
```bash
# Listar todos
python /root/flowsint/scripts/manage_licenses.py list

# Ver apenas expirados
python /root/flowsint/scripts/manage_licenses.py expired
```
📖 Detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#verificações-rápidas)

---

### Caso 4: Cliente Cancelou - Revogar Acesso
```bash
# Revogar e dar 5 dias de transição
python /root/flowsint/scripts/manage_licenses.py revoke cliente@empresa.com 5
```
📖 Detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#revogar-acesso)

---

### Caso 5: Fazer Deploy de Atualização
```powershell
# No Windows
cd C:\Users\Platzeck\Desktop\flowsint
.\deploy-trial-system.ps1
```
📖 Detalhes: [NEXT_STEPS.md](NEXT_STEPS.md#opção-a-script-automatizado)

---

## 🔍 Troubleshooting

### Problema: Migration não aplicou
```bash
# Verificar status
docker exec flowsint-api-prod alembic current

# Forçar upgrade
docker exec flowsint-api-prod alembic upgrade head
```
📖 Mais detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#migration-não-aplicou)

---

### Problema: Usuário bloqueado indevidamente
```bash
# Verificar status do usuário
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "SELECT email, is_paid, trial_ends_at FROM profiles WHERE email = 'usuario@exemplo.com';"

# Conceder acesso se necessário
python /root/flowsint/scripts/manage_licenses.py grant usuario@exemplo.com
```
📖 Mais detalhes: [QUICK_COMMANDS.md](QUICK_COMMANDS.md#usuário-bloqueado-indevidamente)

---

### Problema: Mensagem de bloqueio não aparece
1. Verificar se frontend foi deployado: `curl -I https://rsl.scarletredsolutions.com`
2. Limpar cache do navegador: Ctrl+Shift+R
3. Verificar console do navegador (F12) para erros

📖 Mais detalhes: [TRIAL_SYSTEM_README.md](TRIAL_SYSTEM_README.md#troubleshooting)

---

## 📞 Informações de Contato

**Empresa**: Scarlet Red Solutions LTDA  
**CNPJ**: 57.238.225/0001-06  
**Email**: contato@scarletredsolutions.com  
**Website**: https://scarletredsolutions.com  
**Produção**: https://rsl.scarletredsolutions.com  
**VPS**: 31.97.83.205 (root)

---

## 🎓 Aprendizado Adicional

### Para entender o fluxo completo
1. Leia [SYSTEM_FLOW_DIAGRAM.md](SYSTEM_FLOW_DIAGRAM.md)
2. Veja os diagramas de estado
3. Entenda a matriz de permissões

### Para planejar o futuro
1. Leia [PAYMENT_GATEWAY_PLAN.md](PAYMENT_GATEWAY_PLAN.md)
2. Avalie os gateways sugeridos
3. Revise o cronograma de 8 semanas

### Para dominar a operação
1. Pratique com [QUICK_COMMANDS.md](QUICK_COMMANDS.md)
2. Crie cenários de teste
3. Familiarize-se com o script Python

---

## ⚡ Atalhos Rápidos

| Ação | Comando |
|------|---------|
| Deploy completo | `.\deploy-trial-system.ps1` |
| Conceder acesso | `python manage_licenses.py grant email` |
| Estender trial | `python manage_licenses.py extend email 30` |
| Ver usuários | `python manage_licenses.py list` |
| Ver expirados | `python manage_licenses.py expired` |
| Logs da API | `docker logs flowsint-api-prod -f` |
| Conectar ao banco | Ver [QUICK_COMMANDS.md](QUICK_COMMANDS.md) |

---

## ✅ Status Atual

- ✅ **Modelo de dados**: Implementado
- ✅ **Lógica de bloqueio**: Implementada
- ✅ **Mensagens profissionais**: Implementadas
- ✅ **Frontend**: Deployado
- ✅ **Scripts de gerenciamento**: Criados
- ✅ **Documentação**: Completa
- ⏳ **Backend**: Aguardando deploy
- ⏳ **Testes em produção**: Pendente

---

## 🚀 Próximo Passo

**👉 Consulte [NEXT_STEPS.md](NEXT_STEPS.md) para começar o deploy do backend!**

---

**Última atualização**: 23 de Novembro de 2025  
**Versão**: 1.0.0
