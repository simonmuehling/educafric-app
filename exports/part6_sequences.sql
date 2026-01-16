INSERT INTO enrollments (id, student_id, class_id) VALUES (1326, 541, 210) ON CONFLICT (id) DO NOTHING;
INSERT INTO enrollments (id, student_id, class_id) VALUES (1329, 549, 92) ON CONFLICT (id) DO NOTHING;
INSERT INTO enrollments (id, student_id, class_id) VALUES (1331, 500, 212) ON CONFLICT (id) DO NOTHING;

-- RESET SEQUENCES
SELECT setval('schools_id_seq', (SELECT COALESCE(MAX(id), 1) FROM schools));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('classes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM classes));
SELECT setval('subjects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM subjects));
SELECT setval('enrollments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM enrollments));
