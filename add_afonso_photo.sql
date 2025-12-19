-- Adicionar nota com foto de Afonso Henrique Lagoeiro Dutra
INSERT INTO scarlet_ia_notes (
  id,
  investigation_id,
  user_id,
  content,
  tags,
  created_at
) VALUES (
  gen_random_uuid(),
  'c24c2159-d83f-421d-9147-8d723edefaba',
  '286d76d1-a288-44d8-b0ba-a428ff119aef',
  '# 📷 Foto Identificada - Afonso Henrique Lagoeiro Dutra (Possível Pai)

## Dados da Evidência Fotográfica
- **Identificado como**: Afonso Henrique Lagoeiro Dutra
- **Relação com investigado**: Pai (possível) de Pedro Henrique Ferreira Dutra
- **Data de registro**: 19/12/2025
- **Arquivo**: afonso-lagoeiro-dutra.jpg

## Análise Visual
**Características Físicas**:
- Homem, aproximadamente 60-65 anos
- Cabelos grisalhos nas laterais, escuros no topo
- Pele clara/morena
- Olhar para baixo (foto casual)
- Camisa vermelha/coral
- Corrente no pescoço
- Ambiente residencial (quadro com vela na parede)

**Contexto**:
- Foto aparenta ser de videochamada ou selfie
- Ambiente doméstico, possivelmente residência em Formosa-GO
- Expressão neutra/relaxada

## Conexões com a Investigação

### Vínculo Familiar
- **Nome**: Afonso Henrique Lagoeiro Dutra
- **CPF**: (A confirmar)
- **Endereço conhecido**: Formosa-GO
- **Sobrenome**: "Lagoeiro Dutra" indica herança familiar empresarial

### Vínculos Empresariais Indiretos
- Possível conexão com **Lagoeiro e Dutra Ltda** (CNPJ 13.827.900/0001-59, Porto Velho-RO)
- Sócios incluem Claudia Lagoeiro Dutra Harger
- Padrão familiar: Empresas agropecuárias/rurais

### Propriedades Compartilhadas (Hipótese)
- **Fazenda Poções** (Flores de Goiás-GO) - Sede da Agro Dutra
- Possível herança ou parceria não declarada com Pedro Henrique
- Conexão geográfica: Formosa-GO ↔ Flores de Goiás (~100km)

## Próximas Ações Recomendadas
1. ✅ **Face Recognition**: Upload da foto para busca em bancos públicos
2. 📋 **Receita Federal**: Confirmar CPF e vínculos empresariais
3. 🏢 **Cartórios**: Buscar matrículas de imóveis em nome de Afonso
4. 🔍 **Redes Sociais**: Pesquisar perfis (Facebook, LinkedIn)
5. 🏛️ **Processos Judiciais**: Verificar ações em Formosa-GO ou Goiás

## Observações de Segurança
- Foto obtida durante investigação autorizada
- Uso restrito para fins de identificação e análise
- Não divulgar sem autorização legal

---
**Status**: Evidência confirmada | **Prioridade**: ALTA | **Ação**: Cruzar com documentos oficiais',
  '["evidencia", "foto", "familia", "pai", "afonso"]'::jsonb,
  NOW()
);
