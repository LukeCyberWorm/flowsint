# 🔌 Work Consultoria - Documentação Completa de APIs

## 📍 Base URL
```
https://api.workconsultoria.com/api/v1/
```

---

## 🔐 Autenticação

### Sistema: **Devise Token Auth** (Ruby on Rails)

Todas as requisições à API devem incluir estes 5 headers de autenticação:

```http
access-token: AH_0gMrfF3Us-D__pLdfAA
client: tr2TUHr37D3qGNFTOZDYqg
expiry: 1766520379
token-type: Bearer
uid: lukecyberworm
```

**📌 Observações Importantes:**
- Tokens são obtidos no login e retornados nos headers de resposta
- `expiry` é timestamp Unix (exemplo: 1766520379 = válido até 2026-01-02)
- Cliente precisa manter os 5 headers sincronizados
- Tokens são renovados automaticamente em cada requisição (novos valores nos headers de resposta)

### Login
```http
POST /auth/sign_in
Content-Type: application/json

{
  "username": "lukecyberworm",
  "password": "@Lcw25257946"
}
```

**Resposta:** Headers com `access-token`, `client`, `expiry`, `token-type`, `uid`

---

## ⚠️ Cloudflare Protection

O portal usa **Cloudflare Bot Protection**:
- Cookie necessário: `cf_clearance`
- Valor atual: `6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-1766433811-1.2.1.1-...`
- Requisições sem este cookie podem retornar **403 Forbidden**
- Para automação, capturar cookie de sessão válida do navegador

---

## 📊 ENDPOINTS COMPLETOS

### 1️⃣ Usuário

#### Obter Dados do Usuário Autenticado
```http
GET /users/me
```

**Headers:**
```http
access-token: [token]
client: [client-id]
expiry: [timestamp]
token-type: Bearer
uid: [username]
```

**Resposta (200 OK):**
```json
{
  "id": 27890,
  "username": "lukecyberworm",
  "status": "client",
  "provider": "username",
  "uid": "lukecyberworm",
  "referral_code": "ByGQm2wApADe",
  "referral_bonus": null,
  "balance": 200,
  "active_date": "2026-01-02",
  "plan_id": 1,
  "plan_status": "ACTIVE",
  "modules": {
    "bos": "0",
    "cep": "0",
    "cnh": "0",
    "cpf": "0",
    "cpf_pro": "0",
    "cpf_completa": "9",
    "cpf_tracker": "0",
    "cnpj": "0",
    "email": "2",
    "mother": "0",
    "nome": "0",
    "nome_abreviado": "0",
    "nome_pro": "0",
    "passwords": "0",
    "phone": "0",
    "photo": "0",
    "placa": "0",
    "chassi": "0",
    "renavam": "0",
    "voter_registration": "0",
    "condutor": "0",
    "proprietario": "0",
    "credilink": "0",
    "serasa": "0",
    "pix": "0",
    "cns": "0",
    "username": "0",
    "ip": "0",
    "credilink_address": "0",
    "processos": "0",
    "obito": "0",
    "empregos": "0",
    "foto_nacional": "0",
    "dividas": "0",
    "vistoria_veicular": "0",
    "funcionarios": "0",
    "inss": "0",
    "siape": "0",
    "cnh_pro": "0",
    "desaparecidos": "0",
    "filtro_nascimento": "0",
    "auxilio_emergencial": "0",
    "bolsa_familia": "0",
    "simulacao_fgts": "0",
    "placa_veicular": "0",
    "vizinhos": "0",
    "vazamentos": "0",
    "renach": "0",
    "skysix": "6",
    "radar": "0"
  },
  "referrals": [],
  "withdrawals": [],
  "activities": [],
  "payments": [
    {
      "id": 16514,
      "amount": 70,
      "status": "paid",
      "payment_type": 1,
      "data": null,
      "payment_id": null,
      "created_at": "2025-05-09T23:21:28.138-03:00"
    }
  ],
  "plan": {
    "id": 1,
    "name": "MENSAL",
    "amount": 7990,
    "timerange_days": 31,
    "requests_quantity": 100,
    "plan_type": "PREMIUM",
    "remaining_days": 11
  }
}
```

**Informações Extraídas:**
- ✅ Saldo disponível: `balance`
- ✅ Créditos por módulo: objeto `modules` (48 módulos)
- ✅ Dados do plano: objeto `plan`
- ✅ Histórico de pagamentos: array `payments`

---

### 2️⃣ Planos

#### Listar Planos Disponíveis
```http
GET /plans
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "5",
      "type": "plan",
      "attributes": {
        "name": "Básico",
        "amount": 4990,
        "timerange_days": 15,
        "requests_quantity": 100,
        "plan_type": "PREMIUM"
      }
    },
    {
      "id": "1",
      "type": "plan",
      "attributes": {
        "name": "MENSAL",
        "amount": 7990,
        "timerange_days": 31,
        "requests_quantity": 100,
        "plan_type": "PREMIUM"
      }
    }
  ]
}
```

---

### 3️⃣ Notícias/Atualizações

#### Obter Atualizações do Sistema
```http
GET /news_updates
```

**Resposta:** Lista de notícias e atualizações do portal

---

### 4️⃣ Consultas - Gate 1

> **Padrão de Endpoint:** `/consults/{gate_id}/{módulo}/{identificador}`

#### Consulta CPF Completa
```http
GET /consults/gate_1/cpf/?cpf={cpf}
```

**Query Parameters:**
- `cpf`: CPF sem formatação (apenas números, 11 dígitos)

**Exemplo:**
```http
GET /consults/gate_1/cpf/?cpf=04151107690
```

**Tempo de Resposta:** ~2 segundos (baseado em HAR)

---

#### Consulta Receita Federal por CPF
```http
GET /consults/gate_1/receita/{cpf}
```

**Path Parameters:**
- `cpf`: CPF sem formatação (apenas números)

**Exemplo:**
```http
GET /consults/gate_1/receita/04151107690
```

**Tempo de Resposta:** ~3-4 segundos (baseado em HAR)

---

## 🔍 Padrão de Consultas Identificado

Baseado nos endpoints descobertos, o padrão é:

```
GET /consults/{gate}/módulo}/{identificador}
```

**Gates identificados:**
- `gate_1`: Consultas principais

**Módulos prováveis** (baseado nos 48 módulos disponíveis):
- `cpf` - Consulta CPF
- `receita` - Receita Federal
- `cnpj` - Consulta CNPJ
- `phone` - Telefone
- `email` - Email
- `placa` - Veículo por placa
- `chassi` - Veículo por chassi
- `renavam` - Veículo por RENAVAM
- `cep` - Endereço por CEP
- `pix` - Dados de PIX
- ... (outros 38 módulos)

---

## 📡 CORS e Preflight

A API requer requisições **OPTIONS** (preflight) antes de chamadas principais:

```http
OPTIONS /consults/gate_1/cpf/?cpf=04151107690
accept: */*
access-control-request-headers: access-token,client,expiry,token-type,uid
access-control-request-method: GET
origin: https://app.workconsultoria.com
```

---

## ⏱️ Performance (baseado em análise HAR)

| Endpoint | Tempo Médio |
|----------|-------------|
| `/users/me` | 450-500ms |
| `/plans` | 430-450ms |
| `/news_updates` | 460-680ms |
| `/consults/gate_1/cpf/` | 1.9s - 2s |
| `/consults/gate_1/receita/` | 3.3s - 3.4s |

**Observações:**
- Consultas de dados pessoais (CPF, Receita) são mais lentas
- Endpoints de metadados (user, plans) são rápidos
- Usar HTTP/3 (h3) para melhor performance

---

## 🚀 Próximos Passos

1. ✅ Autenticação documentada
2. ✅ Endpoints principais identificados
3. ✅ Estrutura de módulos mapeada
4. ⏳ Testar demais módulos (CNPJ, Telefone, Email, etc.)
5. ⏳ Documentar estruturas de resposta completas
6. ⏳ Mapear códigos de erro
7. ⏳ Testar rate limiting e throttling
