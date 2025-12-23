# 🔍 GUIA: Descobrir Endpoint de Consulta de Veículos

## Objetivo

Descobrir o endpoint correto da API Work Consultoria para consulta de veículos por placa.

---

## 🎯 O que Precisamos Descobrir

1. **URL exata** do endpoint
2. **Método HTTP** (GET/POST)
3. **Parâmetros** (query string, body, path)
4. **Nome do módulo correto** (placa, vehicle, veiculo, etc.)
5. **Estrutura da resposta** JSON

---

## 📋 PASSO A PASSO

### 1. Acessar Portal Work Consultoria

```
https://app.workconsultoria.com
```

Login:
- Username: `LukeCyberWorm`
- Password: `@Lcw25257946`

### 2. Abrir DevTools

**Chrome/Edge:**
- Pressionar `F12` ou
- Clicar com direito → Inspecionar
- Ir para aba **Network**

### 3. Preparar Filtros

Na aba Network:
1. Limpar histórico (ícone 🚫)
2. Ativar "Preserve log" ✅
3. Filtrar por: `XHR` ou `Fetch`

### 4. Fazer Consulta de Veículo

**Onde consultar:**
- Procurar módulo "Veículos" no menu
- Ou módulo "Placa", "Consulta Veicular", etc.

**O que consultar:**
- Use uma **placa real** que você saiba que existe
- Exemplos comuns: `ABC1234`, `XYZ9876` (formatos antigos)
- Ou formato Mercosul: `ABC1D23`

### 5. Capturar Requisição

Após fazer a consulta, no DevTools:

1. Procurar por requisição começando com:
   - `consults`
   - `vehicle`
   - `placa`
   - `api.workconsultoria.com`

2. Clicar na requisição

3. Aba **Headers:**
   - Copiar **Request URL** completa
   - Copiar **Request Method**
   - Copiar **Query String Parameters** (se houver)

4. Aba **Payload** (se POST):
   - Copiar todo o JSON enviado

5. Aba **Response**:
   - Copiar estrutura JSON completa da resposta

### 6. Copiar como cURL

**Chrome/Edge:**
1. Clicar com direito na requisição
2. Copy → Copy as cURL (bash)
3. Colar em um arquivo de texto

---

## 📸 O que Enviar de Volta

Envie os seguintes dados:

### 1. Request URL Completa
```
Exemplo:
https://api.workconsultoria.com/api/v1/consults/gate_1/[MÓDULO]/?placa=ABC1234
```

### 2. Método HTTP
```
GET ou POST
```

### 3. Headers Importantes
```http
access-token: [valor]
client: [valor]
expiry: [valor]
uid: lukecyberworm
```

### 4. Parâmetros
```json
{
  "placa": "ABC1234"
}
```
ou
```
?placa=ABC1234
```

### 5. Resposta JSON Completa
```json
{
  "placa": "ABC1234",
  "marca": "VOLKSWAGEN",
  "modelo": "GOL",
  "ano": "2015",
  ...
}
```

### 6. cURL Completo
```bash
curl 'https://api.workconsultoria.com/api/v1/...' \
  -H 'access-token: ...' \
  -H 'client: ...' \
  ...
```

---

## 🎁 Ferramentas Auxiliares

### Opção 1: Exportar HAR

**Mais completo - RECOMENDADO**

1. DevTools → Network
2. Fazer a consulta
3. Clicar com direito em qualquer requisição
4. "Save all as HAR with content"
5. Salvar arquivo `.har`
6. Me enviar o arquivo

### Opção 2: Screenshot

Tirar prints das abas:
- Headers
- Payload (se POST)
- Response

---

## ✅ Checklist de Informações

Antes de enviar, confirmar que tem:

- [ ] URL completa do endpoint
- [ ] Método HTTP (GET/POST/etc)
- [ ] Headers de autenticação
- [ ] Parâmetros enviados (se houver)
- [ ] Resposta JSON exemplo
- [ ] cURL ou HAR file

---

## 🚀 O que Fazer Após Descobrir

Assim que você enviar as informações, vou:

1. ✅ Atualizar `client.py` com endpoint correto
2. ✅ Criar modelo Pydantic para resposta de veículo
3. ✅ Implementar rotas FastAPI
4. ✅ Criar componentes frontend
5. ✅ Adicionar "Vehicle Entity" no modal

---

## 💡 Dicas

### Se não encontrar módulo de veículos no portal:

1. Verificar se tem acesso no plano atual
2. Pode estar em submenu (Consultas → Veículos)
3. Pode ter nome diferente (Automotivo, Placas, etc.)

### Se a consulta não funcionar:

1. Verificar se tem créditos: `/users/me` → `modules.placa`
2. Pode precisar de upgrade de plano
3. Tentar com CPF do proprietário: já sabemos que funciona!

### Placas para testar:

Se precisar de placas reais para testar:
- Usar site DETRAN (consulta pública)
- Ou usar veículos de conhecidos (com permissão)

---

## 📞 Suporte

Se tiver dúvida em qualquer passo, me pergunte!

Vou te ajudar a:
- Navegar no portal
- Interpretar as requisições
- Validar os dados capturados
