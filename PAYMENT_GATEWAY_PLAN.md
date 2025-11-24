# 💳 Plano de Implementação: Gateway de Pagamento

## 📋 Visão Geral

Este documento descreve o plano para integrar um gateway de pagamento ao RSL-Scarlet, permitindo que usuários convertam automaticamente de trial para licença paga.

## 🎯 Objetivos

1. Permitir pagamento direto na plataforma
2. Ativação automática de licenças após pagamento confirmado
3. Gestão de assinaturas recorrentes (mensal/anual)
4. Histórico de pagamentos e faturas
5. Cancelamento e reembolso via painel

## 🏦 Opções de Gateway

### Opção 1: Mercado Pago (Recomendado para Brasil)
**Vantagens**:
- ✅ Popular no Brasil
- ✅ Aceita PIX, boleto, cartão
- ✅ Taxas competitivas (4.99% + R$0.49 por transação)
- ✅ SDKs bem documentados
- ✅ Sandbox para testes

**Desvantagens**:
- ❌ Menos conhecido internacionalmente
- ❌ Interface menos moderna que Stripe

### Opção 2: Stripe
**Vantagens**:
- ✅ Líder mundial
- ✅ Excelente documentação
- ✅ UI/UX impecável
- ✅ Suporte a múltiplas moedas
- ✅ Webhooks robustos

**Desvantagens**:
- ❌ Taxas mais altas no Brasil (4.99% + R$0.49)
- ❌ Configuração mais complexa no Brasil

### Opção 3: PagSeguro
**Vantagens**:
- ✅ Brasileiro (UOL)
- ✅ Aceita boleto, PIX, cartão
- ✅ Checkout transparente

**Desvantagens**:
- ❌ API menos moderna
- ❌ Documentação inferior

### Recomendação Final: **Mercado Pago**
Para o mercado brasileiro, com foco em PMEs e profissionais autônomos.

---

## 📦 Planos de Licenciamento Sugeridos

### 🏃 Plano Individual
- **Preço**: R$ 197/mês ou R$ 1.970/ano (2 meses grátis)
- **Usuários**: 1
- **Investigações**: Ilimitadas
- **Suporte**: Email (48h)
- **Ideal para**: Profissionais autônomos, detetives particulares

### 💼 Plano Profissional
- **Preço**: R$ 497/mês ou R$ 4.970/ano
- **Usuários**: 5
- **Investigações**: Ilimitadas
- **Suporte**: Email e chat (24h)
- **Extras**: Treinamento de 2h, consultoria mensal
- **Ideal para**: Pequenas equipes, escritórios de advocacia

### 🏢 Plano Empresarial
- **Preço**: R$ 1.497/mês ou R$ 14.970/ano
- **Usuários**: 20
- **Investigações**: Ilimitadas
- **Suporte**: Prioritário (4h), SLA 99.5%
- **Extras**: Treinamento completo, consultoria semanal, instância dedicada
- **Ideal para**: Corporações, órgãos públicos

### 🚀 Plano Customizado
- **Preço**: Sob consulta
- **Usuários**: Ilimitados
- **Features**: Personalizadas
- **Suporte**: Dedicado
- **Extras**: Desenvolvimento de transforms exclusivos
- **Ideal para**: Grandes organizações, integrações complexas

---

## 🏗️ Arquitetura da Implementação

### 1. Banco de Dados - Novas Tabelas

#### Tabela: `subscriptions`
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- 'individual', 'professional', 'enterprise', 'custom'
    status VARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
    payment_gateway VARCHAR(20), -- 'mercadopago', 'stripe', 'manual'
    external_subscription_id VARCHAR(255), -- ID no gateway
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `payments`
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected', 'refunded'
    payment_method VARCHAR(50), -- 'credit_card', 'pix', 'boleto'
    external_payment_id VARCHAR(255), -- ID no gateway
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `invoices`
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'draft', 'paid', 'overdue', 'canceled'
    due_date TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Backend - Novos Endpoints

#### `/api/plans` - Listar Planos
```python
@router.get("/plans")
def list_plans():
    return [
        {
            "id": "individual",
            "name": "Individual",
            "price_monthly": 197.00,
            "price_yearly": 1970.00,
            "features": ["1 usuário", "Investigações ilimitadas", "Suporte email"]
        },
        # ... outros planos
    ]
```

#### `/api/subscriptions` - Criar Assinatura
```python
@router.post("/subscriptions")
def create_subscription(
    plan_type: str,
    payment_method: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # 1. Criar preferência no Mercado Pago
    preference = mp.create_preference({
        "items": [{"title": f"RSL-Scarlet {plan_type}", "quantity": 1, "unit_price": price}],
        "back_urls": {
            "success": "https://rsl.scarletredsolutions.com/payment/success",
            "failure": "https://rsl.scarletredsolutions.com/payment/failure"
        },
        "notification_url": "https://rsl.scarletredsolutions.com/api/webhooks/mercadopago"
    })
    
    # 2. Criar registro no banco
    subscription = Subscription(
        profile_id=current_user.id,
        plan_type=plan_type,
        status="pending",
        external_subscription_id=preference["id"]
    )
    db.add(subscription)
    db.commit()
    
    return {"checkout_url": preference["init_point"]}
```

#### `/api/webhooks/mercadopago` - Webhook
```python
@router.post("/webhooks/mercadopago")
def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    if data["type"] == "payment":
        payment_id = data["data"]["id"]
        payment_info = mp.get_payment(payment_id)
        
        if payment_info["status"] == "approved":
            # Atualizar assinatura
            subscription = db.query(Subscription).filter(
                Subscription.external_subscription_id == payment_info["external_reference"]
            ).first()
            
            subscription.status = "active"
            subscription.current_period_start = datetime.now()
            subscription.current_period_end = datetime.now() + timedelta(days=30)
            
            # Ativar usuário
            profile = subscription.profile
            profile.is_paid = True
            profile.trial_ends_at = None
            
            db.commit()
            
            # Enviar email de confirmação
            send_email(profile.email, "Pagamento confirmado - RSL-Scarlet")
    
    return {"status": "ok"}
```

### 3. Frontend - Novas Páginas

#### `/pricing` - Página de Planos
```tsx
// src/routes/pricing.tsx
export function Pricing() {
  const plans = [
    { id: 'individual', name: 'Individual', price: 197, ... },
    { id: 'professional', name: 'Profissional', price: 497, ... },
    // ...
  ]
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {plans.map(plan => (
        <PlanCard 
          key={plan.id}
          plan={plan}
          onSelect={() => handleSelectPlan(plan.id)}
        />
      ))}
    </div>
  )
}
```

#### `/payment/checkout` - Checkout
```tsx
// src/routes/payment/checkout.tsx
export function Checkout() {
  const [loading, setLoading] = useState(false)
  const { plan } = useParams()
  
  const handlePayment = async (paymentMethod: string) => {
    setLoading(true)
    const response = await api.post('/api/subscriptions', {
      plan_type: plan,
      payment_method: paymentMethod
    })
    
    // Redirecionar para checkout do Mercado Pago
    window.location.href = response.data.checkout_url
  }
  
  return (
    <div>
      <h1>Finalizar Assinatura</h1>
      <PlanSummary plan={plan} />
      <PaymentMethodSelector onSelect={handlePayment} />
    </div>
  )
}
```

#### `/dashboard/billing` - Gerenciar Assinatura
```tsx
// src/routes/_auth.dashboard.billing.tsx
export function Billing() {
  const { subscription, invoices } = useSubscription()
  
  return (
    <div>
      <SubscriptionCard subscription={subscription} />
      <InvoiceHistory invoices={invoices} />
      <PaymentMethod />
      <CancelSubscription />
    </div>
  )
}
```

---

## 🔐 Segurança

### Checklist de Segurança
- [ ] Validar todos os webhooks com assinatura HMAC
- [ ] Nunca armazenar dados de cartão no backend
- [ ] Usar HTTPS em todos os endpoints
- [ ] Validar valores no backend (não confiar no frontend)
- [ ] Implementar rate limiting em endpoints de pagamento
- [ ] Logs detalhados de todas as transações
- [ ] Testes de penetração antes do lançamento

---

## 📧 Notificações por Email

### Emails a Implementar
1. **Trial iniciado**: "Bem-vindo! Você tem 5 dias de trial"
2. **Trial em 3 dias**: "Seu trial expira em 3 dias"
3. **Trial em 1 dia**: "Último dia de trial - Garanta seu acesso"
4. **Trial expirado**: "Seu trial expirou - Escolha um plano"
5. **Pagamento confirmado**: "Pagamento aprovado - Acesso liberado"
6. **Pagamento rejeitado**: "Problema no pagamento - Tente novamente"
7. **Renovação em 7 dias**: "Sua assinatura renova em 7 dias"
8. **Pagamento de renovação aprovado**: "Assinatura renovada com sucesso"
9. **Assinatura cancelada**: "Sua assinatura foi cancelada"

### Serviços de Email
- **SendGrid**: $15/mês para 40k emails
- **Amazon SES**: $0.10 por 1.000 emails
- **Mailgun**: $35/mês para 50k emails

**Recomendação**: Amazon SES (custo-benefício)

---

## 📊 Métricas e Analytics

### Dashboards a Criar
1. **Conversão de Trial**:
   - Taxa de conversão trial → pago
   - Tempo médio de conversão
   - Motivos de não conversão

2. **Churn (Cancelamento)**:
   - Taxa de churn mensal
   - Principais motivos de cancelamento
   - Lifetime value (LTV) por plano

3. **Receita**:
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - Receita por plano
   - Crescimento mês a mês

4. **Pagamentos**:
   - Taxa de aprovação de pagamentos
   - Métodos de pagamento mais usados
   - Valor médio por transação

---

## 🗓️ Cronograma de Implementação

### Fase 1: Fundação (2 semanas)
- [ ] Criar tabelas no banco de dados
- [ ] Implementar modelos SQLAlchemy
- [ ] Criar migrations
- [ ] Configurar conta Mercado Pago
- [ ] Implementar autenticação de webhooks

### Fase 2: Backend (2 semanas)
- [ ] Endpoint de listagem de planos
- [ ] Endpoint de criação de assinatura
- [ ] Processamento de webhooks
- [ ] Ativação automática de licenças
- [ ] Testes unitários e integração

### Fase 3: Frontend (2 semanas)
- [ ] Página de pricing
- [ ] Fluxo de checkout
- [ ] Página de gerenciamento de assinatura
- [ ] Histórico de pagamentos e faturas
- [ ] Badge "TRIAL" no dashboard

### Fase 4: Notificações (1 semana)
- [ ] Configurar Amazon SES
- [ ] Templates de email
- [ ] Agendamento de emails (Celery)
- [ ] Testes de entrega

### Fase 5: Testes e Lançamento (1 semana)
- [ ] Testes end-to-end
- [ ] Testes de segurança
- [ ] Documentação
- [ ] Deploy em staging
- [ ] Deploy em produção
- [ ] Monitoramento

**Total**: ~8 semanas (2 meses)

---

## 💰 Estimativa de Custos

### Custos Mensais (Estimativa)
- Mercado Pago: 4.99% por transação + R$0.49
- Amazon SES: ~R$10/mês (para 10k emails)
- Monitoramento (Sentry): $26/mês
- **Total variável**: Depende do volume

### Exemplo de Receita vs Custo
**Cenário: 50 assinantes pagantes**
- Receita: 30 Individual (R$197) + 15 Profissional (R$497) + 5 Empresarial (R$1.497) = R$21.375
- Custo Mercado Pago (4.99%): R$1.067
- Outros custos: R$50
- **Lucro líquido**: ~R$20.258/mês

---

## 📚 Recursos e Documentação

### Mercado Pago
- Documentação: https://www.mercadopago.com.br/developers
- SDK Python: https://github.com/mercadopago/sdk-python
- Sandbox: https://www.mercadopago.com.br/developers/panel/app

### Stripe (alternativa)
- Documentação: https://stripe.com/docs
- SDK Python: https://github.com/stripe/stripe-python

### Compliance
- LGPD: Armazenamento de dados de pagamento
- PCI-DSS: Segurança de cartões (gateway cuida disso)
- Nota Fiscal: Integração com Focus NFe ou NFe.io

---

## ✅ Próximos Passos Imediatos

1. **Aprovar este plano** e priorização
2. **Criar conta** no Mercado Pago (modo sandbox)
3. **Definir valores finais** dos planos
4. **Iniciar desenvolvimento** - Fase 1

---

**Desenvolvido por**: Scarlet Red Solutions LTDA  
**Contato**: contato@scarletredsolutions.com  
**Data**: Novembro 2025
