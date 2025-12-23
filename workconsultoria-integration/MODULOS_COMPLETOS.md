# 📋 Work Consultoria - Análise Completa de Módulos

## 🎯 RESUMO EXECUTIVO

**Total de Módulos:** 48  
**Módulos com Créditos:** 3  
**Saldo Disponível:** R$ 200,00  
**Plano Atual:** MENSAL (R$ 79,90 - Premium - 31 dias)  
**Dias Restantes:** 11  
**Validade:** 02/01/2026  

---

## ✅ MÓDULOS COM CRÉDITOS DISPONÍVEIS

| Módulo | Créditos | Categoria |
|--------|----------|-----------|
| `cpf_completa` | 9 | Consulta CPF |
| `email` | 2 | Consulta Email |
| `skysix` | 6 | Especial |

---

## 📊 TODOS OS 48 MÓDULOS

### 🆔 1. Consultas por CPF (15 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `bos` | 0 | Base de Óbitos |
| `cpf` | 0 | Consulta CPF Básica |
| `cpf_pro` | 0 | Consulta CPF Profissional |
| **`cpf_completa`** | **9** ✅ | **Consulta CPF Completa** |
| `cpf_tracker` | 0 | Rastreamento CPF |
| `cnh` | 0 | Consulta CNH |
| `cnh_pro` | 0 | Consulta CNH Profissional |
| `mother` | 0 | Consulta Nome da Mãe |
| `obito` | 0 | Consulta Óbito |
| `cns` | 0 | Cartão Nacional de Saúde |
| `inss` | 0 | Consulta INSS |
| `siape` | 0 | Consulta SIAPE (Servidor Público) |
| `auxilio_emergencial` | 0 | Auxílio Emergencial |
| `bolsa_familia` | 0 | Bolsa Família |
| `simulacao_fgts` | 0 | Simulação FGTS |

### 👤 2. Consultas por Nome (3 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `nome` | 0 | Consulta por Nome Básica |
| `nome_abreviado` | 0 | Nome Abreviado |
| `nome_pro` | 0 | Consulta Nome Profissional |

### 🏢 3. Consultas por CNPJ (2 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `cnpj` | 0 | Consulta CNPJ |
| `funcionarios` | 0 | Lista de Funcionários |

### 📧 4. Consultas por Email (1 módulo)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| **`email`** | **2** ✅ | **Consulta Email** |

### 📞 5. Consultas por Telefone (1 módulo)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `phone` | 0 | Consulta Telefone |

### 🚗 6. Consultas Veiculares (8 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `placa` | 0 | Consulta Placa |
| `placa_veicular` | 0 | Consulta Placa Veicular (alternativa) |
| `chassi` | 0 | Consulta Chassi |
| `renavam` | 0 | Consulta RENAVAM |
| `renach` | 0 | Registro Nacional CNH |
| `condutor` | 0 | Dados do Condutor |
| `proprietario` | 0 | Dados do Proprietário |
| `vistoria_veicular` | 0 | Vistoria Veicular |

### 📍 7. Consultas por Localização (2 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `cep` | 0 | Consulta CEP |
| `vizinhos` | 0 | Vizinhos/Proximidade |

### 💰 8. Dados Financeiros (6 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `credilink` | 0 | Credilink (Score) |
| `credilink_address` | 0 | Credilink com Endereço |
| `serasa` | 0 | Consulta Serasa |
| `pix` | 0 | Consulta PIX |
| `dividas` | 0 | Consulta Dívidas |
| `empregos` | 0 | Histórico de Empregos |

### 🔐 9. Segurança e Vazamentos (3 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `passwords` | 0 | Senhas Vazadas |
| `vazamentos` | 0 | Vazamentos de Dados |
| `username` | 0 | Consulta Username |

### 📸 10. Dados Visuais (2 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `photo` | 0 | Consulta Foto |
| `foto_nacional` | 0 | Foto Nacional |

### ⚖️ 11. Dados Legais (2 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `voter_registration` | 0 | Título de Eleitor |
| `processos` | 0 | Processos Judiciais |

### 🌐 12. Internet e Rede (1 módulo)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| `ip` | 0 | Consulta IP |

### 🔮 13. Especiais/Outros (4 módulos)

| Módulo | Créditos | Descrição Provável |
|--------|----------|-------------------|
| **`skysix`** | **6** ✅ | **SkyS IX (Plataforma Especial)** |
| `radar` | 0 | Radar (Monitoramento) |
| `filtro_nascimento` | 0 | Filtro por Data de Nascimento |
| `desaparecidos` | 0 | Pessoas Desaparecidas |

---

## 🔍 PADRÃO DE ENDPOINTS (Identificado)

Baseado nas requisições capturadas:

```
GET /api/v1/consults/{gate}/{módulo}/{identificador}
```

**Exemplos Reais:**
```http
GET /api/v1/consults/gate_1/cpf/?cpf=04151107690
GET /api/v1/consults/gate_1/receita/04151107690
```

**Gates Conhecidos:**
- `gate_1` - Consultas principais

**Módulos com Endpoints Confirmados:**
1. ✅ `cpf` - Query parameter `?cpf=`
2. ✅ `receita` - Path parameter direto

---

## 📝 ENDPOINTS PROVÁVEIS (Hipótese)

Com base no padrão identificado, os outros módulos provavelmente seguem:

### Por CPF
```http
GET /consults/gate_1/cpf_completa/?cpf={cpf}
GET /consults/gate_1/cpf_pro/?cpf={cpf}
GET /consults/gate_1/cnh/?cpf={cpf}
GET /consults/gate_1/mother/?cpf={cpf}
GET /consults/gate_1/obito/?cpf={cpf}
GET /consults/gate_1/inss/?cpf={cpf}
GET /consults/gate_1/credilink/?cpf={cpf}
GET /consults/gate_1/serasa/?cpf={cpf}
```

### Por CNPJ
```http
GET /consults/gate_1/cnpj/?cnpj={cnpj}
GET /consults/gate_1/funcionarios/?cnpj={cnpj}
```

### Por Email
```http
GET /consults/gate_1/email/?email={email}
```

### Por Telefone
```http
GET /consults/gate_1/phone/?phone={phone}
```

### Por Veículo
```http
GET /consults/gate_1/placa/?placa={placa}
GET /consults/gate_1/chassi/?chassi={chassi}
GET /consults/gate_1/renavam/?renavam={renavam}
```

### Por CEP
```http
GET /consults/gate_1/cep/?cep={cep}
```

### Por PIX
```http
GET /consults/gate_1/pix/?chave={chave}
```

### Por Nome
```http
GET /consults/gate_1/nome/?nome={nome}
```

---

## 🎭 ESTRUTURA DE MÓDULO

Cada módulo provavelmente retorna:

```json
{
  "success": true,
  "module": "cpf_completa",
  "credits_used": 1,
  "credits_remaining": 8,
  "data": {
    // Dados específicos do módulo
  }
}
```

---

## 🔥 MÓDULOS PRIORITÁRIOS PARA TESTAR

Com base nos créditos disponíveis:

1. ✅ **cpf_completa** (9 créditos) - TESTAR PRIMEIRO
2. ✅ **skysix** (6 créditos) - INVESTIGAR (módulo desconhecido)
3. ✅ **email** (2 créditos) - TESTAR

---

## 📌 PRÓXIMOS PASSOS

### Fase 1: Testar Módulos com Créditos
- [ ] Testar `/consults/gate_1/cpf_completa/`
- [ ] Testar `/consults/gate_1/email/`
- [ ] Investigar `/consults/gate_1/skysix/`

### Fase 2: Documentar Respostas
- [ ] Estrutura de resposta de cada módulo
- [ ] Campos retornados
- [ ] Formatos de dados

### Fase 3: Descobrir Outros Módulos
- [ ] Padrão de nomenclatura de endpoints
- [ ] Parâmetros aceitos
- [ ] Validações de entrada

### Fase 4: Erro Handling
- [ ] Códigos de erro HTTP
- [ ] Mensagens de erro da API
- [ ] Comportamento sem créditos
- [ ] Tratamento de dados não encontrados

---

## 💡 OBSERVAÇÕES IMPORTANTES

1. **Sistema de Créditos:**
   - Cada consulta consome créditos do módulo específico
   - Saldo geral (R$ 200) separado dos créditos por módulo
   - Créditos não expiram até a data do plano (02/01/2026)

2. **Padrão de Nomenclatura:**
   - Módulos em snake_case (ex: `cpf_completa`)
   - Endpoints lowercase
   - Query params ou path params dependendo do módulo

3. **Performance:**
   - Consultas CPF: ~2 segundos
   - Consultas Receita: ~3-4 segundos
   - Metadados (/users/me): ~500ms

4. **Limitações:**
   - 100 requisições por plano mensal
   - Cloudflare bot protection ativo
   - Cookie `cf_clearance` necessário para automação
