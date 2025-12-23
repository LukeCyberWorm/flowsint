-- Inserir notas detalhadas para o caso INV-2025-1222-001
WITH target_dossier AS (
    SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
)
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_at)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM target_dossier),
    '# 🏍️ Veículo Investigado: Yamaha Fazer YS250

**Motocicleta Yamaha Fazer YS250 (2008, Preta)**

- **Placa**: DXM2C19
- **Chassi**: 9C6KG017080073424
- **Renavam**: 00956985220
- **Marca/Modelo**: Yamaha/Fazer YS250
- **Ano Fabricação**: 2008
- **Ano Modelo**: 2008
- **Cor**: Preta
- **Combustível**: Gasolina
- **Cilindradas**: 249
- **Situação**: Em circulação
- **Restrições**: Nenhuma (sem roubo/furto, leilão, recall, Renajud ou RFB)
- **Licenciamento 2025**: ✅ Pago
- **Data Emissão CRV**: 07/08/2025

---

## 👤 Proprietário Registrado: Tiago Ferreira Paulo

- **CPF**: 319.822.008-47
- **Data de Nascimento**: 31/03/1983 (42 anos)
- **Mãe**: Zulmira Ferreira Paulo

### 📍 Endereço Principal
**Rua Clorino de Oliveira Cajé, 229 - Jardim Nelly, São Paulo-SP**
- **CEP**: 05371-140
- **Região**: Zona Oeste (Butantã/Rio Pequeno)

### 💰 Perfil Socioeconômico
- **Renda Estimada Mensal**: R$ 372,94
- **Poder Aquisitivo**: Muito Baixo (R$ 112 a R$ 630)
- **Score CSB**: 404 (Médio)
- **Score CSBA**: 133 (Altíssimo risco)
- **Mosaic**: No Coração da Periferia / Jovens da Periferia

### 👨‍👩‍👦 Parentes
- **Zulmira Ferreira Paulo** (Mãe)
- **Felipe Ferreira Paulo** (Irmão)

### 🔍 Observações
Baixo perfil econômico; improvável manutenção de moto 250cc sem renda formal. Possível uso para trabalho informal (motoboy).',
    FALSE,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM target_dossier),
    '# 👤 Indivíduo Associado: Joelma Ribeiro de Morais Pinto

- **CPF**: 283.890.568-60
- **Data de Nascimento**: 05/02/1981 (44 anos)
- **Mãe**: Josefa Vital de Morais

### 💼 Profissão
- Operadora de Caixa / Recepcionista
- **Renda Histórica**: ~R$ 2.400 (2013)

### 💰 Perfil Socioeconômico
- **Score CSB**: 318 (Médio)
- **Score CSBA**: 338 (Alto risco)
- **Mosaic**: Esticando a Renda / Adultos Urbanos Estabelecidos

### 🚗 Veículo Associado
- **Placa**: AAD2459
- **Marca/Modelo**: Fiat Premio S
- **Ano**: 1990

### 📍 Endereços Principais
1. **Rua Borges de Medeiros, 252** - Vila Fátima, São Paulo-SP (CEP: 03920-010)
2. **Rua Manoel Viana** (próximo) - Vila Ema / São Lucas, São Paulo-SP
3. **Rua Isaias, 220** - Jardim Maria Luiza / Jardim Martini, São Paulo-SP (CEP: 04434-030)
4. **Alameda Itu, 852** - Jardim Paulista, São Paulo-SP

### 🔍 Observações
Forte concentração na Zona Sul/Leste de SP. Associação possível via transferência não comunicada ou uso informal.',
    FALSE,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM target_dossier),
    '# 🗺️ Análise de Rotas e Conclusões

### Localizações Principais
- **Proprietário (Tiago)**: Zona Oeste - Jardim Nelly (Butantã/Rio Pequeno)
- **Associada (Joelma)**: Zona Sul/Leste - Vila Fátima, Vila Ema + possível trabalho no Centro (Jardim Paulista)

### Distâncias Aproximadas
- **Jardim Nelly ↔ Vila Fátima**: 25-30 km
- **Vila Fátima ↔ Jardim Paulista**: 15 km

---

## 🎯 Conclusões e Análise

### Hipótese Principal
Veículo registrado em nome de Tiago desde pelo menos 2025, mas possível associação anterior com Joelma. Descompasso socioeconômico sugere transferência recente ou uso compartilhado.

### ⚠️ Riscos Identificados
- ✅ Nenhum registro criminal identificado
- ✅ Sem restrições veiculares (roubo/furto/leilão)
- ⚠️ Alto risco creditício em ambos os indivíduos (CSBA: 133 e 338)
- ⚠️ Baixa renda declarada incompatível com manutenção de veículo 250cc

### 📋 Recomendações Investigativas
1. **Vigilância física** nos endereços principais (Jardim Nelly e Vila Fátima)
2. **Verificação de data exata** de transferência do veículo
3. **Cruzamento com câmeras** de trânsito ou apps de entrega (iFood, Rappi, Uber)
4. **Entrevista com vizinhos ou parentes** (ex.: Marcos Roberto Pinto ou Zulmira)
5. **Monitoramento de deslocamentos** entre Zona Oeste e Zona Sul/Leste',
    FALSE,
    NOW()
);
