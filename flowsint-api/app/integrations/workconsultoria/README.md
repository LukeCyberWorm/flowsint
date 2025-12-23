# Work Consultoria Integration

Cliente Python para integração com Work Consultoria API

## Configuração

### 1. Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```bash
# Work Consultoria API
WORK_API_URL=https://api.workconsultoria.com/api/v1
WORK_ACCESS_TOKEN=AH_0gMrfF3Us-D__pLdfAA
WORK_CLIENT=tr2TUHr37D3qGNFTOZDYqg
WORK_EXPIRY=1766520379
WORK_UID=lukecyberworm
WORK_CF_CLEARANCE=6Hp3qFOWKL8RklCPbHdUTe21bn6C2IJYMnrKu8UGfSg-1766433811-1.2.1.1-7C7Une66RZZ6mcz6nFtgVgBPmujvlDAIaSuQUq3aqipoV0nPlqHRGXVOUCaI07EtnRjrhjtBwkD1JrUT_i0JL4hDiAbvv9i8R1Gg11ptIdsAMEyOWB4Mdg7a4efJ8HEXdlvwa5_ZpLn3NB6lUfxBfAY6g7f.ITUy7jGm1QcKTUBdtZzRuWfUvbWB4jK6JYcMTVN8rzzR4cXmdA1i8lJFis8ulcy5_0Fg4sYWRrEV7dg
```

### 2. Instalar Dependências

```bash
pip install httpx python-dotenv
```

## Uso

### Cliente Básico

```python
from app.integrations.workconsultoria.client import work_client

# Verificar créditos
credits = await work_client.check_credits()
# {"cpf_completa": 9, "email": 2, "skysix": 6}

# Consultar CPF
cpf_data = await work_client.search_cpf("04151107690")

# Buscar veículos por CPF do proprietário
vehicles = await work_client.search_vehicles_by_owner_cpf("04151107690")
```

### Endpoints Disponíveis

#### Usuário
```python
# Informações do usuário
user_info = await work_client.get_user_info()

# Saldo disponível
balance = await work_client.get_balance()

# Informações do plano
plan = await work_client.get_plan_info()

# Créditos por módulo
credits = await work_client.check_credits()
```

#### Consultas CPF
```python
# CPF básico
cpf = await work_client.search_cpf("04151107690")

# CPF completo (CONSOME CRÉDITO)
cpf_full = await work_client.search_cpf_complete("04151107690")

# Receita Federal
receita = await work_client.search_receita("04151107690")
```

#### Consultas Email
```python
# Vazamentos de email
email_data = await work_client.search_email("teste@example.com")
# {"total": 0, "msg": []}
```

#### Consultas Veículos
```python
# Por CPF do proprietário (FUNCIONAL)
vehicles = await work_client.search_vehicles_by_owner_cpf("04151107690")
# Returns: List[Dict] ou None

# Por placa (ENDPOINT NÃO DISPONÍVEL - 404)
# Aguardando descoberta do endpoint correto
try:
    vehicle = await work_client.search_vehicle_by_plate("ABC1234")
except httpx.HTTPStatusError:
    print("Endpoint de placa ainda não disponível")
```

## Estrutura

```
flowsint-api/app/integrations/workconsultoria/
├── __init__.py
├── client.py          # Cliente principal
├── models.py          # Modelos Pydantic (a criar)
├── routes.py          # Rotas FastAPI (a criar)
└── schemas.py         # Schemas de validação (a criar)
```

## Próximos Passos

1. ✅ Cliente básico implementado
2. ⏳ Criar modelos Pydantic para respostas
3. ⏳ Implementar rotas FastAPI
4. ⏳ Adicionar cache para respostas
5. ⏳ Implementar rate limiting
6. ⏳ Criar testes unitários
7. ⏳ Descobrir endpoint correto para busca por placa

## Notas Importantes

### Renovação de Tokens

Tokens são atualizados automaticamente após cada requisição. Os novos valores são armazenados em `self.headers`.

### Cloudflare Cookie

Cookie `cf_clearance` é necessário para evitar erro 403. Capturar de sessão válida do navegador.

### Endpoints de Veículos

⚠️ **Endpoints de busca por placa retornam 404**  
Solução temporária: usar busca por CPF do proprietário

Para descobrir endpoint correto:
1. Acessar portal Work Consultoria
2. Fazer consulta de placa real
3. Capturar request no DevTools
4. Atualizar `client.py` com endpoint correto
