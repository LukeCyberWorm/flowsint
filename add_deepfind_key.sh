#!/bin/bash

# Script para adicionar a chave DEEPFIND_API_KEY no vault do FlowsInt

DEEPFIND_KEY="sk-306d377afbe440389bc68afbaff1f7de"

# Conectar ao banco e inserir a secret
docker exec flowsint-postgres-prod psql -U flowsint -d flowsint -c "
INSERT INTO investigation_api_keys (investigation_id, key_name, encrypted_value, created_at, updated_at)
SELECT 
    i.id,
    'DEEPFIND_API_KEY',
    '$DEEPFIND_KEY',
    NOW(),
    NOW()
FROM investigations i
WHERE NOT EXISTS (
    SELECT 1 FROM investigation_api_keys iak
    WHERE iak.investigation_id = i.id AND iak.key_name = 'DEEPFIND_API_KEY'
)
LIMIT 1;
"

echo "Chave DEEPFIND_API_KEY adicionada ao vault!"
