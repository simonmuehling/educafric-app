-- PARTIE 1: ÉCOLES (12 enregistrements)
-- Exécuter en premier dans la base de production

INSERT INTO schools (id, name, address) VALUES (3, 'École Primaire Bilingue Excellence', 'Yaoundé, Centre') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (4, 'Collège Saint-Michel', 'Douala, Littoral') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (5, 'Lycée Technique de Bafoussam', 'Bafoussam, Ouest') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (6, 'Collège Saint-Joseph', '123 Rue de l''Education, Yaoundé, Cameroun') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (10, 'Government Technical High School Kumbo', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (11, 'Government Bilingual High School Mbveh ', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (12, 'Government Technical College Mbah', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (13, 'Government Technical College Kikaikelaki', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (14, 'École de Pierre Akaba', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (15, 'École Test de Pierre Prince Akabo test', 'Yaoundé, Cameroun') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (16, 'Government Bilingual High School Kumbo', '') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;
INSERT INTO schools (id, name, address) VALUES (17, 'Government Bilingual High School down Town Bamenda', 'OLD TOWN BAMENDA') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- Reset sequence
SELECT setval('schools_id_seq', (SELECT MAX(id) FROM schools));
