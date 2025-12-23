-- Inspecting the working case structure
WITH target_dossier AS (
    SELECT investigation_id FROM dossiers WHERE access_token = 'SRS-CASO12112025-2025'
)
SELECT 
    'INVESTIGATION' as type,
    i.id, i.name, i.description
FROM investigations i
JOIN target_dossier td ON i.id = td.investigation_id

UNION ALL

SELECT 
    'SKETCH' as type,
    s.id, s.title, s.description
FROM sketches s
JOIN target_dossier td ON s.investigation_id = td.investigation_id

UNION ALL

SELECT 
    'PROFILE_LINK' as type,
    sp.sketch_id, sp.profile_id::text, ''
FROM sketches_profiles sp
JOIN sketches s ON sp.sketch_id = s.id
JOIN target_dossier td ON s.investigation_id = td.investigation_id

UNION ALL

SELECT 
    'PROFILE' as type,
    p.id, p.first_name, p.last_name
FROM profiles p
WHERE p.id IN (
    SELECT sp.profile_id 
    FROM sketches_profiles sp
    JOIN sketches s ON sp.sketch_id = s.id
    JOIN target_dossier td ON s.investigation_id = td.investigation_id
);
