INSERT INTO sketches (id, title, description, investigation_id, status, created_at)
VALUES (
    gen_random_uuid(),
    'Análise Completa - Tiago Ferreira Paulo e Joelma Ribeiro',
    'Relatório forense completo do caso INV-2025-1222-001 incluindo análise veicular, perfil do proprietário Tiago Ferreira Paulo e indivíduo associado Joelma Ribeiro de Morais Pinto',
    '61b977cb-9b87-4161-977d-0278e69c4fee',
    'completed',
    NOW()
)
RETURNING id, title, investigation_id;
