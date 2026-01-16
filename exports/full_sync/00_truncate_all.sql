-- ATTENTION: Ce script efface TOUTES les données de la base de production
-- Exécuter en premier avant d'importer les nouvelles données

-- Désactiver les contraintes de clé étrangère temporairement
SET session_replication_role = 'replica';

-- Tronquer toutes les tables (plus rapide que DELETE)
TRUNCATE TABLE pwa_analytics CASCADE;
TRUNCATE TABLE daily_connections CASCADE;
TRUNCATE TABLE session CASCADE;
TRUNCATE TABLE login_activity CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE teacher_grade_submissions CASCADE;
TRUNCATE TABLE bulletin_subject_codes CASCADE;
TRUNCATE TABLE online_courses CASCADE;
TRUNCATE TABLE predefined_appreciations CASCADE;
TRUNCATE TABLE teacher_subject_assignments CASCADE;
TRUNCATE TABLE educafric_numbers CASCADE;
TRUNCATE TABLE role_affiliations CASCADE;
TRUNCATE TABLE archive_access_logs CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE teacher_bulletins CASCADE;
TRUNCATE TABLE fee_audit_logs CASCADE;
TRUNCATE TABLE homework CASCADE;
TRUNCATE TABLE wa_clicks CASCADE;
TRUNCATE TABLE assigned_fees CASCADE;
TRUNCATE TABLE bulletin_verifications CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE archived_documents CASCADE;
TRUNCATE TABLE bulletin_comprehensive CASCADE;
TRUNCATE TABLE fee_notification_queue CASCADE;
TRUNCATE TABLE timetable_slots CASCADE;
TRUNCATE TABLE class_sessions CASCADE;
TRUNCATE TABLE teacher_absences CASCADE;
TRUNCATE TABLE communication_logs CASCADE;
TRUNCATE TABLE educafric_number_counters CASCADE;
TRUNCATE TABLE fee_structures CASCADE;
TRUNCATE TABLE page_visits CASCADE;
TRUNCATE TABLE grades CASCADE;
TRUNCATE TABLE competency_templates CASCADE;
TRUNCATE TABLE teacher_independent_activations CASCADE;
TRUNCATE TABLE safe_zones CASCADE;
TRUNCATE TABLE geolocation_alerts CASCADE;
TRUNCATE TABLE educational_content CASCADE;
TRUNCATE TABLE parent_requests CASCADE;
TRUNCATE TABLE business_partners CASCADE;
TRUNCATE TABLE parent_student_relations CASCADE;
TRUNCATE TABLE tracking_devices CASCADE;
TRUNCATE TABLE teacher_independent_students CASCADE;
TRUNCATE TABLE library_books CASCADE;
TRUNCATE TABLE online_class_activations CASCADE;
TRUNCATE TABLE competency_evaluation_systems CASCADE;
TRUNCATE TABLE timetables CASCADE;
TRUNCATE TABLE bulletins CASCADE;
TRUNCATE TABLE timetable_notifications CASCADE;
TRUNCATE TABLE signatures CASCADE;
TRUNCATE TABLE terms CASCADE;
TRUNCATE TABLE teacher_independent_sessions CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE schools CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Vérification
SELECT 'Tables vidées avec succès' as status;
