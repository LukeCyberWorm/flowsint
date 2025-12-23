# 🎯 GUIA PASSO-A-PASSO - Análise do Portal Work Consultoria

## ⚠️ IMPORTANTE
Este portal NÃO pode ser acessado automaticamente devido a proteções do Cloudflare.
Você precisará fazer a análise MANUALMENTE seguindo este guia.

---

## 📋 PREPARAÇÃO

### 1. Abrir Ferramentas Necessárias
- [ ] Navegador Chrome ou Edge
- [ ] Bloco de notas ou editor de código
- [ ] Esta pasta: `workconsultoria-integration/`

### 2. Configurar DevTools
1. Abrir navegador
2. Pressionar **F12** para abrir DevTools
3. Clicar na aba **Network**
4. Marcar opção **Preserve log** (preservar logs)
5. Limpar logs existentes (ícone 🚫)

---

## 🔐 PASSO 1: LOGIN E AUTENTICAÇÃO

### 1.1. Acessar o Portal
```
URL: https://app.workconsultoria.com
Login: LukeCyberWorm
Senha: @Lcw25257946
```

### 1.2. Durante o Login - Capturar Request
No **Network tab**, procurar por requisição de login (geralmente `/login` ou `/auth`)

**Clicar com botão direito na requisição → Copy → Copy as cURL**

Colar aqui e salvar em `examples/auth-request.txt`:
```bash
# Exemplo:
curl 'https://app.workconsultoria.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"username":"...","password":"..."}'
```

### 1.3. Capturar Token/Sessão
Após login bem-sucedido, no **Console do DevTools**, executar:

```javascript
// Verificar localStorage
console.log('localStorage:', localStorage);
Object.keys(localStorage).forEach(key => {
  console.log(key, '=', localStorage.getItem(key));
});

// Verificar sessionStorage  
console.log('sessionStorage:', sessionStorage);
Object.keys(sessionStorage).forEach(key => {
  console.log(key, '=', sessionStorage.getItem(key));
});

// Verificar cookies
console.log('cookies:', document.cookie);
```

**Copiar e colar o resultado em `examples/auth-tokens.txt`**

---

## 📊 PASSO 2: MAPEAR MÓDULOS

### 2.1. Identificar Menu Principal
Olhar o menu lateral/superior e anotar todos os itens:

```
Menu Principal:
├── [ ] Dashboard
├── [ ] Consultas
│   ├── [ ] CPF
│   ├── [ ] CNPJ
│   ├── [ ] Veículo
│   └── [ ] Telefone
├── [ ] Relatórios
├── [ ] Histórico
└── [ ] Configurações
```

Atualizar em `modules-analysis.md`

### 2.2. Para Cada Módulo - Fazer Isso:

#### A. Acessar o Módulo
Clicar no item do menu

#### B. Fazer uma Busca Teste
Exemplo: Se for "Consulta CPF", digitar um CPF e buscar

#### C. No Network Tab - Capturar API
Procurar a requisição que foi feita (geralmente a última)

#### D. Coletar Informações da Requisição

**Clicar na requisição → Aba Headers:**
```
# Copiar:
Request URL: 
Request Method: 
Status Code: 

# Headers importantes:
Authorization: 
Content-Type: 
```

**Aba Payload (se POST):**
```json
// Copiar o JSON enviado
{
  "campo": "valor"
}
```

**Aba Response:**
```json
// Copiar o JSON retornado
{
  "resultado": "..."
}
```

#### E. Salvar Tudo em Arquivo
Criar arquivo: `examples/[modulo-nome]-request.http`

Exemplo para CPF:
```http
### Consulta CPF
POST https://app.workconsultoria.com/api/consulta/cpf
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "cpf": "12345678900"
}

### Resposta esperada
# Status: 200 OK
# Body:
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "nascimento": "01/01/1990"
}
```

---

## 📸 PASSO 3: TIRAR SCREENSHOTS

Para cada módulo importante, tirar print e salvar:

```
screenshots/
├── 01-login.png
├── 02-dashboard.png
├── 03-consulta-cpf-form.png
├── 04-consulta-cpf-resultado.png
├── 05-consulta-cnpj-form.png
├── 06-consulta-cnpj-resultado.png
└── ...
```

**Como tirar print no Windows:**
- Pressionar **Windows + Shift + S**
- Selecionar área
- Colar no Paint e salvar

---

## 🔍 PASSO 4: ANÁLISE DETALHADA DE UM MÓDULO

Escolher um módulo importante (ex: Consulta CPF) e documentar TUDO:

### 4.1. Interface
```
Campos do formulário:
- [ ] Campo 1: [nome, tipo, máscara, obrigatório]
- [ ] Campo 2: [nome, tipo, máscara, obrigatório]

Botões:
- [ ] Buscar
- [ ] Limpar
- [ ] Exportar

Validações:
- CPF válido
- Formato: 999.999.999-99
```

### 4.2. Resultado
```
Dados exibidos:
- Nome completo
- CPF
- Data de nascimento
- Nome da mãe
- Situação cadastral
- ...

Ações disponíveis:
- [ ] Ver detalhes
- [ ] Exportar PDF
- [ ] Salvar em relatório
```

### 4.3. Request Completo
```bash
# Copiar como cURL (botão direito na request)
curl 'https://...' \
  -H 'authorization: Bearer ...' \
  -H 'content-type: application/json' \
  --data-raw '{"cpf":"12345678900"}'
```

### 4.4. Response Completo
```json
// Copiar JSON inteiro da response
{
  "success": true,
  "data": {
    // ... todos os campos
  }
}
```

---

## 📝 PASSO 5: DOCUMENTAR PADRÕES

### 5.1. Estrutura de Resposta Padrão
Identificar o padrão das respostas:

```json
// Sucesso:
{
  "success": true,
  "data": {...}
}

// Erro:
{
  "success": false,
  "error": "mensagem",
  "code": 400
}
```

### 5.2. Headers Padrão
```
Todas as requests autenticadas usam:
Authorization: Bearer [token]
Content-Type: application/json
```

### 5.3. Base URL
```
https://app.workconsultoria.com/api
```

---

## ✅ CHECKLIST FINAL

### Informações Essenciais Coletadas:
- [ ] URL de login
- [ ] Estrutura do request de login
- [ ] Como o token é retornado (header? body? cookie?)
- [ ] Como o token é usado (header Authorization?)
- [ ] Base URL da API
- [ ] Lista completa de módulos
- [ ] Pelo menos 3 exemplos de endpoints diferentes
- [ ] Estrutura padrão de response
- [ ] Códigos de erro possíveis

### Arquivos Criados:
- [ ] `examples/auth-request.txt` (login)
- [ ] `examples/auth-tokens.txt` (token/sessão)
- [ ] `examples/cpf-request.http` (exemplo consulta)
- [ ] `examples/cnpj-request.http` (exemplo consulta)
- [ ] `screenshots/` (prints das telas)
- [ ] `api-documentation.md` (atualizado)
- [ ] `modules-analysis.md` (atualizado)

---

## 🚀 PRÓXIMO PASSO

Após coletar TODAS as informações acima:

1. **Avisar que terminou**
2. **Compartilhar os arquivos criados**
3. **Eu vou implementar a integração**

---

## 💡 DICAS ÚTEIS

### Copiar JSON Grande
```javascript
// No Console do DevTools:
copy(objetoJSON)
// Vai copiar para clipboard, depois colar em arquivo
```

### Ver Request como cURL
```
Network → Clicar na request → Botão direito → Copy → Copy as cURL
```

### Ver Todas as Rotas Carregadas
```javascript
// No Console, após navegar pelo site:
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .map(r => r.name)
```

### Exportar Cookies
```javascript
document.cookie.split(';').map(c => c.trim()).join('\n')
```

---

## ⚠️ IMPORTANTE - NÃO FAZER

- ❌ Não compartilhar credenciais publicamente
- ❌ Não commitar tokens em repositório
- ❌ Não expor dados sensíveis de consultas reais

---

**Boa sorte! 🎯**

Qualquer dúvida durante o processo, pode perguntar!
