CREATE TABLE "annual_report_comprehensive" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"student_matricule" text,
	"student_first_name" text,
	"student_last_name" text,
	"student_gender" text,
	"student_date_of_birth" text,
	"student_place_of_birth" text,
	"student_nationality" text,
	"guardian_name" text,
	"guardian_phone" text,
	"student_photo" text,
	"class_name" text,
	"homeroom_teacher_name" text,
	"class_size" integer,
	"school_registration_number" text,
	"school_name" text,
	"school_region" text,
	"school_department" text,
	"school_logo" text,
	"template_type" text DEFAULT 'ministry_standard',
	"language" text DEFAULT 'fr',
	"trimester1_average" numeric(5, 2),
	"trimester1_rank" text,
	"trimester1_total_students" integer,
	"trimester1_subject_count" integer,
	"trimester1_passed_subjects" integer,
	"trimester1_teacher_observations" text,
	"trimester2_average" numeric(5, 2),
	"trimester2_rank" text,
	"trimester2_total_students" integer,
	"trimester2_subject_count" integer,
	"trimester2_passed_subjects" integer,
	"trimester2_teacher_observations" text,
	"trimester3_average" numeric(5, 2),
	"trimester3_rank" text,
	"trimester3_total_students" integer,
	"trimester3_subject_count" integer,
	"trimester3_passed_subjects" integer,
	"trimester3_teacher_observations" text,
	"annual_average" numeric(5, 2) NOT NULL,
	"annual_rank" text NOT NULL,
	"final_decision" text NOT NULL,
	"principal_observations" text,
	"parent_observations" text,
	"holiday_recommendations" text,
	"trimester1_justified_absences" integer DEFAULT 0,
	"trimester1_unjustified_absences" integer DEFAULT 0,
	"trimester1_lates" integer DEFAULT 0,
	"trimester1_sanctions" integer DEFAULT 0,
	"trimester2_justified_absences" integer DEFAULT 0,
	"trimester2_unjustified_absences" integer DEFAULT 0,
	"trimester2_lates" integer DEFAULT 0,
	"trimester2_sanctions" integer DEFAULT 0,
	"trimester3_justified_absences" integer DEFAULT 0,
	"trimester3_unjustified_absences" integer DEFAULT 0,
	"trimester3_lates" integer DEFAULT 0,
	"trimester3_sanctions" integer DEFAULT 0,
	"parent_visa" jsonb,
	"teacher_visa" jsonb,
	"headmaster_visa" jsonb,
	"status" text DEFAULT 'draft',
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"signed_at" timestamp,
	"sent_at" timestamp,
	"archived_at" timestamp,
	"approved_by" integer,
	"sent_by" integer,
	"verification_code" text,
	"pdf_url" text,
	"pdf_size_bytes" integer,
	"pdf_checksum_sha256" text,
	"notifications_sent" jsonb,
	"last_notified_at" timestamp,
	"notification_meta" jsonb,
	"entered_by" integer,
	"last_modified_by" integer,
	"data_source" text DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archive_access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"archive_id" integer,
	"school_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archived_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"type" text NOT NULL,
	"bulletin_id" integer,
	"class_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"student_id" integer,
	"language" text NOT NULL,
	"filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"checksum_sha256" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"recipients" jsonb,
	"snapshot" jsonb,
	"meta" jsonb,
	"version" text DEFAULT '1.0',
	"sent_at" timestamp NOT NULL,
	"sent_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"status" text NOT NULL,
	"time_in" timestamp,
	"time_out" timestamp,
	"notes" text,
	"marked_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance_automation" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_comprehensive" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"student_matricule" text,
	"student_first_name" text,
	"student_last_name" text,
	"student_gender" text,
	"student_date_of_birth" text,
	"student_place_of_birth" text,
	"student_nationality" text,
	"school_region" text,
	"school_subdivision" text,
	"is_repeater" boolean DEFAULT false,
	"student_photo" text,
	"guardian_name" text,
	"guardian_phone" text,
	"class_name" text,
	"homeroom_teacher_name" text,
	"class_size" integer,
	"school_registration_number" text,
	"template_type" text DEFAULT 'standard',
	"language" text DEFAULT 'fr',
	"total_coefficient" integer,
	"student_rank" integer,
	"overall_grade" text,
	"class_average" numeric(5, 2),
	"class_max" numeric(5, 2),
	"class_min" numeric(5, 2),
	"conduct_grade_out_of_20" numeric(5, 2),
	"unjustified_absence_count" integer DEFAULT 0,
	"justified_absence_count" integer DEFAULT 0,
	"unjustified_absence_hours" numeric(5, 2) DEFAULT '0.00',
	"justified_absence_hours" numeric(5, 2) DEFAULT '0.00',
	"lateness_count" integer DEFAULT 0,
	"detention_hours" numeric(5, 2) DEFAULT '0.00',
	"conduct_warning" boolean DEFAULT false,
	"conduct_blame" boolean DEFAULT false,
	"exclusion_days" integer DEFAULT 0,
	"permanent_exclusion" boolean DEFAULT false,
	"total_general" numeric(8, 2),
	"general_average" numeric(5, 2),
	"number_of_averages" integer,
	"success_rate" numeric(5, 2),
	"class_profile" jsonb,
	"work_appreciation" text,
	"general_comment" text,
	"parent_visa" jsonb,
	"teacher_visa" jsonb,
	"headmaster_visa" jsonb,
	"class_council_decisions" text,
	"class_council_mentions" text,
	"orientation_recommendations" text,
	"council_date" text,
	"council_participants" text,
	"entered_by" integer,
	"last_modified_by" integer,
	"data_source" text DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'draft',
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"sent_at" timestamp,
	"approved_by" integer,
	"notifications_sent" jsonb
);
--> statement-breakpoint
CREATE TABLE "bulletin_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"bulletin_id" integer NOT NULL,
	"recipient_type" text NOT NULL,
	"recipient_id" integer NOT NULL,
	"recipient_email" text,
	"recipient_phone" text,
	"email_sent" boolean DEFAULT false,
	"sms_sent" boolean DEFAULT false,
	"whatsapp_sent" boolean DEFAULT false,
	"push_notification_sent" boolean DEFAULT false,
	"email_delivered" boolean DEFAULT false,
	"sms_delivered" boolean DEFAULT false,
	"whatsapp_delivered" boolean DEFAULT false,
	"email_opened" boolean DEFAULT false,
	"email_opened_at" timestamp,
	"bulletin_downloaded" boolean DEFAULT false,
	"bulletin_downloaded_at" timestamp,
	"bulletin_viewed" boolean DEFAULT false,
	"bulletin_viewed_at" timestamp,
	"notification_language" text DEFAULT 'fr',
	"delivery_metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"language" text DEFAULT 'fr',
	"show_photos" boolean DEFAULT true,
	"show_qr_code" boolean DEFAULT true,
	"general_subjects" jsonb,
	"professional_subjects" jsonb,
	"other_subjects" jsonb,
	"excellent_threshold" numeric DEFAULT '16.00',
	"good_threshold" numeric DEFAULT '12.00',
	"average_threshold" numeric DEFAULT '10.00',
	"school_motto" text,
	"principal_name" text,
	"principal_signature_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulletin_settings_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "bulletin_signatories" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"principal_name" text NOT NULL,
	"principal_title" text NOT NULL,
	"principal_signature_url" text,
	"secondary_name" text,
	"secondary_title" text,
	"secondary_signature_url" text,
	"school_seal_url" text,
	"show_principal_signature" boolean DEFAULT true,
	"show_secondary_signature" boolean DEFAULT false,
	"show_school_seal" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulletin_signatories_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "bulletin_subject_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"bulletin_comprehensive_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"subject_name" text NOT NULL,
	"teacher_name" text,
	"competencies" text,
	"mark_out_of_20" numeric(5, 2),
	"coefficient" integer DEFAULT 1,
	"weighted_mark" numeric(8, 2),
	"letter_grade" text,
	"teacher_remarks" text,
	"subject_class_average" numeric(5, 2),
	"subject_rank" integer,
	"ctba" numeric(5, 2),
	"cba" numeric(5, 2),
	"ca" numeric(5, 2),
	"cma" numeric(5, 2),
	"cna" text,
	"min_grade" numeric(5, 2),
	"max_grade" numeric(5, 2),
	"competency_level" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_workflow" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"current_status" text DEFAULT 'awaiting_teacher_submissions' NOT NULL,
	"total_subjects" integer NOT NULL,
	"completed_subjects" integer DEFAULT 0,
	"missing_subjects" jsonb,
	"bulletin_id" integer,
	"auto_generate_bulletin" boolean DEFAULT true,
	"notify_on_complete" boolean DEFAULT true,
	"grades_deadline" timestamp,
	"review_deadline" timestamp,
	"reminders_sent" integer DEFAULT 0,
	"last_reminder_sent" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletins" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"teacher_id" integer,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp,
	"sent_at" timestamp,
	"approved_by" integer,
	"sent_by" integer,
	"general_average" numeric(5, 2),
	"class_rank" integer,
	"total_students_in_class" integer,
	"teacher_comments" text,
	"director_comments" text,
	"work_appreciation" text,
	"conduct_appreciation" text,
	"pdf_url" text,
	"digital_signature_hash" text,
	"qr_code" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"section" text,
	"max_students" integer,
	"school_id" integer NOT NULL,
	"teacher_id" integer,
	"academic_year_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commercial_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"commercial_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"school_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"communication_type" text,
	"content" text,
	"status" text DEFAULT 'sent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competency_evaluation_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"language" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"levels" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competency_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer,
	"created_by" integer NOT NULL,
	"subject_name" text NOT NULL,
	"term" text NOT NULL,
	"class_level" text,
	"competencies_fr" text NOT NULL,
	"competencies_en" text NOT NULL,
	"learning_objectives" jsonb,
	"evaluation_criteria" jsonb,
	"is_active" boolean DEFAULT true,
	"is_global" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_email" text NOT NULL,
	"user_role" text NOT NULL,
	"user_name" text NOT NULL,
	"ip_address" text NOT NULL,
	"location" jsonb,
	"user_agent" text,
	"connection_date" timestamp DEFAULT now(),
	"session_id" text,
	"access_method" text DEFAULT 'web',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_location_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"accuracy" text,
	"address" text,
	"battery_level" integer,
	"speed" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "educafric_number_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"current_counter" integer DEFAULT 0 NOT NULL,
	"last_generated" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "educafric_number_counters_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "educafric_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"educafric_number" text NOT NULL,
	"type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"issued_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "educafric_numbers_educafric_number_unique" UNIQUE("educafric_number")
);
--> statement-breakpoint
CREATE TABLE "email_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"enable_emails" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"type" text,
	"alert_type" text,
	"message" text,
	"latitude" text,
	"longitude" text,
	"location" jsonb,
	"severity" text,
	"is_read" boolean DEFAULT false,
	"is_resolved" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelancer_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer NOT NULL,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'freemium' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"payment_method" text,
	"last_payment_date" timestamp,
	"next_payment_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"max_students" integer DEFAULT 10,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geofence_violations" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"violation_type" text,
	"location" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grade_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"term_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"coefficient" numeric(3, 1) DEFAULT '1.0',
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1,
	"comment" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"returned_by" integer,
	"returned_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "grade_entries_school_id_student_id_class_id_subject_id_term_id_teacher_id_version_unique" UNIQUE("school_id","student_id","class_id","subject_id","term_id","teacher_id","version")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"grade" numeric(5, 2),
	"coefficient" integer DEFAULT 1,
	"exam_type" text DEFAULT 'evaluation',
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_grade_student_subject_term_core" UNIQUE("student_id","subject_id","term","academic_year")
);
--> statement-breakpoint
CREATE TABLE "grading_scales" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"name" text NOT NULL,
	"min" numeric(5, 2) NOT NULL,
	"max" numeric(5, 2) NOT NULL,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "homework" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructions" text,
	"teacher_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"priority" text DEFAULT 'medium',
	"due_date" timestamp,
	"assigned_date" timestamp DEFAULT now(),
	"status" text DEFAULT 'active',
	"archived_at" timestamp,
	"archived_by" integer,
	"notify_channels" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "homework_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"homework_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"submission_text" text,
	"attachment_url" text,
	"attachment_urls" jsonb,
	"submission_source" text DEFAULT 'web',
	"status" text DEFAULT 'pending',
	"submitted_at" timestamp DEFAULT now(),
	"score" numeric(5, 2),
	"feedback" text,
	"grade_by" integer,
	"graded_at" timestamp,
	"parent_notified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" jsonb NOT NULL,
	"author" text NOT NULL,
	"description" jsonb,
	"link_url" text,
	"cover_url" text,
	"subject_ids" jsonb DEFAULT '[]'::jsonb,
	"recommended_level" text,
	"department_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_recommendation_audience" (
	"id" serial PRIMARY KEY NOT NULL,
	"recommendation_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_recommendation_dispatch" (
	"id" serial PRIMARY KEY NOT NULL,
	"recommendation_id" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"error" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"audience_type" text NOT NULL,
	"audience_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text,
	"recommended_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"latitude" text,
	"longitude" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'sent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"push_notifications" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"phone" text,
	"auto_open" boolean DEFAULT true,
	"sound_enabled" boolean DEFAULT true,
	"vibration_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'info',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_letter_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"template_name" text NOT NULL,
	"commercial_phone" text NOT NULL,
	"recipient_title" text NOT NULL,
	"school_name" text NOT NULL,
	"school_address" text NOT NULL,
	"salutation" text NOT NULL,
	"signature_name" text NOT NULL,
	"signature_function" text NOT NULL,
	"custom_fields" jsonb,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_email" text NOT NULL,
	"user_role" text NOT NULL,
	"page_path" text NOT NULL,
	"module_name" text,
	"dashboard_type" text,
	"time_spent" integer,
	"ip_address" text NOT NULL,
	"session_id" text,
	"visit_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_child_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"plan_type" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"payment_method" text,
	"last_payment_date" timestamp,
	"next_payment_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"school_premium_required" boolean DEFAULT true,
	"gateway_active" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_student_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"relationship" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partnership_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"amount" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "predefined_appreciations" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer,
	"created_by" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"target_role" text NOT NULL,
	"appreciation_fr" text NOT NULL,
	"appreciation_en" text NOT NULL,
	"subject_context" text,
	"competency_level" text,
	"grade_range" jsonb,
	"is_active" boolean DEFAULT true,
	"is_global" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pwa_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text NOT NULL,
	"access_method" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"school_id" integer NOT NULL,
	"type" text DEFAULT 'classroom',
	"capacity" integer DEFAULT 30,
	"building" text,
	"floor" text,
	"equipment" text,
	"is_occupied" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "route_optimization" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"optimized_route" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sanctions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"sanction_type" text NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"duration" integer,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true,
	"issued_by" integer NOT NULL,
	"reviewed_by" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"appeal_reason" text,
	"appeal_date" timestamp,
	"revoked_date" timestamp,
	"revoked_by" integer,
	"revoked_reason" text,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_partnership_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"partner_id" integer NOT NULL,
	"agreement_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'freemium' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"payment_method" text,
	"last_payment_date" timestamp,
	"next_payment_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"educafric_payment" boolean DEFAULT true,
	"quarterly_amount" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"educational_type" text DEFAULT 'general' NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"logo_url" text,
	"academic_year" text,
	"current_term" text,
	"term_start_date" timestamp,
	"term_end_date" timestamp,
	"settings" jsonb,
	"regionale_ministerielle" text,
	"delegation_departementale" text,
	"boite_postale" text,
	"arrondissement" text,
	"geolocation_enabled" boolean DEFAULT false,
	"pwa_enabled" boolean DEFAULT true,
	"whatsapp_enabled" boolean DEFAULT false,
	"sms_enabled" boolean DEFAULT false,
	"email_enabled" boolean DEFAULT true,
	"educafric_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "schools_educafric_number_unique" UNIQUE("educafric_number")
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_role" text NOT NULL,
	"signature_data" text NOT NULL,
	"signature_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_academic_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"registration_number" text,
	"enrollment_number" integer,
	"is_repeater" boolean DEFAULT false,
	"academic_year" text NOT NULL,
	"annual_average" numeric(5, 2),
	"annual_position" integer,
	"annual_appreciation" text,
	"council_decision" text,
	"promotion_status" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_academic_info_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "student_discipline" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"sanctions" text,
	"warnings" text,
	"absences" integer DEFAULT 0,
	"conduct_appreciation" text,
	"final_remark" text,
	"recorded_by" integer,
	"recorded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"total_fees" numeric(10, 2),
	"paid_amount" numeric(10, 2) DEFAULT '0.00',
	"outstanding_amount" numeric(10, 2),
	"currency" text DEFAULT 'CFA',
	"last_payment_date" timestamp,
	"payment_method" text,
	"fees_owing" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subject_performance_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade_submission_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"subject_position" integer,
	"subject_average" numeric(5, 2),
	"competence_level" text,
	"competence_description" text,
	"teacher_name" text,
	"teacher_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"code" text,
	"coefficient" numeric,
	"school_id" integer NOT NULL,
	"class_id" integer,
	"subject_type" text DEFAULT 'general'
);
--> statement-breakpoint
CREATE TABLE "teacher_absences" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_grade_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"first_evaluation" numeric(5, 2),
	"second_evaluation" numeric(5, 2),
	"third_evaluation" numeric(5, 2),
	"coefficient" integer DEFAULT 1 NOT NULL,
	"max_score" numeric(5, 2) DEFAULT '20',
	"term_average" numeric(5, 2),
	"weighted_score" numeric(5, 2),
	"subject_comments" text,
	"student_rank" integer,
	"is_submitted" boolean DEFAULT false,
	"submitted_at" timestamp,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"review_feedback" text,
	"return_reason" text,
	"review_priority" text DEFAULT 'normal',
	"requires_attention" boolean DEFAULT false,
	"last_status_change" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_subject_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "teacher_subject_assignments_school_id_teacher_id_class_id_subject_id_unique" UNIQUE("school_id","teacher_id","class_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "term_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"academic_year_id" integer NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"order" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"active" boolean DEFAULT true,
	"is_current" boolean DEFAULT false,
	"grade_submission_deadline" date,
	"bulletin_publication_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "term_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"term_average" numeric(5, 2),
	"term_position" integer,
	"total_students" integer,
	"work_appreciation" text,
	"academic_decision" text,
	"class_average" numeric(5, 2),
	"highest_average" numeric(5, 2),
	"lowest_average" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timetable_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"timetable_id" integer NOT NULL,
	"change_type" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"created_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"room" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timetables" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"subject_name" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"room" text,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer NOT NULL,
	"last_modified_by" integer,
	"notes" text,
	CONSTRAINT "unique_teacher_time_slot" UNIQUE("teacher_id","day_of_week","start_time","end_time","academic_year","term"),
	CONSTRAINT "unique_room_time_slot" UNIQUE("room","day_of_week","start_time","end_time","academic_year","term")
);
--> statement-breakpoint
CREATE TABLE "tracking_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"student_id" integer,
	"device_name" text,
	"device_type" text,
	"is_active" boolean DEFAULT true,
	"current_latitude" text,
	"current_longitude" text,
	"location_accuracy" text,
	"current_address" text,
	"last_location" jsonb,
	"battery_level" integer,
	"last_seen" timestamp,
	"tracking_settings" jsonb,
	"last_update" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" text NOT NULL,
	"secondary_roles" text[],
	"active_role" text,
	"role_history" jsonb,
	"work_mode" text DEFAULT 'school',
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"gender" text,
	"date_of_birth" text,
	"place_of_birth" text,
	"phone" text,
	"guardian" text,
	"parent_email" text,
	"parent_phone" text,
	"is_repeater" boolean DEFAULT false,
	"school_id" integer,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_payment_intent_id" text,
	"subscription_plan" text,
	"subscription_status" text DEFAULT 'inactive',
	"subscription_start" text,
	"subscription_end" text,
	"delegated_permissions" text[],
	"delegated_by_user_id" integer,
	"delegation_level" text,
	"delegation_expiry" timestamp,
	"can_delegate" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" text,
	"two_factor_backup_codes" text[],
	"two_factor_verified_at" timestamp,
	"is_test_account" boolean DEFAULT false,
	"preferred_language" varchar(2) DEFAULT 'en',
	"whatsapp_number" varchar(20),
	"whatsapp_e164" varchar(20),
	"wa_opt_in" boolean DEFAULT false,
	"wa_language" varchar(2) DEFAULT 'fr',
	"preferred_channel" text DEFAULT 'email',
	"password_reset_token" text,
	"password_reset_expiry" timestamp,
	"deletion_requested" boolean DEFAULT false,
	"deletion_requested_at" timestamp,
	"deletion_approved_by" integer,
	"deletion_approved_at" timestamp,
	"firebase_uid" text,
	"facebook_id" text,
	"photo_url" text,
	"last_login_at" timestamp,
	"profile_picture_url" text,
	"is_pwa_user" boolean DEFAULT false,
	"last_pwa_access" timestamp,
	"pwa_install_date" timestamp,
	"access_method" text DEFAULT 'web',
	"teacher_signature_url" text,
	"signature_uploaded_at" timestamp,
	"is_principal_teacher" boolean DEFAULT false,
	"educafric_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_whatsapp_number_unique" UNIQUE("whatsapp_number"),
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "users_facebook_id_unique" UNIQUE("facebook_id"),
	CONSTRAINT "users_educafric_number_unique" UNIQUE("educafric_number")
);
--> statement-breakpoint
CREATE TABLE "webpush_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh_key" text NOT NULL,
	"auth_key" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "zone_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"zone_id" text NOT NULL,
	"is_in_zone" boolean DEFAULT false,
	"entered_at" timestamp,
	"exited_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fcm_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"device_type" text,
	"user_agent" text,
	"ip_address" text,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fcm_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "bulletin_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"bulletin_id" text NOT NULL,
	"student_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"required_signatures" jsonb,
	"completed_signatures" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"signed_at" timestamp,
	"sent_at" timestamp,
	"sent_to_students" boolean DEFAULT false,
	"sent_to_parents" boolean DEFAULT false,
	"delivery_tracking" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_type" text NOT NULL,
	"document_id" text NOT NULL,
	"signatory_id" integer NOT NULL,
	"signatory_name" text NOT NULL,
	"signatory_title" text NOT NULL,
	"signatory_role" text NOT NULL,
	"school_id" integer NOT NULL,
	"signature_type" text DEFAULT 'digital' NOT NULL,
	"signature_hash" text NOT NULL,
	"signature_timestamp" timestamp DEFAULT now(),
	"signature_device" text,
	"signature_ip" text,
	"document_hash" text NOT NULL,
	"verification_code" text NOT NULL,
	"is_valid" boolean DEFAULT true,
	"revoked_at" timestamp,
	"revoked_by" integer,
	"revoked_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"academic_year" jsonb NOT NULL,
	"terms" jsonb NOT NULL,
	"grading_scale" jsonb,
	"school_calendar" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"updated_by" integer,
	CONSTRAINT "unique_config_per_school" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_type" text NOT NULL,
	"initiator_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"connection_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" integer
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grade_review_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade_submission_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"review_action" text NOT NULL,
	"previous_status" text,
	"new_status" text NOT NULL,
	"feedback" text,
	"return_reason" text,
	"previous_grade_data" jsonb,
	"new_grade_data" jsonb,
	"review_priority" text,
	"time_spent_reviewing" integer,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_verification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_id" integer NOT NULL,
	"access_type" text NOT NULL,
	"access_result" text NOT NULL,
	"accessed_by" integer,
	"session_id" text,
	"user_role" text,
	"ip_address" text,
	"user_agent" text,
	"geolocation" jsonb,
	"verification_method" text,
	"referrer" text,
	"access_metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_verification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"enable_qr_codes" boolean DEFAULT true,
	"qr_code_size" integer DEFAULT 100,
	"qr_code_position" text DEFAULT 'bottom_right',
	"enable_public_verification" boolean DEFAULT true,
	"require_authentication" boolean DEFAULT false,
	"enable_verification_expiry" boolean DEFAULT false,
	"default_expiry_days" integer DEFAULT 365,
	"max_verifications_per_hour" integer DEFAULT 10,
	"enable_geolocation" boolean DEFAULT false,
	"enable_audit_log" boolean DEFAULT true,
	"security_level" text DEFAULT 'standard',
	"show_student_photo" boolean DEFAULT true,
	"show_school_logo" boolean DEFAULT true,
	"show_detailed_grades" boolean DEFAULT false,
	"custom_verification_message" text,
	"custom_verification_message_en" text,
	"verification_page_branding" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulletin_verification_settings_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "bulletin_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_code" text NOT NULL,
	"short_code" text NOT NULL,
	"bulletin_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"student_name" text NOT NULL,
	"student_matricule" text NOT NULL,
	"student_birth_date" text,
	"student_gender" text,
	"class_name" text NOT NULL,
	"school_name" text NOT NULL,
	"general_average" text,
	"class_rank" integer,
	"total_students" integer,
	"verification_hash" text NOT NULL,
	"digital_signature" text,
	"qr_code_data" text NOT NULL,
	"qr_code_image" text,
	"is_active" boolean DEFAULT true,
	"verification_count" integer DEFAULT 0,
	"last_verified_at" timestamp,
	"last_verified_ip" text,
	"issued_by" integer NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"approved_by" integer,
	"approved_at" timestamp,
	"expires_at" timestamp,
	"issue_metadata" jsonb,
	"security_level" text DEFAULT 'standard',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulletin_verifications_verification_code_unique" UNIQUE("verification_code"),
	CONSTRAINT "bulletin_verifications_short_code_unique" UNIQUE("short_code"),
	CONSTRAINT "bulletin_verifications_bulletin_id_unique" UNIQUE("bulletin_id")
);
--> statement-breakpoint
CREATE TABLE "class_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"enrollment_date" timestamp DEFAULT now(),
	"status" text DEFAULT 'active' NOT NULL,
	"enrolled_by" integer,
	"transferred_from" integer,
	"transferred_to" integer,
	"withdrawal_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_student_class_year" UNIQUE("student_id","academic_year","status")
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer,
	"teacher_id" integer NOT NULL,
	"class_id" integer,
	"subject_id" integer,
	"title" text NOT NULL,
	"description" text,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"room_name" text NOT NULL,
	"room_password" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"recording_url" text,
	"recording_size" integer,
	"max_duration" integer DEFAULT 120,
	"lobby_enabled" boolean DEFAULT true,
	"waiting_room_enabled" boolean DEFAULT false,
	"chat_enabled" boolean DEFAULT true,
	"screen_share_enabled" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"creator_type" text DEFAULT 'teacher',
	"recurrence_id" integer,
	"notifications_sent" boolean DEFAULT false,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "class_sessions_room_name_unique" UNIQUE("room_name")
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "online_class_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"activator_type" text NOT NULL,
	"activator_id" integer NOT NULL,
	"duration_type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"activated_by" text NOT NULL,
	"admin_user_id" integer,
	"payment_id" text,
	"payment_method" text,
	"amount_paid" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "online_class_recurrences" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"course_id" integer,
	"teacher_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"subject_id" integer,
	"title" text NOT NULL,
	"description" text,
	"rule_type" text NOT NULL,
	"interval" integer DEFAULT 1,
	"by_day" text,
	"start_time" text NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"occurrences_generated" integer DEFAULT 0,
	"last_generated" timestamp,
	"next_generation" timestamp,
	"is_active" boolean DEFAULT true,
	"paused_at" timestamp,
	"paused_by" integer,
	"pause_reason" text,
	"max_duration" integer DEFAULT 120,
	"auto_notify" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "online_class_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"activation_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer,
	"session_duration" integer,
	"participant_count" integer,
	"was_within_allowed_window" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "online_classes_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"is_active" boolean DEFAULT false,
	"plan" text DEFAULT 'premium',
	"monthly_price" integer DEFAULT 250000,
	"currency" text DEFAULT 'XAF',
	"activated_at" timestamp,
	"expires_at" timestamp,
	"auto_renew" boolean DEFAULT true,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"last_payment_at" timestamp,
	"next_payment_at" timestamp,
	"grace_period_ends" timestamp,
	"canceled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "online_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subject_id" integer,
	"class_id" integer,
	"teacher_id" integer NOT NULL,
	"language" text DEFAULT 'fr',
	"is_active" boolean DEFAULT true,
	"max_participants" integer DEFAULT 50,
	"allow_recording" boolean DEFAULT true,
	"require_approval" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"jitsi_participant_id" text,
	"joined_at" timestamp,
	"left_at" timestamp,
	"duration_seconds" integer DEFAULT 0,
	"device_type" text,
	"connection_quality" text,
	"audio_enabled" boolean DEFAULT false,
	"video_enabled" boolean DEFAULT false,
	"screen_shared" boolean DEFAULT false,
	"chat_messages" integer DEFAULT 0,
	"was_removed" boolean DEFAULT false,
	"left_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"invited_by" integer NOT NULL,
	"invitation_method" text NOT NULL,
	"invited_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"response" text,
	"notifications_sent" integer DEFAULT 0,
	"last_reminder_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"filename" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"duration" integer,
	"format" text DEFAULT 'mp4',
	"quality" text DEFAULT '720p',
	"processing_status" text DEFAULT 'pending',
	"download_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wa_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"template_id" text NOT NULL,
	"campaign" text,
	"ip" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_independent_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"duration_type" text DEFAULT 'yearly' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"activated_by" text NOT NULL,
	"admin_user_id" integer,
	"payment_id" text,
	"payment_method" text,
	"amount_paid" integer DEFAULT 25000,
	"currency" text DEFAULT 'XAF',
	"notes" text,
	"auto_renew" boolean DEFAULT false,
	"canceled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_independent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subject" text NOT NULL,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"session_type" text DEFAULT 'online',
	"location" text,
	"room_name" text,
	"room_password" text,
	"meeting_url" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"cancel_reason" text,
	"teacher_notes" text,
	"student_feedback" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_independent_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"connection_date" timestamp DEFAULT now(),
	"connection_method" text DEFAULT 'teacher_invite',
	"subjects" text[],
	"level" text,
	"objectives" text,
	"status" text DEFAULT 'active' NOT NULL,
	"ended_at" timestamp,
	"end_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutorial_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tutorial_version" text DEFAULT '1.0' NOT NULL,
	"is_completed" boolean DEFAULT false,
	"current_step" integer DEFAULT 0,
	"total_steps" integer DEFAULT 0,
	"last_accessed_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"skipped_at" timestamp,
	"user_role" text NOT NULL,
	"device_type" text,
	"completion_method" text,
	"session_data" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutorial_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"progress_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"step_id" text NOT NULL,
	"is_completed" boolean DEFAULT false,
	"time_spent_seconds" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"priority" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geolocation_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"device_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"alert_type" text NOT NULL,
	"priority" text NOT NULL,
	"message" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"safe_zone_id" integer,
	"is_resolved" boolean DEFAULT false,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"notifications_sent" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geolocation_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"device_type" text NOT NULL,
	"device_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"battery_level" integer,
	"last_update" timestamp,
	"emergency_mode" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "geolocation_devices_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "safe_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"radius" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"alert_on_entry" boolean DEFAULT false,
	"alert_on_exit" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deletion_emails_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"deletion_request_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"recipient_type" text NOT NULL,
	"email_type" text NOT NULL,
	"email_sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_deletion_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"reason" text,
	"requested_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'pending',
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"completed_at" timestamp,
	"notifications_sent" boolean DEFAULT false,
	"emails_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delegation_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"delegation_id" integer NOT NULL,
	"action" text NOT NULL,
	"performed_by" integer NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"reason" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delegations" (
	"id" serial PRIMARY KEY NOT NULL,
	"delegator_id" integer NOT NULL,
	"delegatee_id" integer NOT NULL,
	"permissions" text[] NOT NULL,
	"level" text NOT NULL,
	"scope" text,
	"scope_id" integer,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"constraints" jsonb,
	"reason" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" text[] NOT NULL,
	"required_role" text,
	"is_system_template" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_validations" (
	"id" serial PRIMARY KEY NOT NULL,
	"bulletin_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"qr_code" text NOT NULL,
	"qr_code_image_url" text,
	"validation_hash" text NOT NULL,
	"teacher_signature_hash" text,
	"director_signature_hash" text,
	"school_stamp_hash" text,
	"validation_type" text NOT NULL,
	"validation_level" text NOT NULL,
	"is_valid" boolean DEFAULT true,
	"validated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"verification_count" integer DEFAULT 0,
	"last_verified_at" timestamp,
	"verification_history" jsonb,
	"original_bulletin_hash" text NOT NULL,
	"current_bulletin_hash" text NOT NULL,
	"integrity_status" text DEFAULT 'intact',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulletin_validations_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "qr_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"bulletin_validation_id" integer NOT NULL,
	"verifier_ip" text,
	"verifier_location" text,
	"verification_method" text,
	"verification_result" text,
	"verification_data" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_validation_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"template_name" text NOT NULL,
	"validation_type" text NOT NULL,
	"qr_code_style" jsonb,
	"stamp_position" jsonb,
	"signature_layout" jsonb,
	"validation_rules" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "library_recommendation_audience" ADD CONSTRAINT "library_recommendation_audience_recommendation_id_library_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."library_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_recommendation_dispatch" ADD CONSTRAINT "library_recommendation_dispatch_recommendation_id_library_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."library_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_recommendations" ADD CONSTRAINT "library_recommendations_book_id_library_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."library_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_letter_templates" ADD CONSTRAINT "offer_letter_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_course_id_online_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."online_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_recurrence_id_online_class_recurrences_id_fk" FOREIGN KEY ("recurrence_id") REFERENCES "public"."online_class_recurrences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_online_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."online_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_course_id_online_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."online_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_paused_by_users_id_fk" FOREIGN KEY ("paused_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_recurrences" ADD CONSTRAINT "online_class_recurrences_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_usage_logs" ADD CONSTRAINT "online_class_usage_logs_activation_id_online_class_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."online_class_activations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_usage_logs" ADD CONSTRAINT "online_class_usage_logs_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_class_usage_logs" ADD CONSTRAINT "online_class_usage_logs_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_classes_subscriptions" ADD CONSTRAINT "online_classes_subscriptions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_courses" ADD CONSTRAINT "online_courses_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_courses" ADD CONSTRAINT "online_courses_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_courses" ADD CONSTRAINT "online_courses_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_courses" ADD CONSTRAINT "online_courses_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_invitations" ADD CONSTRAINT "session_invitations_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_invitations" ADD CONSTRAINT "session_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_invitations" ADD CONSTRAINT "session_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;