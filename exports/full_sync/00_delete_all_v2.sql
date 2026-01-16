-- Version 2 - Ordre correct pour les clés étrangères
-- Supprimer les tables enfants AVANT les tables parents

-- Niveau 1: Tables sans dépendances ou dépendances déjà supprimées
DELETE FROM pwa_analytics;
DELETE FROM daily_connections;
DELETE FROM session;
DELETE FROM login_activity;
DELETE FROM wa_clicks;
DELETE FROM page_visits;
DELETE FROM archive_access_logs;

-- Niveau 2: Tables avec FK vers users/classes/subjects
DELETE FROM class_sessions;
DELETE FROM online_class_activations;
DELETE FROM online_courses;
DELETE FROM timetable_notifications;
DELETE FROM timetable_slots;
DELETE FROM timetables;
DELETE FROM teacher_grade_submissions;
DELETE FROM bulletin_subject_codes;
DELETE FROM bulletin_verifications;
DELETE FROM bulletin_comprehensive;
DELETE FROM bulletins;
DELETE FROM teacher_bulletins;
DELETE FROM grades;
DELETE FROM attendance;
DELETE FROM homework;
DELETE FROM notifications;
DELETE FROM messages;
DELETE FROM communication_logs;
DELETE FROM teacher_absences;
DELETE FROM signatures;

-- Niveau 3: Tables financières et administratives
DELETE FROM fee_audit_logs;
DELETE FROM fee_notification_queue;
DELETE FROM assigned_fees;
DELETE FROM fee_structures;

-- Niveau 4: Tables de configuration
DELETE FROM predefined_appreciations;
DELETE FROM competency_templates;
DELETE FROM competency_evaluation_systems;
DELETE FROM educational_content;
DELETE FROM library_books;
DELETE FROM terms;
DELETE FROM archived_documents;

-- Niveau 5: Tables enseignants indépendants
DELETE FROM teacher_independent_sessions;
DELETE FROM teacher_independent_activations;
DELETE FROM teacher_independent_students;

-- Niveau 6: Géolocalisation
DELETE FROM geolocation_alerts;
DELETE FROM safe_zones;
DELETE FROM tracking_devices;

-- Niveau 7: Relations et affiliations
DELETE FROM parent_requests;
DELETE FROM parent_student_relations;
DELETE FROM teacher_subject_assignments;
DELETE FROM role_affiliations;
DELETE FROM educafric_numbers;
DELETE FROM educafric_number_counters;
DELETE FROM business_partners;

-- Niveau 8: Tables principales (ordre important)
DELETE FROM enrollments;
DELETE FROM subjects;
DELETE FROM classes;
DELETE FROM users;
DELETE FROM schools;

SELECT 'Toutes les tables ont été vidées' as status;
