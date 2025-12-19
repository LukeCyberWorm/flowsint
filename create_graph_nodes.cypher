// Criar node principal - Pedro Henrique
CREATE (p:Person {
  id: 'pedro-henrique-ferreira-dutra',
  name: 'Pedro Henrique Ferreira Dutra',
  cpf: '001.053.421-06',
  birth_date: '1987-02-03',
  email: 'phferreiradutra@hotmail.com',
  twitter: '@tiuphvalle',
  type: 'subject',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

// Família
CREATE (m:Person {
  id: 'danielle-ferreira-dutra',
  name: 'Danielle Ferreira Dutra',
  cpf: '529.610.741-34',
  relationship: 'mother',
  type: 'family',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (s1:Person {
  id: 'giulia-ferreira-dutra',
  name: 'Giulia Ferreira Dutra',
  cpf: '001.053.411-74',
  relationship: 'sister',
  type: 'family',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (s2:Person {
  id: 'giovanna-ferreira-dutra',
  name: 'Giovanna Ferreira Dutra',
  cpf: '037.491.801-02',
  relationship: 'sister',
  type: 'family',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (b:Person {
  id: 'luis-afonso-ferreira-dutra',
  name: 'Luis Afonso Ferreira Dutra',
  cpf: '001.053.401-62',
  relationship: 'brother',
  type: 'family',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (f:Person {
  id: 'afonso-henrique-lagoeiro-dutra',
  name: 'Afonso Henrique Lagoeiro Dutra',
  relationship: 'father',
  type: 'family',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

// Empresas
CREATE (c1:Company {
  id: 'agro-dutra-participacoes',
  name: 'Agro Dutra Participações Ltda',
  cnpj: '32.983.200/0001-06',
  founded: '2019-03-11',
  activity: 'Comércio atacadista de animais vivos',
  status: 'ATIVA',
  type: 'company',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (c2:Company {
  id: 'p-l-intermediacoes',
  name: 'P & L Intermediações Ltda',
  cnpj: '58.854.311/0001-06',
  founded: '2025-01-14',
  activity: 'Intermediação em agenciamento',
  status: 'ATIVA',
  type: 'company',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

// Endereços
CREATE (a1:Address {
  id: 'rua-do-boto-goiania',
  street: 'Rua do Boto, 237',
  neighborhood: 'Jardim Atlântico',
  city: 'Goiânia',
  state: 'GO',
  cep: '74.343-250',
  phones: '(62) 3203-9399, (62) 98437-6668',
  address_type: 'urban',
  status: 'ATIVO',
  type: 'address',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (a2:Address {
  id: 'fazenda-pocoes',
  name: 'Fazenda Poções',
  street: 'BR-020 Km 116',
  city: 'Flores de Goiás',
  state: 'GO',
  cep: '73.890-000',
  address_type: 'rural',
  fiscal_modules: '152',
  type: 'address',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (a3:Address {
  id: 'fazenda-marta',
  name: 'Fazenda Marta',
  city: 'Naviraí',
  state: 'MS',
  address_type: 'rural',
  type: 'address',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

CREATE (a4:Address {
  id: 'marzagao',
  street: 'Rua M 3',
  city: 'Marzagão',
  state: 'GO',
  cep: '75.670-000',
  address_type: 'commercial',
  type: 'address',
  sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'
});

// Relacionamentos
MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (m:Person {id: 'danielle-ferreira-dutra'})
CREATE (p)-[:FILHO_DE]->(m);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (s:Person {id: 'giulia-ferreira-dutra'})
CREATE (p)-[:IRMAO_DE]->(s);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (s:Person {id: 'giovanna-ferreira-dutra'})
CREATE (p)-[:IRMAO_DE]->(s);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (b:Person {id: 'luis-afonso-ferreira-dutra'})
CREATE (p)-[:IRMAO_DE]->(b);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (f:Person {id: 'afonso-henrique-lagoeiro-dutra'})
CREATE (p)-[:POSSIVEL_FILHO_DE]->(f);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (c:Company {id: 'agro-dutra-participacoes'})
CREATE (p)-[:SOCIO_ADMINISTRADOR {since: '2019-03-11'}]->(c);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (c:Company {id: 'p-l-intermediacoes'})
CREATE (p)-[:SOCIO_ADMINISTRADOR {since: '2025-01-14'}]->(c);

MATCH (s:Person {id: 'giulia-ferreira-dutra'})
MATCH (c:Company {id: 'agro-dutra-participacoes'})
CREATE (s)-[:SOCIA]->(c);

MATCH (b:Person {id: 'luis-afonso-ferreira-dutra'})
MATCH (c:Company {id: 'p-l-intermediacoes'})
CREATE (b)-[:SOCIO]->(c);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (a:Address {id: 'rua-do-boto-goiania'})
CREATE (p)-[:RESIDE_EM {status: 'ATIVO'}]->(a);

MATCH (m:Person {id: 'danielle-ferreira-dutra'})
MATCH (a:Address {id: 'rua-do-boto-goiania'})
CREATE (m)-[:RESIDE_EM]->(a);

MATCH (c:Company {id: 'agro-dutra-participacoes'})
MATCH (a:Address {id: 'fazenda-pocoes'})
CREATE (c)-[:SEDE]->(a);

MATCH (c:Company {id: 'p-l-intermediacoes'})
MATCH (a:Address {id: 'marzagao'})
CREATE (c)-[:SEDE]->(a);

MATCH (p:Person {id: 'pedro-henrique-ferreira-dutra'})
MATCH (a:Address {id: 'fazenda-marta'})
CREATE (p)-[:POSSIVEL_PROPRIEDADE]->(a);

// Retornar contagem
MATCH (n {sketch_id: 'd90fdceb-9e77-425c-b5f1-a9e052dc51a1'})
RETURN count(n) as total_nodes;
