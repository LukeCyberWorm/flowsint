-- Criar tabela de dossiês com sistema de acesso
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  client_name TEXT,
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  access_token VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_dossiers_investigation_id ON dossiers(investigation_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_access_token ON dossiers(access_token);

-- Criar tabela de arquivos do dossiê
CREATE TABLE IF NOT EXISTS dossier_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type VARCHAR(50),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_dossier_files_dossier_id ON dossier_files(dossier_id);

-- Criar tabela de notas do dossiê
CREATE TABLE IF NOT EXISTS dossier_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_dossier_notes_dossier_id ON dossier_notes(dossier_id);

-- Inserir dossiê do caso 12112025 com token de acesso
INSERT INTO dossiers (
  case_number,
  title,
  description,
  status,
  client_name,
  investigation_id,
  access_token,
  created_by
) VALUES (
  'CASO-12112025',
  'Dossiê Completo - Pedro Henrique Ferreira Dutra',
  '**CPF**: 001.053.421-06 | **Nascimento**: 03/02/1987 | **Localização Principal**: Goiânia-GO

## Resumo Executivo
Investigação profunda sobre Pedro Henrique Ferreira Dutra, empresário do setor agropecuário com atuação em Goiás e Mato Grosso do Sul. Perfil discreto, sócio de 2 empresas ativas, com núcleo familiar estruturado e propriedades rurais confirmadas.

## Dados Principais
- **Endereço**: Rua do Boto, 237 - Jardim Atlântico, Goiânia-GO
- **Empresas**: Agro Dutra Participações (2019) | P & L Intermediações (2025)
- **Propriedades**: Fazenda Poções (Flores de Goiás), Fazenda Marta (Naviraí-MS)
- **Família**: Danielle (mãe), Giulia, Giovanna, Luis Afonso (irmãos), Afonso (pai provável)

## Status da Investigação
- ✅ Dados cadastrais confirmados
- ✅ Endereços verificados
- ✅ Empresas ativas localizadas
- ✅ Núcleo familiar mapeado
- ✅ Grafo de relacionamentos completo
- ⏳ Diligência presencial pendente',
  'active',
  'Scarlet Red Solutions',
  'c24c2159-d83f-421d-9147-8d723edefaba',
  'SRS-CASO12112025-2025',
  '286d76d1-a288-44d8-b0ba-a428ff119aef'
) RETURNING id, access_token;
