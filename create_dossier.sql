-- Criar dossiê completo do Caso 12112025 na tabela analyses
INSERT INTO analyses (
  id,
  title,
  description,
  created_at,
  investigation_id,
  owner_id
) VALUES (
  gen_random_uuid(),
  'Dossiê Completo - Pedro Henrique Ferreira Dutra (CASO-12112025)',
  '# Investigação Profunda: Pedro Henrique Ferreira Dutra

## Dados do Investigado
- **Nome Completo**: Pedro Henrique Ferreira Dutra
- **CPF**: 001.053.421-06
- **Data de Nascimento**: 03/02/1987 (38 anos)
- **Naturalidade**: Campo Grande, MS
- **Mãe**: Danielle Ferreira Dutra (CPF: 529.610.741-34)

## Núcleo Familiar
- **Mãe**: Danielle Ferreira Dutra
- **Irmãos**: Giulia, Giovanna, Luis Afonso Ferreira Dutra
- **Possível Pai**: Afonso Henrique Lagoeiro Dutra

## Endereços Confirmados

### Residência Principal (Urbana)
**Rua do Boto, 237 - Jardim Atlântico, Goiânia-GO, CEP 74.343-250**
- Telefones: (62) 3203-9399, (62) 98437-6668
- Status: ATIVO (compartilhado com família)

### Propriedades Rurais
1. **Fazenda Poções, BR-020 Km 116, Flores de Goiás-GO**
   - Sede da Agro Dutra Participações Ltda
   - 152 módulos fiscais
   
2. **Fazenda Marta, Naviraí-MS**
   - Menção recente (19/12/2025)
   - Possível propriedade ativa

## Empresas

### Agro Dutra Participações Ltda
- **CNPJ**: 32.983.200/0001-06
- **Abertura**: 11/03/2019
- **Atividade**: Comércio atacadista de animais vivos
- **Sócios**: Pedro Henrique (administrador), Giulia Ferreira Dutra

### P & L Intermediações Ltda
- **CNPJ**: 58.854.311/0001-06
- **Abertura**: 14/01/2025 (NOVA)
- **Atividade**: Intermediação em agenciamento
- **Sócios**: Pedro Henrique, Luis Afonso Ferreira Dutra

## Rastros Digitais
- **Email**: phferreiradutra@hotmail.com
- **Twitter**: @tiuphvalle (não confirmado 100%)
- **Atividade recente**: Posts sobre futebol (Flamengo, Libertadores)

## Perfil Econômico
- **Renda estimada**: R$ 5.572
- **Perfil de consumo**: Luxo (cartão black, investimentos, previdência privada)
- **Banco**: Banco do Brasil (agência 2010)

## Timeline de Eventos
- 03/02/1987: Nascimento em Campo Grande-MS
- 2008: Vestibular UFG (Agronomia, Goiânia)
- 11/03/2019: Sócio Agro Dutra Participações
- 09/07/2021: Vacinação COVID em Vila Boa-GO
- 14/01/2025: P & L Intermediações (nova empresa)
- 12/11/2025: Atividade Twitter (Libertadores)

## Análise e Conclusões
- **Probabilidade de localização**: 70% Goiânia/Flores de Goiás
- **Perfil**: Discreto, baixa exposição digital
- **Padrão**: Base urbana em Goiânia, deslocamentos rurais
- **Riscos**: Processos judiciais em Flores de Goiás (patrimônio)',
  NOW(),
  'c24c2159-d83f-421d-9147-8d723edefaba',
  '286d76d1-a288-44d8-b0ba-a428ff119aef'
) RETURNING id;
