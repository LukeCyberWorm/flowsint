-- Adicionar arquivos ao dossiê CASO-12112025
-- Dossier ID: 2c444a1a-825f-44ea-a9d8-8311d5716999
-- User ID: 286d76d1-a288-44d8-b0ba-a428ff119aef

-- 1. RELATÓRIO FINAL HTML
INSERT INTO dossier_files (id, dossier_id, file_name, file_type, file_url, file_size, uploaded_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    'Relatorio Final - CASO 12112025.html',
    'document',
    '/evidence/caso-12112025/relatorio-final.html',
    125000,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- 2. RELATÓRIO DETALHADO PDF
INSERT INTO dossier_files (id, dossier_id, file_name, file_type, file_url, file_size, uploaded_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    'Relatorio de Conclusão Detalhado.pdf',
    'document',
    '/evidence/caso-12112025/relatorio-conclusao-detalhado.pdf',
    850000,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- 3. ANÁLISE DEEP SEARCH
INSERT INTO dossier_files (id, dossier_id, file_name, file_type, file_url, file_size, uploaded_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    'Análise DeepSearch - Pedro Henrique.md',
    'document',
    '/evidence/caso-12112025/analise-deepsearch-pedro.md',
    15000,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- 4. FOTO DO SUSPEITO AFONSO
INSERT INTO dossier_files (id, dossier_id, file_name, file_type, file_url, file_size, uploaded_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    'Afonso Henrique Lagoeiro Dutra - Perfil.jpg',
    'image',
    '/evidence/caso-12112025/afonso-perfil.jpg',
    45000,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- 5. FOTO PEDRO HENRIQUE (se disponível)
INSERT INTO dossier_files (id, dossier_id, file_name, file_type, file_url, file_size, uploaded_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    'Pedro Henrique Ferreira Dutra - Perfil.jpg',
    'image',
    '/evidence/caso-12112025/pedro-perfil.jpg',
    38000,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- NOTAS COM ENDEREÇOS E MAPAS

-- Nota 1: Resumo Executivo
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# 📋 Resumo Executivo - Caso 12112025

**Status**: Investigação OSINT Concluída | **Data**: 19/12/2025

## Sujeito Principal
**Pedro Henrique Ferreira Dutra**
- CPF: 001.053.421-06
- Nascimento: 03/02/1987 (38 anos)
- Mãe: Danielle Ferreira Dutra

## Conclusões Principais
✅ **Empresário do setor agropecuário** (Agro Dutra Participações + P&L Intermediações)
✅ **Núcleo familiar estruturado** com propriedades em GO e MS
✅ **Perfil discreto** com baixa exposição digital
✅ **Conexões confirmadas** com Afonso Henrique Lagoeiro Dutra (pai provável)

## Localização Provável
🎯 **70%**: Goiânia-GO / Flores de Goiás-GO
🎯 **20%**: Naviraí-MS
🎯 **10%**: Outros (viagens)

## Próximos Passos
⚠️ Diligência presencial na Fazenda Poções (Flores de Goiás) - **ALTA PRIORIDADE**
⚠️ Verificação no endereço urbano: Rua do Boto, 237 - Jardim Atlântico, Goiânia-GO',
    true,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- Nota 2: Endereços Principais com Mapas
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# 📍 Endereços Principais - Localização

## 1️⃣ Goiânia-GO (Residência Urbana)
**Rua do Boto, 237 - Jardim Atlântico**
- CEP: 74.343-060
- Coordenadas: -16.736815, -49.302705
- [Ver no Google Maps](https://www.google.com/maps?q=-16.736815,-49.302705)
- Status: **CONFIRMADO** - Núcleo familiar ativo
- Telefones: (62) 3587-6892 | (62) 98456-7123
- Última confirmação: Dezembro 2025

## 2️⃣ Flores de Goiás-GO (Sede Rural)
**Fazenda Poções - BR-020, Km 116**
- CEP: 73.890-000
- Coordenadas: -14.448264, -47.014482
- [Ver no Google Maps](https://www.google.com/maps?q=-14.448264,-47.014482)
- Status: **ALTA PRIORIDADE** - Sede da Agro Dutra Participações
- Área: 152 módulos fiscais (propriedade extensa)
- Última atividade: Empresa ativa desde 2019

## 3️⃣ Naviraí-MS (Propriedade Rural Secundária)
**Fazenda Marta**
- Município: Naviraí-MS
- Status: Consulta recente (19/12/2025)
- Ligação: Possível propriedade familiar ou parceria

## 4️⃣ Formosa-GO (Conexão com Afonso)
**Endereço de Afonso Henrique Lagoeiro Dutra**
- Coordenadas: -15.540072, -47.339617
- [Ver no Google Maps](https://www.google.com/maps?q=-15.540072,-47.339617)
- Relação: Pai provável de Pedro Henrique
- Empresas compartilhadas: Lagoeiro e Dutra Ltda

---

**⚠️ RECOMENDAÇÃO OPERACIONAL:**
Priorizar diligência em **Fazenda Poções** (isolada, acesso por BR-020) seguido de verificação urbana em **Rua do Boto** (família confirmada).',
    true,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- Nota 3: Empresas e Atividades
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# 🏢 Empresas e Atividades Econômicas

## Agro Dutra Participações Ltda
- **CNPJ**: 32.983.200/0001-06
- **Abertura**: 11/03/2019
- **Endereço**: Fazenda Poções, BR-020 Km 116, Flores de Goiás-GO
- **Atividade**: Comércio atacadista de animais vivos (CNAE 46.23-1-01)
- **Sócios**: Pedro Henrique (administrador), Giulia Ferreira Dutra
- **Status**: ✅ ATIVA

## P & L Intermediações Ltda
- **CNPJ**: 58.854.311/0001-06
- **Abertura**: 14/01/2025 (RECENTE!)
- **Endereço**: Rua M 3, Marzagão-GO
- **Atividade**: Intermediação em agenciamento de serviços
- **Sócios**: Pedro Henrique, Luis Afonso Ferreira Dutra
- **Status**: ✅ ATIVA

## Lagoeiro e Dutra Ltda (Conexão Familiar)
- **CNPJ**: 13.827.900/0001-59
- **Localização**: Porto Velho-RO
- **Sócios**: Claudia Lagoeiro Dutra Harger (possível família de Afonso)
- **Relação**: Patrimônio familiar Lagoeiro/Dutra

## Perfil Econômico
💰 **Renda Estimada**: R$ 5.572/mês (média-alta para região)
💳 **Cartão**: Black (alta linha de crédito)
🏦 **Investimentos**: Previdência privada confirmada
🚗 **Patrimônio**: Veículos de luxo, propriedades rurais extensas',
    false,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- Nota 4: Núcleo Familiar
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# 👨‍👩‍👧‍👦 Núcleo Familiar Mapeado

## Pais
🔴 **Afonso Henrique Lagoeiro Dutra** (Pai Provável)
- CPF: 002.053.421-08
- Endereço: Formosa-GO
- Atividade: Empresário agropecuário (Lagoeiro Dutra Agropastoril)
- **Foto identificada**: Confirmada via Scarlet-IA

🔵 **Danielle Ferreira Dutra** (Mãe)
- Nome completo confirmado
- Vínculo: Certidão de nascimento Pedro Henrique

## Irmãos
👤 **Giulia Ferreira Dutra**
- Sócia na Agro Dutra Participações
- Vínculo empresarial confirmado

👤 **Giovanna Ferreira Dutra**
- Mencionada em registros familiares

👤 **Luis Afonso Ferreira Dutra**
- CPF: 001.053.401-62
- Sócio na P&L Intermediações (empresa mais recente)
- Endereço compartilhado: Goiânia-GO

## Análise Scarlet-IA
> "Núcleo familiar estruturado com forte atuação no agronegócio goiano. Conexões intergeracionais confirmadas através de empresas compartilhadas (Agro Dutra + Lagoeiro e Dutra Ltda). Padrão de herança patrimonial em propriedades rurais GO/MS."',
    false,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- Nota 5: Rastros Digitais
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# 💻 Rastros Digitais e Online

## Email
📧 **phferreiradutra@hotmail.com**
- Nenhum vazamento público recente
- Uso privado confirmado
- Recomendação: Quebra de sigilo judicial (Microsoft) para rastrear IPs/localizações

## Redes Sociais
🐦 **Twitter/X: @tiuphvalle** (Possível Conta)
- Posts recentes: Nov-Dez 2025
- Tema: Futebol (Flamengo, Libertadores)
- Interações com contas brasileiras
- Exemplo: "Bug na compra de ingressos para Lima (Peru)"
- Status: **NÃO CONFIRMADO** - Requer análise OSINT avançada

## Outros Registros
📚 **Formação Acadêmica**:
- UFG - Agronomia (Goiânia, 2008)
- OAB 2023 (menção em listas)
- UFMS Campo Grande-MS (edital 2025)

💉 **Vacinação COVID-19**:
- Data: 09/07/2021
- Local: UBS Família I, Vila Boa-GO
- Confirmação: Presença em GO durante pandemia

## Análise de Comportamento
- **Perfil**: Discreto, baixa exposição digital
- **Mobilidade**: Urbano (Goiânia) + Rural (Fazendas GO/MS)
- **Lazer**: Eventos esportivos nacionais/internacionais
- **Cautela**: Alto nível de privacidade, sem redes sociais confirmadas',
    false,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

-- Nota 6: Recomendações Operacionais
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_by)
VALUES (
    gen_random_uuid(),
    '2c444a1a-825f-44ea-a9d8-8311d5716999',
    '# ⚙️ Recomendações Operacionais

## Ações Imediatas (Alta Prioridade)

### 1. Diligência Presencial - Fazenda Poções
📍 **Local**: BR-020, Km 116, Flores de Goiás-GO
🎯 **Objetivo**: Confirmar presença, atividade agropecuária
⚠️ **Alerta**: Área rural isolada, acesso restrito
🕒 **Melhor horário**: Dias úteis (atividade comercial)

### 2. Verificação Urbana - Rua do Boto
📍 **Local**: Rua do Boto, 237 - Jardim Atlântico, Goiânia-GO
🎯 **Objetivo**: Confirmar núcleo familiar, rotina residencial
📞 **Contatos**: (62) 3587-6892 | (62) 98456-7123
🕒 **Melhor horário**: Noturno (presença residencial)

## Ações Judiciais Recomendadas

### Petições Sugeridas
1. **Receita Federal**: Atualização CPF/CNPJ, declarações IR
2. **SERASA**: Histórico de crédito, dívidas, score
3. **Provedores (Microsoft)**: Logs de acesso email (IPs, geolocalização)
4. **Operadoras**: Registros de telefonia móvel (ERBs, localização)

### Órgãos de Apoio
- **TJGO**: Processos judiciais em andamento
- **Jusbrasil**: Monitoramento de novos processos
- **Registro Rural GO**: CAR Fazenda Poções (152 módulos)

## OSINT Avançado

### Ferramentas Recomendadas
- **Busca Reversa Telefone**: TrueCaller, Getcontact
- **Monitoramento Social**: TweetDeck (@tiuphvalle), Facebook Graph Search
- **Imagens**: Reconhecimento facial em fotos públicas
- **LinkedIn**: Busca por "Pedro Henrique Ferreira Dutra" + empresas

### Alertas Configurados
✅ Google Alerts: Nome completo + variações
✅ Jusbrasil: Novos processos TJGO
✅ Receita Federal: Alterações CNPJ empresas

## Próximas 48h
1️⃣ Diligência Fazenda Poções (equipe de campo)
2️⃣ Verificação telefônica Rua do Boto
3️⃣ Petição urgente Receita Federal
4️⃣ Análise @tiuphvalle (OSINT social)

**Status**: Fase OSINT concluída - Aguardando confirmação in loco',
    true,
    '286d76d1-a288-44d8-b0ba-a428ff119aef'
);

COMMIT;
