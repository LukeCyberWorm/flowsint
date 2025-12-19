-- Adicionar coluna is_public e atualizar dossiê
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Tornar o dossiê público
UPDATE dossiers 
SET is_public = true 
WHERE access_token = 'SRS-CASO12112025-2025';

-- Verificar
SELECT id, case_number, access_token, is_public FROM dossiers;
