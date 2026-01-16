-- Réinitialiser les séquences
SELECT setval('schools_id_seq', (SELECT COALESCE(MAX(id), 1) FROM schools));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('classes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM classes));
SELECT setval('subjects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM subjects));
SELECT setval('enrollments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM enrollments));
SELECT setval('teacher_subject_assignments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM teacher_subject_assignments));
SELECT setval('role_affiliations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM role_affiliations));
SELECT setval('parent_student_relations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM parent_student_relations));
