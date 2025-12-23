# 🔌 Work Consultoria - Documentação de APIs

## 📍 Base URL
```
https://app.workconsultoria.com
```

---

## 🔐 Autenticação

### Login
```http
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "LukeCyberWorm",
  "password": "@Lcw25257946"
}

Response:
{
  // Documentar após teste
}
```

---

## 📊 ENDPOINTS IDENTIFICADOS

### [Documentar aqui após análise manual]

**Formato Padrão:**

```markdown
### Nome do Endpoint
**Método:** GET/POST/PUT/DELETE
**URL:** /api/rota/aqui
**Autenticação:** Sim/Não
**Descrição:** O que este endpoint faz

**Headers:**
```http
Authorization: Bearer [token]
Content-Type: application/json
```

**Query Parameters:**
- `param1` (string, required): Descrição
- `param2` (number, optional): Descrição

**Body:**
```json
{
  "campo": "valor"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {}
}
```

**Response 400:**
```json
{
  "error": "mensagem"
}
```
```

---

## 🔍 CATEGORIAS DE ENDPOINTS

### 1. Autenticação
- [ ] Login
- [ ] Logout
- [ ] Refresh Token
- [ ] Verificar Sessão

### 2. Busca de Pessoas
- [ ] Busca por CPF
- [ ] Busca por Nome
- [ ] Busca Avançada
- [ ] Detalhes da Pessoa

### 3. Busca de Empresas
- [ ] Busca por CNPJ
- [ ] Busca por Razão Social
- [ ] Dados Cadastrais
- [ ] Quadro Societário

### 4. Veículos
- [ ] Busca por Placa
- [ ] Busca por Chassi
- [ ] Histórico

### 5. Documentos
- [ ] Upload
- [ ] Download
- [ ] Listagem

### 6. Relatórios
- [ ] Gerar Relatório
- [ ] Listar Relatórios
- [ ] Download PDF

---

## 📝 NOTAS TÉCNICAS

### Rate Limiting
```
[Documentar após testes]
- Requisições por minuto:
- Requisições por hora:
- Headers de rate limit:
```

### CORS
```
[Verificar origins permitidas]
Access-Control-Allow-Origin: 
```

### Erros Comuns
```json
{
  "401": "Não autorizado - Token inválido/expirado",
  "403": "Proibido - Sem permissão",
  "404": "Não encontrado",
  "429": "Rate limit excedido",
  "500": "Erro interno do servidor"
}
```

---

**Atualizado em:** [Data após análise manual]
