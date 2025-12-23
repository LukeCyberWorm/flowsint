WITH new_investigation AS (
    INSERT INTO investigations (id, name, description, status, created_at)
    VALUES (
        gen_random_uuid(),
        'Tiago Ferreira Paulo',
        'Investigação Veicular - Yamaha Fazer YS250 - Proprietário Registrado',
        'active',
        NOW()
    )
    RETURNING id
),
new_sketch AS (
    INSERT INTO sketches (id, title, description, investigation_id, status, created_at)
    SELECT 
        gen_random_uuid(),
        'Análise Completa - Tiago Ferreira Paulo e Joelma Ribeiro',
        'Relatório forense completo do caso INV-2025-1222-001 incluindo análise veicular, perfil do proprietário Tiago Ferreira Paulo e indivíduo associado Joelma Ribeiro de Morais Pinto',
        id,
        'completed',
        NOW()
    FROM new_investigation
    RETURNING investigation_id
)
INSERT INTO dossiers (id, investigation_id, case_number, title, description, status, client_name, is_public, access_token, created_at)
SELECT 
    gen_random_uuid(),
    id,
    'INV-2025-1222-001',
    'Investigação Veicular - Yamaha Fazer YS250',
    'Investigação completa sobre motocicleta Yamaha Fazer YS250 (Placa DXM2C19) registrada em nome de Tiago Ferreira Paulo com histórico de associação com Joelma Ribeiro de Morais Pinto',
    'active',
    'Scarlet Red Solutions',
    TRUE,
    'CASO-MOTO-2025-vB3kL9mPq8wN',
    NOW()
FROM new_investigation
RETURNING case_number, access_token, investigation_id;
