// Atualizar node de Afonso com mais informações
MATCH (f:Person {id: 'afonso-henrique-lagoeiro-dutra'})
SET f.photo = 'afonso-lagoeiro-dutra.jpg',
    f.photo_date = '2025-12-19',
    f.age_estimate = '60-65',
    f.physical_desc = 'Cabelos grisalhos, pele clara, corrente no pescoço',
    f.location = 'Formosa-GO',
    f.evidence_level = 'confirmed'
RETURN f;

// Adicionar empresas relacionadas ao sobrenome Lagoeiro Dutra
CREATE (c3:Company {
  id: 'lagoeiro-e-dutra-ltda',
  name: 'Lagoeiro e Dutra Ltda',
  cnpj: '13.827.900/0001-59',
  city: 'Porto Velho',
  state: 'RO',
  status: 'ATIVA',
  type: 'company',
  connection_type: 'familia_possivel',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

// Criar relacionamento indireto
MATCH (f:Person {id: 'afonso-henrique-lagoeiro-dutra'})
MATCH (c:Company {id: 'lagoeiro-e-dutra-ltda'})
CREATE (f)-[:POSSIVEL_VINCULO_FAMILIAR]->(c);

// Adicionar endereço de Formosa
CREATE (a5:Address {
  id: 'formosa-go',
  city: 'Formosa',
  state: 'GO',
  address_type: 'residential',
  type: 'address',
  resident: 'Afonso Henrique Lagoeiro Dutra',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

MATCH (f:Person {id: 'afonso-henrique-lagoeiro-dutra'})
MATCH (a:Address {id: 'formosa-go'})
CREATE (f)-[:RESIDE_EM]->(a);

// Retornar estatísticas
MATCH (n {sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'})
RETURN count(n) as total_nodes;
