-- Criar Dossiê: Caso INV-2025-1222-001
-- Investigação Veicular - Yamaha Fazer YS250
-- Data: 22/12/2025

-- IMPORTANTE: Copie e guarde o token gerado abaixo!
-- Token: SRS-CASO22122025-vB3kL9mPq8wN

INSERT INTO dossiers (
    id,
    investigation_id,
    case_number,
    title,
    description,
    status,
    client_name,
    is_public,
    access_token,
    password_hash,
    expires_at,
    last_accessed_at,
    created_at,
    created_by
) VALUES (
    gen_random_uuid(),
    NULL,
    'INV-2025-1222-001',
    'Investigação Veicular - Yamaha Fazer YS250 (DXM2C19)',
    '# Relatório Forense - Caso INV-2025-1222-001

## 🏍️ Veículo Investigado
**Motocicleta Yamaha Fazer YS250 (2008, Preta)**
- **Placa**: DXM2C19
- **Chassi**: 9C6KG017080073424
- **Renavam**: 00956985220
- **Situação**: Em circulação (sem restrições)
- **Licenciamento 2025**: ✅ Pago

---

## 👤 Proprietário Registrado

### Tiago Ferreira Paulo
- **CPF**: 319.822.008-47
- **Nascimento**: 31/03/1983 (42 anos)
- **Mãe**: Zulmira Ferreira Paulo

#### 📍 Endereço Principal
**Rua Clorino de Oliveira Cajé, 229 - Jardim Nelly, São Paulo-SP**
- CEP: 05371-140
- Região: Zona Oeste (Butantã/Rio Pequeno)

#### 💰 Perfil Econômico
- **Renda Estimada**: R$ 372,94/mês
- **Poder Aquisitivo**: Muito Baixo (R$ 112 a R$ 630)
- **Score CSB**: 404 (Médio)
- **Score CSBA**: 133 (Altíssimo risco)
- **Perfil**: No Coração da Periferia / Jovens da Periferia

#### 👨‍👩‍👦 Parentes
- Zulmira Ferreira Paulo (Mãe)
- Felipe Ferreira Paulo (Irmão)

#### 🔍 Observações
Baixo perfil econômico; improvável manutenção de moto 250cc sem renda formal. Possível uso para trabalho informal (motoboy).

---

## 👤 Indivíduo Associado

### Joelma Ribeiro de Morais Pinto
- **CPF**: 283.890.568-60
- **Nascimento**: 05/02/1981 (44 anos)
- **Mãe**: Josefa Vital de Morais

#### 💼 Profissão
- Operadora de Caixa / Recepcionista
- Renda Histórica: ~R$ 2.400 (2013)

#### 💰 Perfil Econômico
- **Score CSB**: 318 (Médio)
- **Score CSBA**: 338 (Alto risco)
- **Perfil**: Esticando a Renda / Adultos Urbanos Estabelecidos

#### 🚗 Veículo Associado
- **Placa**: AAD2459
- **Modelo**: Fiat Premio S (1990)

#### 📍 Endereços
1. **Rua Borges de Medeiros, 252** - Vila Fátima, São Paulo-SP (CEP: 03920-010)
2. **Rua Manoel Viana** (próximo) - Vila Ema / São Lucas, São Paulo-SP
3. **Rua Isaias, 220** - Jardim Maria Luiza / Jardim Martini, São Paulo-SP (CEP: 04434-030)
4. **Alameda Itu, 852** - Jardim Paulista, São Paulo-SP

#### 🔍 Observações
Forte concentração na Zona Sul/Leste de SP. Associação possível via transferência não comunicada ou uso informal.

---

## 🗺️ Análise de Rotas

### Localizações
- **Proprietário (Tiago)**: Zona Oeste - Jardim Nelly (Butantã/Rio Pequeno)
- **Associada (Joelma)**: Zona Sul/Leste - Vila Fátima, Vila Ema + possível trabalho no Centro (Jardim Paulista)

### Distâncias
- Jardim Nelly ↔ Vila Fátima: **25-30 km**
- Vila Fátima ↔ Jardim Paulista: **15 km**

---

## 🎯 Conclusões

### Hipótese Principal
Veículo registrado em nome de Tiago desde pelo menos 2025, mas possível associação anterior com Joelma. Descompasso socioeconômico sugere transferência recente ou uso compartilhado.

### ⚠️ Riscos
- ✅ Nenhum registro criminal
- ✅ Sem restrições veiculares
- ⚠️ Alto risco creditício em ambos

### 📋 Recomendações
1. Vigilância física nos endereços principais
2. Verificação de data exata de transferência
3. Cruzamento com câmeras de trânsito ou apps de entrega
4. Entrevista com vizinhos ou parentes (ex.: Marcos Roberto Pinto ou Zulmira)

---

**🔒 Relatório gerado por:** Scarlet Red Solutions  
**📅 Data da Consulta:** 22/12/2025  
**🆔 Caso ID:** INV-2025-1222-001',
    'active',
    'Cliente - Investigação Veicular',
    TRUE,
    'SRS-CASO22122025-vB3kL9mPq8wN',
    NULL,
    NULL,
    NULL,
    NOW(),
    NULL
);

-- Verificar se foi criado
SELECT 
    id,
    case_number,
    title,
    access_token,
    created_at
FROM dossiers 
WHERE case_number = 'INV-2025-1222-001';

-- ============================================
-- 📋 INFORMAÇÕES PARA O CLIENTE
-- ============================================
--
-- 🔑 Token de Acesso: SRS-CASO22122025-vB3kL9mPq8wN
--
-- 🔗 Link para visualização:
-- https://dossie.scarletredsolutions.com/view/SRS-CASO22122025-vB3kL9mPq8wN
--
-- ============================================
