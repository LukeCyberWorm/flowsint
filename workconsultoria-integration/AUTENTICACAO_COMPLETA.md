# 🔐 Work Consultoria - Autenticação Completa

## Sistema de Autenticação: **Devise Token Auth**

Framework: Ruby on Rails  
Biblioteca: `devise_token_auth` gem

---

## 🎫 Headers de Autenticação

**TODOS os 5 headers são obrigatórios em cada requisição:**

```http
access-token: AH_0gMrfF3Us-D__pLdfAA
client: tr2TUHr37D3qGNFTOZDYqg
expiry: 1766520379
token-type: Bearer
uid: lukecyberworm
```

---

## 🔑 Valores Atuais (Conta lukecyberworm)

| Header | Valor | Descrição |
|--------|-------|-----------|
| `access-token` | `AH_0gMrfF3Us-D__pLdfAA` | Token de acesso |
| `client` | `tr2TUHr37D3qGNFTOZDYqg` | ID do cliente/sessão |
| `expiry` | `1766520379` | Timestamp Unix (02/01/2026 às 03:59:39 UTC) |
| `token-type` | `Bearer` | Tipo de autenticação |
| `uid` | `lukecyberworm` | Username do usuário |

---

## 📝 Como Funciona

### 1. Login
```http
POST https://api.workconsultoria.com/api/v1/auth/sign_in
Content-Type: application/json

{
  "email": "lukecyberworm@example.com",
  "password": "@Lcw25257946"
}
```

**Resposta (200 OK):**

Headers:
```http
access-token: [novo_token]
client: [novo_client_id]
expiry: [novo_timestamp]
token-type: Bearer
uid: lukecyberworm
```

Body:
```json
{
  "data": {
    "id": 27890,
    "username": "lukecyberworm",
    "email": "lukecyberworm@example.com",
    "provider": "username"
  }
}
```

### 2. Usar Tokens em Requisições

Todas as requisições subsequentes devem incluir os 5 headers:

```http
GET https://api.workconsultoria.com/api/v1/users/me
access-token: AH_0gMrfF3Us-D__pLdfAA
client: tr2TUHr37D3qGNFTOZDYqg
expiry: 1766520379
token-type: Bearer
uid: lukecyberworm
```

### 3. Renovação Automática

A cada requisição bem-sucedida, a API retorna **novos valores** nos headers:

```http
access-token: [token_atualizado]
client: [client_atualizado]
expiry: [timestamp_atualizado]
```

**⚠️ IMPORTANTE:** Cliente deve atualizar seus headers com os novos valores!

---

## 🔄 Fluxo Completo de Autenticação

```
1. LOGIN
   POST /auth/sign_in
   Body: { email, password }
   ↓
   Response Headers: access-token, client, expiry, uid
   ↓
   GUARDAR OS 5 HEADERS

2. USAR API
   GET /users/me
   Headers: access-token, client, expiry, token-type, uid
   ↓
   Response Headers: NOVOS access-token, client, expiry
   ↓
   ATUALIZAR OS HEADERS GUARDADOS

3. CONTINUAR USANDO
   GET /consults/gate_1/cpf/?cpf=123
   Headers: (headers atualizados do passo anterior)
   ↓
   Response Headers: NOVOS access-token, client, expiry
   ↓
   ATUALIZAR NOVAMENTE

4. LOGOUT
   DELETE /auth/sign_out
   Headers: access-token, client, expiry, token-type, uid
```

---

## 🚨 Erros de Autenticação

### 401 Unauthorized

**Causas:**
- Headers ausentes
- Token expirado
- Token inválido
- Cliente (client-id) não corresponde ao token

**Solução:** Fazer login novamente

### 403 Forbidden

**Causas:**
- Cloudflare bot protection
- Cookie `cf_clearance` ausente

**Solução:** Incluir cookie válido do navegador

---

## 🍪 Cloudflare Cookie

Para automação, capturar e incluir:

```http
Cookie: cf_clearance=6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-1766433811-1.2.1.1-7C7Une66RZZ6mcz6nFtgVgBPmujvlDAIaSuQUq3aqipoV0nPlqHRGXVOUCaI07EtnRjrhjtBwkD1JrUT_i0JL4hDiAbvv9i8R1Gg11ptIdsAMEyOWB4Mdg7a4efJ8HEXdlvwa5_ZpLn3NB6lUfxBfAY6g7f.ITUy7jGm1QcKTUBdtZzRuWfUvbWB4jK6JYcMTVN8rzzR4cXmdA1i8lJFis8ulcy5_0Fg4sYWRrEV7dg
```

---

## 🐍 Exemplo Python (httpx)

```python
import httpx
from datetime import datetime

class WorkConsultoriaAuth:
    def __init__(self):
        self.base_url = "https://api.workconsultoria.com/api/v1"
        self.headers = {
            "access-token": "",
            "client": "",
            "expiry": "",
            "token-type": "Bearer",
            "uid": ""
        }
        self.cf_cookie = "6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-1766433811-..."
    
    def login(self, username: str, password: str):
        """Faz login e salva tokens"""
        response = httpx.post(
            f"{self.base_url}/auth/sign_in",
            json={"username": username, "password": password},
            headers={"Cookie": f"cf_clearance={self.cf_cookie}"}
        )
        
        if response.status_code == 200:
            # Extrair tokens dos headers
            self.headers["access-token"] = response.headers.get("access-token")
            self.headers["client"] = response.headers.get("client")
            self.headers["expiry"] = response.headers.get("expiry")
            self.headers["uid"] = response.headers.get("uid")
            return True
        return False
    
    def update_tokens(self, response: httpx.Response):
        """Atualiza tokens após cada requisição"""
        if "access-token" in response.headers:
            self.headers["access-token"] = response.headers["access-token"]
        if "client" in response.headers:
            self.headers["client"] = response.headers["client"]
        if "expiry" in response.headers:
            self.headers["expiry"] = response.headers["expiry"]
    
    def get(self, endpoint: str):
        """Faz requisição GET com autenticação"""
        headers = self.headers.copy()
        headers["Cookie"] = f"cf_clearance={self.cf_cookie}"
        
        response = httpx.get(
            f"{self.base_url}{endpoint}",
            headers=headers
        )
        
        # Atualizar tokens para próxima requisição
        self.update_tokens(response)
        
        return response

# Uso
auth = WorkConsultoriaAuth()
auth.login("lukecyberworm", "@Lcw25257946")

# Primeira requisição
me = auth.get("/users/me")
print(me.json())

# Segunda requisição (com tokens atualizados)
cpf = auth.get("/consults/gate_1/cpf/?cpf=04151107690")
print(cpf.json())
```

---

## 📊 Dados Retornados em /users/me

Headers necessários + resposta contém:

```json
{
  "id": 27890,
  "username": "lukecyberworm",
  "balance": 200,
  "active_date": "2026-01-02",
  "plan_status": "ACTIVE",
  "modules": {
    "cpf_completa": "9",
    "email": "2",
    "skysix": "6",
    // ... outros 45 módulos com "0"
  },
  "plan": {
    "name": "MENSAL",
    "amount": 7990,
    "remaining_days": 11
  }
}
```

---

## ✅ Checklist de Implementação

- [x] Entender sistema Devise Token Auth
- [x] Identificar 5 headers obrigatórios
- [x] Capturar cookie Cloudflare
- [x] Documentar fluxo de login
- [ ] Implementar classe Python de autenticação
- [ ] Testar renovação automática de tokens
- [ ] Implementar tratamento de erros 401/403
- [ ] Adicionar refresh automático antes de expiração
- [ ] Persistir tokens em arquivo/banco (opcional)

---

## 🔒 Segurança

**Boas Práticas:**
1. Nunca commitar tokens em repositórios
2. Usar variáveis de ambiente para credenciais
3. Renovar tokens regularmente
4. Implementar logout ao encerrar sessão
5. Validar expiração antes de requisições críticas

**Variáveis de Ambiente:**
```bash
WORK_USERNAME=lukecyberworm
WORK_PASSWORD=@Lcw25257946
WORK_CF_COOKIE=6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-...
```
