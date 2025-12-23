WITH target_dossier AS (
    SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
)
SELECT content FROM dossier_notes WHERE dossier_id = (SELECT id FROM target_dossier);
