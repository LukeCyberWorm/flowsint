-- Criar sketch da análise completa
INSERT INTO sketches (id, investigation_id, title, description, created_at, last_updated_at, owner_id, status)
VALUES (
  gen_random_uuid(),
  'c24c2159-d83f-421d-9147-8d723edefaba',
  'Análise Profunda - Pedro Henrique Ferreira Dutra',
  'Mapeamento completo de vestígios digitais, empresariais, judiciais e geográficos. Inclui empresas ativas (Agro Dutra, P&L Intermediações), perfis sociais (@tiuphvalle), endereços confirmados (Goiânia, Flores de Goiás, Naviraí) e rede familiar/profissional.',
  NOW(),
  NOW(),
  '286d76d1-a288-44d8-b0ba-a428ff119aef',
  'active'
)
RETURNING id;
