-- Inspecting analyses for the working case
WITH target_dossier AS (
    SELECT investigation_id FROM dossiers WHERE access_token = 'SRS-CASO12112025-2025'
)
SELECT 
    'ANALYSIS' as type,
    a.id, a.title, a.content
FROM analyses a
JOIN target_dossier td ON a.investigation_id = td.investigation_id;
