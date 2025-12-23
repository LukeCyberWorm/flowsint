SELECT 
    d.access_token, 
    d.investigation_id, 
    i.name as inv_name, 
    (SELECT count(*) FROM sketches s WHERE s.investigation_id = i.id) as sketches_count,
    (SELECT string_agg(title, ', ') FROM sketches s WHERE s.investigation_id = i.id) as sketch_titles,
    (SELECT count(*) FROM analyses a WHERE a.investigation_id = i.id) as analyses_count,
    (SELECT string_agg(title, ', ') FROM analyses a WHERE a.investigation_id = i.id) as analyses_titles
FROM dossiers d 
JOIN investigations i ON d.investigation_id = i.id 
WHERE d.access_token IN ('SRS-CASO12112025-2025', 'CASO-MOTO-2025-vB3kL9mPq8wN');
