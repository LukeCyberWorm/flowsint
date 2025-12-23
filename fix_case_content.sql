WITH target_case AS (
    SELECT d.id as dossier_id, d.investigation_id
    FROM dossiers d
    WHERE d.access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
),
inserted_analyses AS (
    INSERT INTO analyses (id, title, description, created_at, investigation_id)
    SELECT 
        gen_random_uuid(),
        'Perfil Completo - Tiago Ferreira Paulo',
        E'# 👤 Perfil do Proprietário: Tiago Ferreira Paulo\n\n## Identificação\n- **Nome Completo**: Tiago Ferreira Paulo\n- **CPF**: 319.822.008-47\n- **Data de Nascimento**: 31/03/1983 (42 anos)\n- **Mãe**: Zulmira Ferreira Paulo\n\n## Endereço Principal\n**Rua Clorino de Oliveira Cajé, 229 - Jardim Nelly, São Paulo-SP**\n- CEP: 05371-140\n- Região: Zona Oeste (Butantã/Rio Pequeno)\n\n## Veículo Registrado\n- **Modelo**: Yamaha Fazer YS250\n- **Placa**: DXM2C19\n- **Cor**: Preta\n- **Ano**: 2008\n\n## Perfil Socioeconômico\n- **Renda Estimada**: R$ 372,94 (Baixa)\n- **Score CSB**: 404 (Médio)\n- **Risco**: Altíssimo (CSBA 133)',
        NOW(),
        investigation_id
    FROM target_case
    RETURNING id
),
inserted_analyses_2 AS (
    INSERT INTO analyses (id, title, description, created_at, investigation_id)
    SELECT 
        gen_random_uuid(),
        'Perfil Associado - Joelma Ribeiro de Morais Pinto',
        E'# 👤 Perfil Associado: Joelma Ribeiro de Morais Pinto\n\n## Identificação\n- **Nome Completo**: Joelma Ribeiro de Morais Pinto\n- **CPF**: 283.890.568-60\n- **Data de Nascimento**: 05/02/1981 (44 anos)\n- **Mãe**: Josefa Vital de Morais\n\n## Endereços Conhecidos\n1. **Rua Borges de Medeiros, 252 - Vila Fátima, São Paulo-SP**\n2. **Rua Isaias, 220 - Jardim Maria Luiza, São Paulo-SP**\n\n## Veículo Associado\n- **Modelo**: Fiat Premio S\n- **Placa**: AAD2459\n- **Ano**: 1990\n\n## Perfil Profissional\n- **Ocupação**: Operadora de Caixa / Recepcionista\n- **Renda Histórica**: ~R$ 2.400',
        NOW(),
        investigation_id
    FROM target_case
    RETURNING id
)
INSERT INTO dossier_notes (id, dossier_id, content, is_pinned, created_at)
SELECT 
    gen_random_uuid(),
    dossier_id,
    E'# 👤 Resumo do Caso: Tiago e Joelma\n\nInvestigação focada na motocicleta Yamaha Fazer YS250 (DXM2C19).\n\n**Principais Pontos:**\n- Veículo em nome de Tiago Ferreira Paulo.\n- Forte associação histórica com Joelma Ribeiro de Morais Pinto.\n- Discrepância entre renda declarada e posse do veículo.\n- Risco de crédito elevado para ambos os envolvidos.',
    TRUE,
    NOW()
FROM target_case;
