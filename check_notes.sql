SELECT count(*) as notes_count, string_agg(substring(content from 1 for 50), ' | ') as note_previews 
FROM dossier_notes 
WHERE dossier_id = (SELECT id FROM dossiers WHERE access_token = 'SRS-CASO12112025-2025');
