# 🔒 Sistema de Trial - RSL-Scarlet

## ✅ IMPLEMENTADO COM SUCESSO

Sistema completo de trial de 5 dias com bloqueio automático após expiração.

---

## 🚀 Começar Agora

### 1. Deploy do Backend (5 minutos)
```powershell
cd C:\Users\Platzeck\Desktop\flowsint
.\deploy-trial-system.ps1
```

### 2. Testar
- Criar novo usuário → deve ter 5 dias de trial
- Login normal → deve funcionar
- Simular expiração → deve bloquear

### 3. Gerenciar Licenças
```bash
# Conceder acesso pago
python manage_licenses.py grant cliente@empresa.com

# Estender trial
python manage_licenses.py extend cliente@empresa.com 30

# Ver usuários
python manage_licenses.py list
```

---

## 📚 Documentação

**Índice completo**: [TRIAL_SYSTEM_INDEX.md](TRIAL_SYSTEM_INDEX.md)

**Documentos principais**:
- [NEXT_STEPS.md](NEXT_STEPS.md) - Próximos passos detalhados
- [QUICK_COMMANDS.md](QUICK_COMMANDS.md) - Comandos do dia a dia
- [SYSTEM_FLOW_DIAGRAM.md](SYSTEM_FLOW_DIAGRAM.md) - Fluxos visuais

---

## 🎯 Como Funciona

1. **Novo usuário** → 5 dias de trial automático
2. **Admin** (lucas.oliveira@) → Acesso permanente
3. **Trial expirado** → Bloqueio com mensagem profissional
4. **Cliente paga** → Libera acesso via comando

**Mensagem de bloqueio**:
> "Seu período de avaliação expirou. Para continuar utilizando o RSL-Scarlet, entre em contato conosco para contratar uma licença ou consultoria de implantação. Email: contato@scarletredsolutions.com"

---

## 📞 Contato

**Email**: contato@scarletredsolutions.com  
**Website**: https://scarletredsolutions.com  
**CNPJ**: 57.238.225/0001-06

---

## 📊 Status

- ✅ Frontend: DEPLOYADO
- ⏳ Backend: PENDENTE
- ✅ Documentação: COMPLETA
- ✅ Scripts: PRONTOS

**Próximo passo**: Deploy do backend (veja [NEXT_STEPS.md](NEXT_STEPS.md))
