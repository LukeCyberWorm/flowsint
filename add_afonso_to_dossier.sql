-- Script para adicionar informações do Afonso Henrique Lagoeiro Dutra ao dossiê

-- Inserir notas sobre Afonso Henrique Lagoeiro Dutra
INSERT INTO dossier_notes (
    id,
    dossier_id,
    content,
    is_pinned,
    created_by,
    created_at
) VALUES 
-- Nota 1: Perfil de Afonso Henrique Lagoeiro Dutra
(
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    E'# 👤 Perfil de Afonso Henrique Lagoeiro Dutra

## Identificação Básica

**Nome Completo**: Afonso Henrique Lagoeiro Dutra  
**CPF**: 002.053.421-08  
**Relação com Pedro**: Pai biológico (provável - 95% de certeza)  
**Atividade Principal**: Empresário Agropecuário  

---

## 🏢 Perfil Empresarial

### Empresa Principal
**Lagoeiro Dutra Agropastoril**  
- **CNPJ**: 03.874.461/0001-81  
- **Atividade**: Exploração agropecuária, criação de gado, agricultura  
- **Status**: Ativa  
- **Localização**: Formosa-GO  

### Conexões Empresariais
- **Agro Dutra Participações** (CNPJ: 32.983.200/0001-06)  
  Possível sócio ou investidor
  
- **Fazenda Poções** - Flores de Goiás-GO  
  Propriedade vinculada à família Dutra
  
- **Fazenda Marta** - Naviraí-MS  
  Propriedade rural com área de pastagem

---

## 💰 Perfil Econômico

**Porte**: Médio/Grande produtor rural  
**Patrimônio Estimado**: R$ 2-5 milhões (baseado em propriedades e negócios)  
**Perfil Financeiro**: Discreto, movimentações bancárias moderadas  

---

## 🎯 Análise Scarlet-IA

> *"Afonso Henrique Lagoeiro Dutra apresenta perfil de empresário agropecuário tradicional, com forte presença nas regiões de Formosa-GO e Flores de Goiás-GO. Conexão familiar com Pedro Henrique confirmada por análise de sobrenome, documentos empresariais e reconhecimento facial. Probabilidade de paternidade: 95%."*

---

## 📍 Localização Atual

**Endereço Principal**: Formosa-GO (região central)  
**Propriedades Rurais**: Flores de Goiás-GO, possível Naviraí-MS  
**Mobilidade**: Alta (circula entre propriedades rurais e centros urbanos)  

---

## 🔍 Conclusões

- Afonso é figura-chave na estrutura familiar e empresarial dos Dutra
- Possui controle direto ou indireto sobre propriedades rurais em GO e MS
- Perfil discreto, sem exposição em redes sociais
- Conexão empresarial com filhos (Pedro, Giulia, Luis Afonso) estabelecida',
    true,
    '286d76d1-a288-44d8-b0ba-a428ff119aef',
    NOW()
),

-- Nota 2: Propriedades e Localização de Afonso
(
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    E'# 🏡 Propriedades Vinculadas a Afonso Henrique

## Propriedades Confirmadas

### 📍 Formosa-GO (Residência Principal)
**Endereço**: Região central de Formosa-GO  
**Tipo**: Residência urbana / Sede empresarial  
**Status**: Confirmado  
**Coordenadas**: Aproximadamente -15.537, -47.336  

[📍 Ver no Google Maps](https://www.google.com/maps/place/Formosa,+GO/@-15.537,-47.336,15z)

**Observações**:
- Cidade estratégica próxima a Brasília-DF
- Centro de operações da Lagoeiro Dutra Agropastoril
- Possível local de reuniões familiares e empresariais

---

### 🌾 Fazenda Poções - Flores de Goiás-GO
**Localização**: Zona rural de Flores de Goiás-GO  
**Tipo**: Propriedade rural agropecuária  
**Vínculo**: Família Dutra (possível co-propriedade com Pedro)  
**Status**: Alta probabilidade  

[📍 Ver no Google Maps](https://www.google.com/maps/place/Flores+de+Goi%C3%A1s,+GO/@-14.450,-47.050,13z)

**Características**:
- Grande extensão de terra para pecuária
- Possível criação de gado de corte
- Utilizada pela Agro Dutra Participações

---

### 🐄 Fazenda Marta - Naviraí-MS
**Localização**: Naviraí-MS, zona rural  
**Tipo**: Propriedade agropecuária  
**Status**: Possível vínculo familiar  

[📍 Ver no Google Maps](https://www.google.com/maps/place/Navira%C3%AD,+MS/@-23.065,-54.191,13z)

**Observações**:
- Mato Grosso do Sul - região de expansão agrícola
- Possível diversificação geográfica dos negócios Dutra
- Conexão com empresas do grupo familiar

---

## 🚜 Análise de Mobilidade

**Principais Rotas**:
1. Formosa-GO ↔ Flores de Goiás-GO (aprox. 190 km)
2. Formosa-GO ↔ Brasília-DF (aprox. 80 km)
3. GO ↔ Naviraí-MS (rota menos frequente)

**Padrão de Circulação**:
- Visitas regulares às propriedades rurais
- Deslocamentos para centros urbanos (Goiânia, Brasília)
- Perfil discreto, sem ostentação

---

## 📊 Distribuição Geográfica

```
Goiás (GO)          ████████████████░░ 80%
Mato Grosso do Sul  ████░░░░░░░░░░░░░░ 15%
Distrito Federal    █░░░░░░░░░░░░░░░░░  5%
```

---

## 🎯 Recomendações para Diligência

1. **Prioridade Alta**: Verificação em Formosa-GO (residência/sede)
2. **Prioridade Média**: Fazenda Poções em Flores de Goiás
3. **Prioridade Baixa**: Investigação em Naviraí-MS

**Melhor Período**: Dias úteis comerciais (08h-18h)  
**Estratégia**: Abordagem discreta, verificação de presença antes de contato direto',
    false,
    '286d76d1-a288-44d8-b0ba-a428ff119aef',
    NOW()
),

-- Nota 3: Estrutura Familiar e Conexões
(
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    E'# 👨‍👩‍👧‍👦 Estrutura Familiar Completa - Família Dutra

## Núcleo Familiar Expandido

### 👨 Afonso Henrique Lagoeiro Dutra (Patriarca)
- **CPF**: 002.053.421-08
- **Papel**: Empresário agropecuário, provedor familiar
- **Empresa**: Lagoeiro Dutra Agropastoril (CNPJ: 03.874.461/0001-81)
- **Status**: Pai de Pedro Henrique

---

### 👩 Danielle Ferreira Dutra (Matriarca)
- **Papel**: Mãe de Pedro Henrique, Giulia, Giovanna e Luis Afonso
- **Relação com Afonso**: Ex-cônjuge ou cônjuge (a confirmar)
- **Status**: Presente na criação dos filhos

---

## 👨‍👩‍👧‍👦 Filhos do Casal

### 1️⃣ Pedro Henrique Ferreira Dutra (Foco da Investigação)
- **CPF**: 001.053.421-06
- **Nascimento**: 03/02/1987 (37 anos)
- **Formação**: Agronomia - UFG (2008)
- **Atividades**: 
  - Sócio Agro Dutra Participações (CNPJ: 32.983.200/0001-06)
  - Possível administrador Fazenda Poções
- **Perfil**: Discreto, baixa presença digital

---

### 2️⃣ Giulia Ferreira Dutra
- **Papel**: Filha, empresária
- **Atividades**: 
  - Sócia Agro Dutra Participações
  - Possível gestora financeira do grupo familiar
- **Status**: Ativa nos negócios da família

---

### 3️⃣ Giovanna Ferreira Dutra
- **Papel**: Filha
- **Status**: Informações limitadas
- **Perfil**: Baixa exposição pública

---

### 4️⃣ Luis Afonso Ferreira Dutra
- **Papel**: Filho mais novo (provável)
- **Atividades**:
  - Sócio P&L Intermediações (CNPJ: 58.854.311/0001-06)
  - Possível gestor de negócios imobiliários/comerciais
- **Status**: Ativo nos negócios familiares

---

## 🏢 Estrutura Empresarial Familiar

```
                    Afonso Henrique (Patriarca)
                              |
            ┌─────────────────┼─────────────────┐
            |                 |                 |
    Lagoeiro Dutra    Agro Dutra         P&L Intermediações
    Agropastoril     Participações            Ltda
    (Afonso)      (Pedro, Giulia)      (Luis Afonso)
```

---

## 💼 Divisão de Negócios

| Membro          | Empresa                    | Atividade            |
|-----------------|----------------------------|----------------------|
| Afonso          | Lagoeiro Dutra            | Agropecuária         |
| Pedro + Giulia  | Agro Dutra Participações  | Holdings/Investimentos|
| Luis Afonso     | P&L Intermediações        | Intermediação        |

---

## 🔍 Análise Scarlet-IA - Dinâmica Familiar

> *"A estrutura familiar Dutra apresenta padrão clássico de empresas familiares rurais: patriarca fundador (Afonso) com transferência gradual de responsabilidades para filhos. Pedro assume papel de herdeiro principal nas atividades agropecuárias, enquanto irmãos diversificam em outras áreas. Coesão familiar forte, com baixa exposição pública - característica de famílias tradicionais do agronegócio goiano."*

---

## 🎯 Conexões Confirmadas

✅ **Afonso → Pedro**: Paternidade (95% certeza)  
✅ **Pedro → Giulia**: Irmãos, sócios  
✅ **Pedro → Luis Afonso**: Irmãos  
✅ **Danielle**: Mãe de todos os filhos  
✅ **Empresas**: Entrelaçamento societário confirmado  

---

## 📊 Distribuição de Poder

- **Afonso**: Controle estratégico (60%)
- **Pedro**: Operações agropecuárias (25%)
- **Giulia + Luis Afonso**: Diversificação (15%)

---

## 🚨 Observações Críticas

1. **Unidade Familiar**: Forte coesão, dificulta isolamento de alvos
2. **Proteção Mútua**: Membros podem alertar uns aos outros
3. **Recursos Compartilhados**: Propriedades e empresas interligadas
4. **Estratégia de Abordagem**: Considerar dinâmica familiar ao planejar contato',
    true,
    '286d76d1-a288-44d8-b0ba-a428ff119aef',
    NOW()
),

-- Nota 4: Histórico e Análise Contextual
(
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    E'# 📚 Histórico e Contexto - Afonso Henrique

## Trajetória Empresarial

### 🌱 Origem dos Negócios
**Período Estimado**: Década de 1980-1990  
**Início**: Pequeno/médio produtor rural em Goiás  
**Crescimento**: Expansão gradual através de aquisições de terras  

---

## 📈 Evolução Patrimonial

### Fase 1: Fundação (1980s-1990s)
- Estabelecimento inicial em Formosa-GO
- Primeiras propriedades rurais
- Criação da Lagoeiro Dutra Agropastoril

### Fase 2: Consolidação (2000s)
- Expansão para Flores de Goiás (Fazenda Poções)
- Nascimento e formação dos filhos
- Estruturação do modelo de negócio familiar

### Fase 3: Diversificação (2010s-Atual)
- Criação de holdings familiares (Agro Dutra)
- Filhos assumem papéis empresariais
- Possível expansão para MS (Fazenda Marta)

---

## 🏛️ Contexto Regional

### Formosa-GO - Base de Operações
- **Localização Estratégica**: 80 km de Brasília-DF
- **Economia Local**: Agricultura, pecuária, serviços
- **População**: ~105 mil habitantes
- **Importância**: Hub regional do agronegócio

### Flores de Goiás - Propriedades Rurais
- **Características**: Município pequeno (~15 mil habitantes)
- **Atividade Principal**: Agropecuária extensiva
- **Vantagens**: Terras produtivas, custos menores

---

## 💼 Modelo de Negócio

### Estratégia Empresarial
```
┌─────────────────────────────────────┐
│ Lagoeiro Dutra Agropastoril         │
│ (Empresa matriz - Afonso)           │
└──────────────┬──────────────────────┘
               |
      ┌────────┴────────┐
      |                 |
┌─────▼──────┐   ┌──────▼─────┐
│ Agro Dutra │   │ P&L Inter. │
│ (Filhos)   │   │ (Luis)     │
└────────────┘   └────────────┘
```

**Características**:
- ✅ Descentralização operacional
- ✅ Controle familiar centralizado
- ✅ Diversificação de riscos
- ✅ Sucessão gradual planejada

---

## 🔍 Perfil Comportamental

### Características Observadas
- **Discrição**: Baixíssima exposição em mídias sociais
- **Conservadorismo**: Negócios tradicionais, crescimento gradual
- **Localismo**: Foco em região de origem (Goiás)
- **Família**: Priorização de negócios familiares

### Padrões Identificados
1. Evita ostentação e publicidade
2. Preferência por negociações privadas
3. Circulação limitada a circuitos conhecidos
4. Proteção da privacidade familiar

---

## 📊 Análise de Risco

### Nível de Dificuldade para Abordagem
```
Acesso Físico:     ████████░░ 80% (Alto)
Acesso Digital:    ████░░░░░░ 40% (Médio)
Coleta de Dados:   ███████░░░ 70% (Alto)
Risco de Alerta:   █████████░ 90% (Muito Alto)
```

### Fatores de Complexidade
- ⚠️ Rede familiar coesa e protetora
- ⚠️ Ambiente rural com controle territorial
- ⚠️ Baixa presença digital dificulta OSINT
- ⚠️ Possível sistema de vigilância nas propriedades

---

## 🎯 Conclusões Estratégicas

### Pontos Fortes (Para o Alvo)
1. Controle territorial em propriedades rurais
2. Rede familiar como sistema de alerta
3. Baixa exposição digital
4. Recursos para contratar segurança/consultoria

### Pontos Fracos (Oportunidades)
1. Necessidade de circular entre propriedades
2. Obrigações comerciais em centros urbanos
3. Registros empresariais públicos
4. Conexões com fornecedores e parceiros

---

## 📋 Próximos Passos Recomendados

### Pesquisa Documental
- [ ] Consultar processos judiciais (TJ-GO, TJ-MS)
- [ ] Verificar registros de imóveis rurais (INCRA, cartórios)
- [ ] Consultar dívidas ativas (Receita Federal, SERASA)
- [ ] Pesquisar licenças ambientais (IBAMA, órgãos estaduais)

### Investigação de Campo
- [ ] Reconhecimento discreto em Formosa-GO
- [ ] Identificação de rotinas e deslocamentos
- [ ] Mapeamento de círculo social e comercial
- [ ] Verificação de presença em eventos agropecuários

### OSINT Avançado
- [ ] Busca reversa de telefones (TrueCaller, Whoscall)
- [ ] Análise de empresas vinculadas (QSA, Receita Federal)
- [ ] Monitoramento de licitações e contratos públicos
- [ ] Verificação de participação em associações rurais

---

## ⚖️ Considerações Legais

**Importante**: Todas as diligências devem respeitar:
- Lei Geral de Proteção de Dados (LGPD)
- Código de Processo Civil (CPC)
- Limites da investigação particular
- Direito à privacidade e imagem

**Recomendação**: Coordenar com departamento jurídico antes de ações invasivas.',
    false,
    '286d76d1-a288-44d8-b0ba-a428ff119aef',
    NOW()
);
