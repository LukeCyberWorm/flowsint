-- Pegar IDs necessários
SELECT id as user_id FROM profiles WHERE email = 'lucas.oliveira@scarletredsolutions.com';
SELECT id as investigation_id FROM investigations WHERE name LIKE '%12112025%' ORDER BY created_at DESC LIMIT 1;
