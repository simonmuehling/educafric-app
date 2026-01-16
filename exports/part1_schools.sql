-- EDUCAFRIC DATABASE EXPORT
-- Generated: Fri Jan 16 07:49:49 AM UTC 2026

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

-- USERS
INSERT INTO users (id, email, password, role, first_name, last_name, phone, school_id, is_active) VALUES (2, 'consolidation-test@educafric.com', '$2b$12$nQ.2DJMltLPIiN3ebw4z/.aJGowlAGbTD5eH5lW1aR8REB3e6x8uK', 'Student', 'Consolidation', 'Test', '', NULL, true) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, school_id = EXCLUDED.school_id, is_active = EXCLUDED.is_active;
INSERT INTO users (id, email, password, role, first_name, last_name, phone, school_id, is_active) VALUES (3, 'healthcheck@example.com', '$2b$12$J1EdqBHGt9LB5V1UaOB8xO71L4IxIcQHUyjFZXDpkqbPuKOlhyHNW', 'Student', 'Health', 'Check', '', NULL, true) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, school_id = EXCLUDED.school_id, is_active = EXCLUDED.is_active;
INSERT INTO users (id, email, password, role, first_name, last_name, phone, school_id, is_active) VALUES (9, 'simon.admin@educafric.com', '$2b$12$5pO57kp6c92NyYwPuX.Di.TSF3TuS/1MJVnjCA/cw5fe3qj//Op02', 'SiteAdmin', 'Simon', 'Admin', '', NULL, true) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, school_id = EXCLUDED.school_id, is_active = EXCLUDED.is_active;
