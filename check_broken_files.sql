WITH target_dossier AS (
    SELECT id FROM dossiers WHERE access_token = 'CASO-MOTO-2025-vB3kL9mPq8wN'
)
SELECT file_name, file_url FROM dossier_files WHERE dossier_id = (SELECT id FROM target_dossier);
