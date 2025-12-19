-- Adicionar notas sobre evidências fotográficas
INSERT INTO scarlet_ia_notes (
  id,
  investigation_id,
  user_id,
  content,
  tags,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'c24c2159-d83f-421d-9147-8d723edefaba',
  '286d76d1-a288-44d8-b0ba-a428ff119aef',
  '# 📸 Evidências Fotográficas - Pedro Henrique

## Registros Fotográficos do Investigado

### Foto Principal - Identificação
**Arquivo**: Captura de tela 2025-12-15 154148.png
**Data**: 15/12/2025
**Fonte**: Registro durante investigação

**Características Visuais**:
- Homem, aparenta 38 anos
- Características compatíveis com perfil CPF 001.053.421-06
- Contexto urbano/rural

### Observações Técnicas
- Imagem capturada durante fase de coleta de dados
- Necessário cruzamento com documentos oficiais (RG, CNH)
- Recomenda-se análise facial via Face Recognition

### Próximos Passos
1. Upload da imagem para sistema de reconhecimento facial
2. Comparação com banco de dados de fotos públicas
3. Análise de metadados EXIF (localização, dispositivo)
4. Busca reversa de imagens (Google Images, TinEye)',
  '["evidencia", "foto", "identificacao"]'::jsonb,
  NOW()
),
(
  gen_random_uuid(),
  'c24c2159-d83f-421d-9147-8d723edefaba',
  '286d76d1-a288-44d8-b0ba-a428ff119aef',
  '# 👥 Núcleo Familiar - Identificação

## Membros da Família Identificados

### Mãe: Danielle Ferreira Dutra
- **CPF**: 529.610.741-34
- **Endereço**: Rua do Boto, 237, Goiânia-GO
- **Relação**: Reside no mesmo endereço do investigado

### Irmãos
1. **Giulia Ferreira Dutra** (CPF: 001.053.411-74)
   - Sócia na Agro Dutra Participações
   - Conexão empresarial direta

2. **Luis Afonso Ferreira Dutra** (CPF: 001.053.401-62)
   - Sócio na P & L Intermediações (empresa nova, 2025)
   - Parceiro de negócios ativo

3. **Giovanna Ferreira Dutra** (CPF: 037.491.801-02)
   - Reside no endereço familiar

### Possível Pai: Afonso Henrique Lagoeiro Dutra
- Endereço em Formosa-GO
- Possível conexão com fazendas familiares
- Sobrenome "Lagoeiro Dutra" indica herança empresarial

### Necessidade de Evidências Fotográficas
- Solicitar fotos dos familiares para análise comparativa
- Cruzar com redes sociais (Facebook, Instagram, LinkedIn)
- Verificar presença em eventos públicos/empresariais',
  '["familia", "identificacao", "nucleo"]'::jsonb,
  NOW()
);
