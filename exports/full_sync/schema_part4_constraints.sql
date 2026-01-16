    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.archive_access_logs
    ADD CONSTRAINT archive_access_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.archived_documents
    ADD CONSTRAINT archived_documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.assigned_fees
    ADD CONSTRAINT assigned_fees_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.audit_log_access_tracking
    ADD CONSTRAINT audit_log_access_tracking_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletin_comprehensive
    ADD CONSTRAINT bulletin_comprehensive_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletin_notifications
    ADD CONSTRAINT bulletin_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletin_subject_codes
    ADD CONSTRAINT bulletin_subject_codes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_short_code_key UNIQUE (short_code);
ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_verification_code_key UNIQUE (verification_code);
ALTER TABLE ONLY public.bulletin_workflow
    ADD CONSTRAINT bulletin_workflow_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulletins
    ADD CONSTRAINT bulletins_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.business_partners
    ADD CONSTRAINT business_partners_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chat_typing_indicators
    ADD CONSTRAINT chat_typing_indicators_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_room_name_key UNIQUE (room_name);
ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.communication_logs
    ADD CONSTRAINT communication_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.competency_evaluation_systems
    ADD CONSTRAINT competency_evaluation_systems_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.competency_templates
    ADD CONSTRAINT competency_templates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.daily_connections
    ADD CONSTRAINT daily_connections_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.device_location_history
    ADD CONSTRAINT device_location_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.educafric_number_counters
    ADD CONSTRAINT educafric_number_counters_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.educafric_number_counters
    ADD CONSTRAINT educafric_number_counters_type_key UNIQUE (type);
ALTER TABLE ONLY public.educafric_numbers
    ADD CONSTRAINT educafric_numbers_educafric_number_key UNIQUE (educafric_number);
ALTER TABLE ONLY public.educafric_numbers
    ADD CONSTRAINT educafric_numbers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_audit_logs
    ADD CONSTRAINT fee_audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_notification_queue
    ADD CONSTRAINT fee_notification_queue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_receipts
    ADD CONSTRAINT fee_receipts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_receipts
    ADD CONSTRAINT fee_receipts_receipt_number_key UNIQUE (receipt_number);
ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.geofence_violations
    ADD CONSTRAINT geofence_violations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.geolocation_alerts
    ADD CONSTRAINT geolocation_alerts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.geolocation_devices
    ADD CONSTRAINT geolocation_devices_device_id_key UNIQUE (device_id);
ALTER TABLE ONLY public.geolocation_devices
    ADD CONSTRAINT geolocation_devices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.grade_review_history
    ADD CONSTRAINT grade_review_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.library_books
    ADD CONSTRAINT library_books_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.library_recommendation_audience
    ADD CONSTRAINT library_recommendation_audience_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.library_recommendation_dispatch
    ADD CONSTRAINT library_recommendation_dispatch_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.library_recommendations
    ADD CONSTRAINT library_recommendations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.login_activity
    ADD CONSTRAINT login_activity_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.monthly_absence_reports
    ADD CONSTRAINT monthly_absence_reports_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.online_class_activations
    ADD CONSTRAINT online_class_activations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.online_class_recurrences
    ADD CONSTRAINT online_class_recurrences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.online_classes_subscriptions
    ADD CONSTRAINT online_classes_subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.online_courses
    ADD CONSTRAINT online_courses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.page_visits
    ADD CONSTRAINT page_visits_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parent_request_notifications
    ADD CONSTRAINT parent_request_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parent_request_responses
    ADD CONSTRAINT parent_request_responses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parent_requests
    ADD CONSTRAINT parent_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parent_student_relations
    ADD CONSTRAINT parent_student_relations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.partnership_communications
    ADD CONSTRAINT partnership_communications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_items
    ADD CONSTRAINT payment_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.predefined_appreciations
    ADD CONSTRAINT predefined_appreciations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pwa_analytics
    ADD CONSTRAINT pwa_analytics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.replacement_notifications
    ADD CONSTRAINT replacement_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.role_affiliations
    ADD CONSTRAINT role_affiliations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.safe_zones
    ADD CONSTRAINT safe_zones_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.school_levels
    ADD CONSTRAINT school_levels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.school_parent_pricing
    ADD CONSTRAINT school_parent_pricing_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.school_parent_pricing
    ADD CONSTRAINT school_parent_pricing_school_id_key UNIQUE (school_id);
ALTER TABLE ONLY public.school_partnership_agreements
    ADD CONSTRAINT school_partnership_agreements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_educafric_number_key UNIQUE (educafric_number);
ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subject_competency_assignments
    ADD CONSTRAINT subject_competency_assignments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_unique UNIQUE (code);
ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_absence_actions
    ADD CONSTRAINT teacher_absence_actions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_absence_notifications
    ADD CONSTRAINT teacher_absence_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_absences_enhanced
    ADD CONSTRAINT teacher_absences_enhanced_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_absences
    ADD CONSTRAINT teacher_absences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_bulletin_preferences
    ADD CONSTRAINT teacher_bulletin_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_bulletin_preferences
    ADD CONSTRAINT teacher_bulletin_preferences_teacher_id_student_id_class_id_key UNIQUE (teacher_id, student_id, class_id, term, academic_year);
ALTER TABLE ONLY public.teacher_bulletins
    ADD CONSTRAINT teacher_bulletins_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_grade_submissions
    ADD CONSTRAINT teacher_grade_submissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_independent_activations
    ADD CONSTRAINT teacher_independent_activations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_independent_payments
    ADD CONSTRAINT teacher_independent_payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_independent_sessions
    ADD CONSTRAINT teacher_independent_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_independent_students
    ADD CONSTRAINT teacher_independent_students_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_notification_preferences
    ADD CONSTRAINT teacher_notification_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_notification_preferences
    ADD CONSTRAINT teacher_notification_preferences_teacher_id_key UNIQUE (teacher_id);
ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_student_invitations
    ADD CONSTRAINT teacher_student_invitations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_subject_assignments
    ADD CONSTRAINT teacher_subject_assignments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_subject_assignments
    ADD CONSTRAINT teacher_subject_assignments_school_id_teacher_id_class_id_s_key UNIQUE (school_id, teacher_id, class_id, subject_id);
ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetable_change_requests
    ADD CONSTRAINT timetable_change_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetable_notifications
    ADD CONSTRAINT timetable_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_school_id_teacher_id_day_of_week_start_time_end__key UNIQUE (school_id, teacher_id, day_of_week, start_time, end_time, academic_year, term);
ALTER TABLE ONLY public.tracking_devices
    ADD CONSTRAINT tracking_devices_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tutorial_progress
    ADD CONSTRAINT tutorial_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tutorial_steps
    ADD CONSTRAINT tutorial_steps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.teacher_grade_submissions
    ADD CONSTRAINT uq_grades_unique_per_year UNIQUE (student_id, subject_id, class_id, school_id, academic_year);
ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_educafric_number_key UNIQUE (educafric_number);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_facebook_id_key UNIQUE (facebook_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.wa_clicks
    ADD CONSTRAINT wa_clicks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.webpush_subscriptions
    ADD CONSTRAINT webpush_subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.whatsapp_faq_knowledge
    ADD CONSTRAINT whatsapp_faq_knowledge_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.whatsapp_quick_replies
    ADD CONSTRAINT whatsapp_quick_replies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.zone_status
    ADD CONSTRAINT zone_status_pkey PRIMARY KEY (id);
CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
CREATE INDEX idx_archive_access_logs_archive ON public.archive_access_logs USING btree (archive_id, school_id);
--
    ADD CONSTRAINT class_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.online_courses(id);
ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.online_courses(id);
ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.business_partners(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.library_recommendation_audience
    ADD CONSTRAINT library_recommendation_audience_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.library_recommendations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.library_recommendation_dispatch
    ADD CONSTRAINT library_recommendation_dispatch_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.library_recommendations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.library_recommendations
    ADD CONSTRAINT library_recommendations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.library_books(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_activation_id_fkey FOREIGN KEY (activation_id) REFERENCES public.online_class_activations(id);
ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id);
ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.partnership_communications
    ADD CONSTRAINT partnership_communications_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.school_partnership_agreements(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.school_partnership_agreements
    ADD CONSTRAINT school_partnership_agreements_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.business_partners(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.timetable_notifications
    ADD CONSTRAINT timetable_notifications_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id);
