CREATE TABLE "bus_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"bus_name" text NOT NULL,
	"bus_name_fr" text,
	"bus_name_en" text,
	"driver_name" text NOT NULL,
	"driver_phone" text,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bus_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_id" integer NOT NULL,
	"station_name_fr" text NOT NULL,
	"station_name_en" text NOT NULL,
	"station_time" time NOT NULL,
	"latitude" numeric(10, 6) NOT NULL,
	"longitude" numeric(10, 6) NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bus_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "canteen_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "canteen_balances_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "canteen_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"date" date NOT NULL,
	"meal_name_fr" text NOT NULL,
	"meal_name_en" text NOT NULL,
	"description_fr" text,
	"description_en" text,
	"price" numeric(10, 2) NOT NULL,
	"available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "canteen_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"reserved_date" date NOT NULL,
	"paid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"subject_id" integer,
	"subject_name" text,
	"form_level" text,
	"competency_text_fr" text NOT NULL,
	"competency_text_en" text,
	"category" text DEFAULT 'general',
	"domain_area" text,
	"display_order" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_affiliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"school_id" integer,
	"description" text,
	"status" text DEFAULT 'active',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_bulletins" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"student_name" text NOT NULL,
	"class_label" text NOT NULL,
	"trimester" text NOT NULL,
	"academic_year" text NOT NULL,
	"subjects" jsonb NOT NULL,
	"discipline" jsonb NOT NULL,
	"general_remark" text,
	"bulletin_type" text,
	"language" text DEFAULT 'fr',
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"archived_at" timestamp,
	"archive_id" integer
);
--> statement-breakpoint
CREATE TABLE "school_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_fr" text,
	"name_en" text,
	"order" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subject_competency_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"competency_id" integer NOT NULL,
	"form_level" text NOT NULL,
	"display_order" integer DEFAULT 1,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_bulletins" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"student_info" jsonb NOT NULL,
	"subjects" jsonb NOT NULL,
	"discipline" jsonb NOT NULL,
	"bulletin_type" text,
	"language" text DEFAULT 'fr',
	"status" text DEFAULT 'draft' NOT NULL,
	"signed_at" timestamp,
	"signature_hash" text,
	"sent_to_school_at" timestamp,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"review_status" text,
	"review_comments" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_independent_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"parent_id" integer,
	"session_id" integer,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'XAF',
	"payment_method" text NOT NULL,
	"payment_intent_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"notes" text,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_student_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"student_id" integer,
	"subjects" text[],
	"level" text,
	"message" text,
	"price_per_hour" integer,
	"price_per_session" integer,
	"currency" text DEFAULT 'XAF',
	"status" text DEFAULT 'pending' NOT NULL,
	"response_message" text,
	"responded_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_log_access_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"accessed_by" integer NOT NULL,
	"filters" jsonb,
	"results_count" integer,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_role" text,
	"user_email" text,
	"action" text NOT NULL,
	"action_category" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"school_id" integer,
	"severity" text DEFAULT 'info',
	"success" boolean DEFAULT true,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_absences_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reason" text NOT NULL,
	"absence_type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"approved_by" integer,
	"approved_at" timestamp,
	"affected_classes" jsonb,
	"notifications_sent" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_replacements" (
	"id" serial PRIMARY KEY NOT NULL,
	"absence_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"original_teacher_id" integer NOT NULL,
	"replacement_teacher_id" integer,
	"class_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"session_date" timestamp NOT NULL,
	"session_time" text,
	"status" text DEFAULT 'pending',
	"assigned_by" integer,
	"assigned_at" timestamp,
	"confirmed_by" integer,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"notifications_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"user_id" integer,
	"user_role" text,
	"conversation_status" text DEFAULT 'active',
	"last_message_at" timestamp DEFAULT now(),
	"message_count" integer DEFAULT 0,
	"is_bot" boolean DEFAULT true,
	"assigned_to" integer,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_faq_knowledge" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text NOT NULL,
	"keywords" text[],
	"language" text DEFAULT 'fr',
	"priority" integer DEFAULT 0,
	"usage_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"message_id" text,
	"direction" text NOT NULL,
	"from_number" text NOT NULL,
	"to_number" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"content" text,
	"media_url" text,
	"status" text DEFAULT 'sent',
	"is_bot" boolean DEFAULT true,
	"intent" text,
	"intent_confidence" integer,
	"response_time" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_quick_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"trigger" text NOT NULL,
	"response_text" text NOT NULL,
	"category" text NOT NULL,
	"language" text DEFAULT 'fr',
	"include_actions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "level" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "student_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "order_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transaction_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "use_cba_format" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "established_year" integer;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "principal_name" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "student_capacity" integer;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "bulletin_section" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "years_in_position" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "qualifications" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_image" text;