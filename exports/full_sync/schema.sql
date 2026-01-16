--
-- PostgreSQL database dump
--

\restrict safhjfsCQ2gOEEpzL1LKqznE1fr4xABni2VKE25e6BUiXtgCD124obAHfgHc1Gb

-- Dumped from database version 16.11 (f45eb12)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id integer NOT NULL,
    name text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    school_id integer NOT NULL,
    is_active boolean DEFAULT false
);


--
-- Name: academic_years_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.academic_years_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: academic_years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.academic_years_id_seq OWNED BY public.academic_years.id;


--
-- Name: archive_access_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archive_access_logs (
    id integer NOT NULL,
    archive_id integer,
    school_id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    ip text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: archive_access_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.archive_access_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: archive_access_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.archive_access_logs_id_seq OWNED BY public.archive_access_logs.id;


--
-- Name: archived_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archived_documents (
    id integer NOT NULL,
    school_id integer NOT NULL,
    type text NOT NULL,
    bulletin_id integer,
    class_id integer NOT NULL,
    academic_year text NOT NULL,
    term text NOT NULL,
    student_id integer,
    language text NOT NULL,
    filename text NOT NULL,
    storage_key text NOT NULL,
    checksum_sha256 text NOT NULL,
    size_bytes bigint NOT NULL,
    recipients jsonb,
    snapshot jsonb,
    meta jsonb,
    version text DEFAULT '1.0'::text,
    sent_at timestamp without time zone NOT NULL,
    sent_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: archived_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.archived_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: archived_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.archived_documents_id_seq OWNED BY public.archived_documents.id;


--
-- Name: assigned_fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assigned_fees (
    id integer NOT NULL,
    school_id integer NOT NULL,
    student_id integer NOT NULL,
    fee_structure_id integer NOT NULL,
    original_amount integer NOT NULL,
    discount_amount integer DEFAULT 0,
    discount_reason text,
    final_amount integer NOT NULL,
    paid_amount integer DEFAULT 0,
    balance_amount integer NOT NULL,
    status text DEFAULT 'pending'::text,
    due_date timestamp without time zone NOT NULL,
    paid_date timestamp without time zone,
    last_payment_date timestamp without time zone,
    term_id integer,
    academic_year_id integer,
    reminder_sent boolean DEFAULT false,
    reminder_sent_at timestamp without time zone,
    overdue_notice_sent boolean DEFAULT false,
    overdue_notice_sent_at timestamp without time zone,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: assigned_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assigned_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigned_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assigned_fees_id_seq OWNED BY public.assigned_fees.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    status text NOT NULL,
    teacher_id integer NOT NULL,
    parent_notified boolean DEFAULT false,
    notification_sent_at timestamp without time zone,
    reason text,
    created_at timestamp without time zone DEFAULT now(),
    school_id integer,
    time_in timestamp without time zone,
    time_out timestamp without time zone,
    notes text,
    marked_by integer,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: audit_log_access_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log_access_tracking (
    id integer NOT NULL,
    accessed_by integer NOT NULL,
    filters jsonb,
    results_count integer,
    ip_address text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: audit_log_access_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_access_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_access_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_access_tracking_id_seq OWNED BY public.audit_log_access_tracking.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    user_role text,
    user_email text,
    action text NOT NULL,
    action_category text NOT NULL,
    entity_type text,
    entity_id text,
    description text NOT NULL,
    metadata jsonb,
    ip_address text,
    user_agent text,
    school_id integer,
    severity text DEFAULT 'info'::text,
    success boolean DEFAULT true,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bulletin_comprehensive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletin_comprehensive (
    id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    school_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    unjustified_absence_hours numeric(5,2) DEFAULT 0.00,
    justified_absence_hours numeric(5,2) DEFAULT 0.00,
    lateness_count integer DEFAULT 0,
    detention_hours numeric(5,2) DEFAULT 0.00,
    conduct_warning boolean DEFAULT false,
    conduct_blame boolean DEFAULT false,
    exclusion_days integer DEFAULT 0,
    permanent_exclusion boolean DEFAULT false,
    total_general numeric(8,2),
    general_average numeric(5,2),
    trimester_average numeric(5,2),
    number_of_averages integer,
    success_rate numeric(5,2),
    class_profile jsonb,
    work_appreciation text,
    general_comment text,
    parent_visa jsonb,
    teacher_visa jsonb,
    headmaster_visa jsonb,
    entered_by integer,
    last_modified_by integer,
    data_source text DEFAULT 'manual'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'draft'::text,
    submitted_at timestamp without time zone,
    approved_at timestamp without time zone,
    sent_at timestamp without time zone,
    approved_by integer,
    notifications_sent jsonb,
    class_council_decisions text,
    class_council_mentions text,
    orientation_recommendations text,
    council_date text,
    council_participants text
);


--
-- Name: bulletin_comprehensive_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletin_comprehensive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletin_comprehensive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletin_comprehensive_id_seq OWNED BY public.bulletin_comprehensive.id;


--
-- Name: bulletin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletin_notifications (
    id integer NOT NULL,
    bulletin_id integer NOT NULL,
    recipient_type text NOT NULL,
    recipient_id integer NOT NULL,
    recipient_email text,
    recipient_phone text,
    email_sent boolean DEFAULT false,
    sms_sent boolean DEFAULT false,
    whatsapp_sent boolean DEFAULT false,
    push_notification_sent boolean DEFAULT false,
    email_delivered boolean DEFAULT false,
    sms_delivered boolean DEFAULT false,
    whatsapp_delivered boolean DEFAULT false,
    email_opened boolean DEFAULT false,
    email_opened_at timestamp without time zone,
    bulletin_downloaded boolean DEFAULT false,
    bulletin_downloaded_at timestamp without time zone,
    bulletin_viewed boolean DEFAULT false,
    bulletin_viewed_at timestamp without time zone,
    notification_language text DEFAULT 'fr'::text,
    delivery_metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: bulletin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletin_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletin_notifications_id_seq OWNED BY public.bulletin_notifications.id;


--
-- Name: bulletin_subject_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletin_subject_codes (
    id integer NOT NULL,
    bulletin_comprehensive_id integer NOT NULL,
    student_id integer NOT NULL,
    subject_id integer NOT NULL,
    subject_name text NOT NULL,
    ctba numeric(5,2),
    cba numeric(5,2),
    ca numeric(5,2),
    cma numeric(5,2),
    cote text,
    cna text,
    min_grade numeric(5,2),
    max_grade numeric(5,2),
    competency_level text,
    teacher_comment text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: bulletin_subject_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletin_subject_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletin_subject_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletin_subject_codes_id_seq OWNED BY public.bulletin_subject_codes.id;


--
-- Name: bulletin_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletin_verifications (
    id integer NOT NULL,
    verification_code text NOT NULL,
    short_code text NOT NULL,
    bulletin_id integer NOT NULL,
    student_id integer NOT NULL,
    school_id integer NOT NULL,
    class_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    student_name text NOT NULL,
    student_matricule text NOT NULL,
    student_birth_date text,
    student_gender text,
    class_name text NOT NULL,
    school_name text NOT NULL,
    general_average text,
    class_rank integer,
    total_students integer,
    verification_hash text NOT NULL,
    digital_signature text,
    qr_code_data text NOT NULL,
    qr_code_image text,
    is_active boolean DEFAULT true,
    verification_count integer DEFAULT 0,
    last_verified_at timestamp without time zone,
    last_verified_ip text,
    issued_by integer NOT NULL,
    issued_at timestamp without time zone DEFAULT now(),
    approved_by integer,
    approved_at timestamp without time zone,
    expires_at timestamp without time zone,
    issue_metadata jsonb,
    security_level text DEFAULT 'standard'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: bulletin_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletin_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletin_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletin_verifications_id_seq OWNED BY public.bulletin_verifications.id;


--
-- Name: bulletin_workflow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletin_workflow (
    id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    school_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    current_status text DEFAULT 'awaiting_teacher_submissions'::text NOT NULL,
    total_subjects integer NOT NULL,
    completed_subjects integer DEFAULT 0,
    missing_subjects jsonb,
    bulletin_id integer,
    auto_generate_bulletin boolean DEFAULT true,
    notify_on_complete boolean DEFAULT true,
    grades_deadline timestamp without time zone,
    review_deadline timestamp without time zone,
    reminders_sent integer DEFAULT 0,
    last_reminder_sent timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: bulletin_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletin_workflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletin_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletin_workflow_id_seq OWNED BY public.bulletin_workflow.id;


--
-- Name: bulletins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulletins (
    id integer NOT NULL,
    student_id integer NOT NULL,
    teacher_id integer,
    class_id integer NOT NULL,
    school_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    approved_at timestamp without time zone,
    sent_at timestamp without time zone,
    approved_by integer,
    sent_by integer,
    general_average numeric(5,2),
    class_rank integer,
    total_students_in_class integer,
    teacher_comments text,
    director_comments text,
    work_appreciation text,
    conduct_appreciation text,
    pdf_url text,
    digital_signature_hash text,
    qr_code text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: bulletins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulletins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulletins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulletins_id_seq OWNED BY public.bulletins.id;


--
-- Name: business_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_partners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sector character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    description text,
    address text,
    city character varying(100),
    region character varying(100),
    country character varying(100) DEFAULT 'Cameroun'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    contact_person character varying(255),
    contact_position character varying(255),
    phone character varying(20),
    email character varying(255),
    website character varying(255),
    partnership_type character varying(50) NOT NULL,
    partnership_since character varying(10),
    status character varying(20) DEFAULT 'active'::character varying,
    rating numeric(3,2) DEFAULT 0.00,
    students_placed integer DEFAULT 0,
    opportunities_offered integer DEFAULT 0,
    programs jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: business_partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.business_partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: business_partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.business_partners_id_seq OWNED BY public.business_partners.id;


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id integer NOT NULL,
    participant_one_id integer NOT NULL,
    participant_one_role text NOT NULL,
    participant_two_id integer NOT NULL,
    participant_two_role text NOT NULL,
    student_id integer,
    school_id integer NOT NULL,
    last_message_at timestamp without time zone DEFAULT now(),
    last_message_preview text,
    participant_one_unread integer DEFAULT 0,
    participant_two_unread integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversations_id_seq OWNED BY public.chat_conversations.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    sender_name text,
    sender_role text,
    content text NOT NULL,
    message_type text DEFAULT 'text'::text,
    attachment_url text,
    attachment_name text,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    is_edited boolean DEFAULT false,
    edited_at timestamp without time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    reply_to_id integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_typing_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_typing_indicators (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    user_id integer NOT NULL,
    is_typing boolean DEFAULT false,
    last_typing_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_typing_indicators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_typing_indicators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_typing_indicators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_typing_indicators_id_seq OWNED BY public.chat_typing_indicators.id;


--
-- Name: class_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_sessions (
    id integer NOT NULL,
    course_id integer,
    title text NOT NULL,
    description text,
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone,
    actual_start timestamp without time zone,
    actual_end timestamp without time zone,
    room_name text NOT NULL,
    room_password text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    recording_url text,
    recording_size integer,
    max_duration integer DEFAULT 120,
    lobby_enabled boolean DEFAULT true,
    waiting_room_enabled boolean DEFAULT false,
    chat_enabled boolean DEFAULT true,
    screen_share_enabled boolean DEFAULT true,
    created_by integer NOT NULL,
    metadata text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    teacher_id integer NOT NULL,
    class_id integer,
    subject_id integer,
    creator_type character varying(50) DEFAULT 'school'::character varying,
    duration_minutes integer,
    notifications_sent boolean DEFAULT false,
    recurrence_id integer
);


--
-- Name: class_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.class_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: class_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.class_sessions_id_seq OWNED BY public.class_sessions.id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name text NOT NULL,
    level text,
    section text,
    school_id integer NOT NULL,
    teacher_id integer,
    academic_year_id integer NOT NULL,
    max_students integer DEFAULT 30,
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    room text
);


--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: communication_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_logs (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    recipient_id integer NOT NULL,
    type text NOT NULL,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp without time zone DEFAULT now(),
    delivered_at timestamp without time zone,
    metadata jsonb
);


--
-- Name: communication_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communication_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communication_logs_id_seq OWNED BY public.communication_logs.id;


--
-- Name: competencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competencies (
    id integer NOT NULL,
    school_id integer NOT NULL,
    subject_id integer,
    subject_name text,
    form_level text,
    competency_text_fr text NOT NULL,
    competency_text_en text,
    category text DEFAULT 'general'::text,
    domain_area text,
    display_order integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: competencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.competencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.competencies_id_seq OWNED BY public.competencies.id;


--
-- Name: competency_evaluation_systems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competency_evaluation_systems (
    id integer NOT NULL,
    name text NOT NULL,
    language text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    levels jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: competency_evaluation_systems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.competency_evaluation_systems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competency_evaluation_systems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.competency_evaluation_systems_id_seq OWNED BY public.competency_evaluation_systems.id;


--
-- Name: competency_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competency_templates (
    id integer NOT NULL,
    school_id integer,
    created_by integer NOT NULL,
    subject_name text NOT NULL,
    term text NOT NULL,
    class_level text,
    competencies_fr text NOT NULL,
    competencies_en text NOT NULL,
    learning_objectives jsonb,
    evaluation_criteria jsonb,
    is_active boolean DEFAULT true,
    is_global boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: competency_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.competency_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competency_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.competency_templates_id_seq OWNED BY public.competency_templates.id;


--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_enrollments (
    id integer NOT NULL,
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL,
    enrolled_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_enrollments_id_seq OWNED BY public.course_enrollments.id;


--
-- Name: daily_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_connections (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_email text NOT NULL,
    user_role text NOT NULL,
    user_name text NOT NULL,
    ip_address text NOT NULL,
    location jsonb,
    user_agent text,
    connection_date timestamp without time zone DEFAULT now(),
    session_id text,
    access_method text DEFAULT 'web'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: daily_connections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_connections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_connections_id_seq OWNED BY public.daily_connections.id;


--
-- Name: device_location_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_location_history (
    id integer NOT NULL,
    device_id integer NOT NULL,
    latitude text,
    longitude text,
    accuracy text,
    "timestamp" timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: device_location_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.device_location_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: device_location_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.device_location_history_id_seq OWNED BY public.device_location_history.id;


--
-- Name: educafric_number_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.educafric_number_counters (
    id integer NOT NULL,
    type text NOT NULL,
    current_counter integer DEFAULT 0 NOT NULL,
    last_generated text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: educafric_number_counters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.educafric_number_counters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: educafric_number_counters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.educafric_number_counters_id_seq OWNED BY public.educafric_number_counters.id;


--
-- Name: educafric_numbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.educafric_numbers (
    id integer NOT NULL,
    educafric_number text NOT NULL,
    type text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer,
    status text DEFAULT 'active'::text NOT NULL,
    issued_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: educafric_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.educafric_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: educafric_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.educafric_numbers_id_seq OWNED BY public.educafric_numbers.id;


--
-- Name: educational_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.educational_content (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    type text DEFAULT 'lesson'::text,
    subject_id integer,
    level text,
    duration integer DEFAULT 60,
    objectives text,
    prerequisites text,
    teacher_id integer,
    school_id integer,
    files jsonb,
    status text DEFAULT 'draft'::text,
    visibility text DEFAULT 'school'::text,
    download_count integer DEFAULT 0,
    tags text[],
    is_shared boolean DEFAULT false,
    is_template boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    rating numeric(3,2),
    approved_by integer,
    approved_at timestamp without time zone,
    shared_with jsonb,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: educational_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.educational_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: educational_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.educational_content_id_seq OWNED BY public.educational_content.id;


--
-- Name: emergency_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_alerts (
    id integer NOT NULL,
    device_id integer NOT NULL,
    type text,
    alert_type text,
    message text,
    latitude text,
    longitude text,
    location jsonb,
    severity text,
    is_read boolean DEFAULT false,
    is_resolved boolean DEFAULT false,
    "timestamp" timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: emergency_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emergency_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emergency_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emergency_alerts_id_seq OWNED BY public.emergency_alerts.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    academic_year_id integer NOT NULL,
    enrollment_date timestamp without time zone DEFAULT now(),
    status text DEFAULT 'active'::text
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: fee_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_audit_logs (
    id integer NOT NULL,
    school_id integer NOT NULL,
    actor_id integer NOT NULL,
    actor_role text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    previous_value jsonb,
    new_value jsonb,
    amount_before integer,
    amount_after integer,
    description text,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fee_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fee_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fee_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fee_audit_logs_id_seq OWNED BY public.fee_audit_logs.id;


--
-- Name: fee_notification_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_notification_queue (
    id integer NOT NULL,
    school_id integer NOT NULL,
    assigned_fee_id integer,
    student_id integer NOT NULL,
    parent_id integer,
    notification_type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    channels text[],
    email_sent boolean DEFAULT false,
    whatsapp_sent boolean DEFAULT false,
    pwa_sent boolean DEFAULT false,
    scheduled_for timestamp without time zone,
    sent_at timestamp without time zone,
    status text DEFAULT 'pending'::text,
    error_message text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fee_notification_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fee_notification_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fee_notification_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fee_notification_queue_id_seq OWNED BY public.fee_notification_queue.id;


--
-- Name: fee_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_receipts (
    id integer NOT NULL,
    school_id integer NOT NULL,
    payment_id integer NOT NULL,
    student_id integer NOT NULL,
    receipt_number text NOT NULL,
    total_amount integer NOT NULL,
    payment_method text,
    transaction_ref text,
    pdf_url text,
    status text DEFAULT 'generated'::text,
    sent_at timestamp without time zone,
    viewed_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fee_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fee_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fee_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fee_receipts_id_seq OWNED BY public.fee_receipts.id;


--
-- Name: fee_structures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_structures (
    id integer NOT NULL,
    school_id integer NOT NULL,
    name text NOT NULL,
    name_fr text,
    name_en text,
    description text,
    fee_type text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'XAF'::text,
    class_id integer,
    grade_level text,
    frequency text DEFAULT 'term'::text NOT NULL,
    term_id integer,
    academic_year_id integer,
    due_date timestamp without time zone,
    due_day_of_month integer,
    early_payment_discount integer DEFAULT 0,
    early_payment_days integer DEFAULT 0,
    sibling_discount integer DEFAULT 0,
    scholarship_eligible boolean DEFAULT true,
    is_active boolean DEFAULT true,
    is_mandatory boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: fee_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fee_structures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fee_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fee_structures_id_seq OWNED BY public.fee_structures.id;


--
-- Name: geofence_violations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geofence_violations (
    id integer NOT NULL,
    device_id integer NOT NULL,
    violation_type text,
    location jsonb,
    "timestamp" timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: geofence_violations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.geofence_violations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: geofence_violations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.geofence_violations_id_seq OWNED BY public.geofence_violations.id;


--
-- Name: geolocation_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geolocation_alerts (
    id integer NOT NULL,
    student_id integer NOT NULL,
    device_id integer,
    school_id integer NOT NULL,
    parent_id integer,
    alert_type text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    message text NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    safe_zone_id integer,
    is_resolved boolean DEFAULT false,
    resolved_by integer,
    resolved_at timestamp without time zone,
    notifications_sent jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: geolocation_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.geolocation_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: geolocation_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.geolocation_alerts_id_seq OWNED BY public.geolocation_alerts.id;


--
-- Name: geolocation_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geolocation_devices (
    id integer NOT NULL,
    student_id integer NOT NULL,
    device_type text NOT NULL,
    device_id text NOT NULL,
    is_active boolean DEFAULT true,
    battery_level integer,
    last_update timestamp without time zone,
    emergency_mode boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: geolocation_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.geolocation_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: geolocation_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.geolocation_devices_id_seq OWNED BY public.geolocation_devices.id;


--
-- Name: grade_review_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grade_review_history (
    id integer NOT NULL,
    grade_submission_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    review_action text NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    feedback text,
    return_reason text,
    previous_grade_data jsonb,
    new_grade_data jsonb,
    review_priority text,
    time_spent_reviewing integer,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: grade_review_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grade_review_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grade_review_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grade_review_history_id_seq OWNED BY public.grade_review_history.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    student_id integer NOT NULL,
    subject_id integer NOT NULL,
    teacher_id integer NOT NULL,
    class_id integer NOT NULL,
    term_id integer NOT NULL,
    value numeric(5,2) NOT NULL,
    max_value numeric(5,2) DEFAULT 20.00,
    grade_type text NOT NULL,
    description text,
    date_recorded timestamp without time zone DEFAULT now(),
    published_to_parents boolean DEFAULT false
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: homework; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    subject_id integer NOT NULL,
    class_id integer NOT NULL,
    teacher_id integer NOT NULL,
    due_date timestamp without time zone NOT NULL,
    assigned_date timestamp without time zone DEFAULT now(),
    max_points numeric(5,2),
    is_published boolean DEFAULT false,
    reminder_enabled boolean DEFAULT true,
    reminder_days integer DEFAULT 1,
    reminder_sent_at timestamp without time zone,
    notify_students boolean DEFAULT true,
    notify_parents boolean DEFAULT true,
    school_id integer,
    instructions text,
    status text DEFAULT 'active'::text,
    priority text DEFAULT 'medium'::text,
    notify_channels jsonb,
    created_at timestamp without time zone DEFAULT now(),
    archived_at timestamp without time zone,
    archived_by integer,
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    attachments jsonb
);


--
-- Name: homework_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homework_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homework_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homework_id_seq OWNED BY public.homework.id;


--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework_submissions (
    id integer NOT NULL,
    homework_id integer NOT NULL,
    student_id integer NOT NULL,
    submission_text text,
    attachment_url text,
    submitted_at timestamp without time zone DEFAULT now(),
    grade numeric(5,2),
    feedback text,
    teacher_graded_at timestamp without time zone,
    attachment_urls jsonb,
    submission_source text DEFAULT 'web'::text,
    status text DEFAULT 'pending'::text,
    score numeric(5,2),
    grade_by integer,
    graded_at timestamp without time zone,
    parent_notified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homework_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homework_submissions_id_seq OWNED BY public.homework_submissions.id;


--
-- Name: internships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internships (
    id integer NOT NULL,
    student_id integer NOT NULL,
    partner_id integer NOT NULL,
    school_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    start_date character varying(10) NOT NULL,
    end_date character varying(10) NOT NULL,
    duration integer,
    status character varying(20) DEFAULT 'planned'::character varying,
    supervisor_name character varying(255),
    supervisor_email character varying(255),
    supervisor_phone character varying(20),
    student_rating numeric(3,2),
    company_rating numeric(3,2),
    student_feedback text,
    company_feedback text,
    completion_status character varying(20),
    job_offer_received boolean DEFAULT false,
    skills_acquired jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: internships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.internships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: internships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.internships_id_seq OWNED BY public.internships.id;


--
-- Name: library_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_books (
    id integer NOT NULL,
    title jsonb NOT NULL,
    author text NOT NULL,
    description jsonb,
    link_url text,
    cover_url text,
    subject_ids jsonb DEFAULT '[]'::jsonb,
    recommended_level text,
    department_ids jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: library_books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.library_books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: library_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.library_books_id_seq OWNED BY public.library_books.id;


--
-- Name: library_recommendation_audience; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_recommendation_audience (
    id integer NOT NULL,
    recommendation_id integer NOT NULL,
    target_type text NOT NULL,
    target_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: library_recommendation_audience_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.library_recommendation_audience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: library_recommendation_audience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.library_recommendation_audience_id_seq OWNED BY public.library_recommendation_audience.id;


--
-- Name: library_recommendation_dispatch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_recommendation_dispatch (
    id integer NOT NULL,
    recommendation_id integer NOT NULL,
    parent_id integer NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    error text,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: library_recommendation_dispatch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.library_recommendation_dispatch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: library_recommendation_dispatch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.library_recommendation_dispatch_id_seq OWNED BY public.library_recommendation_dispatch.id;


--
-- Name: library_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_recommendations (
    id integer NOT NULL,
    book_id integer NOT NULL,
    teacher_id integer NOT NULL,
    audience_type text NOT NULL,
    audience_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    note text,
    recommended_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: library_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.library_recommendations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: library_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.library_recommendations_id_seq OWNED BY public.library_recommendations.id;


--
-- Name: login_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_activity (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_email character varying(255),
    user_name character varying(255),
    user_role character varying(50),
    ip_address character varying(50),
    country character varying(100),
    city character varying(100),
    login_time timestamp without time zone DEFAULT now(),
    school_id integer,
    school_name character varying(255)
);


--
-- Name: login_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.login_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: login_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.login_activity_id_seq OWNED BY public.login_activity.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    sender_name text,
    sender_role text,
    recipient_id integer NOT NULL,
    recipient_name text,
    recipient_role text,
    school_id integer,
    subject text,
    content text NOT NULL,
    message_type text,
    is_read boolean DEFAULT false,
    status text DEFAULT 'sent'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: monthly_absence_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_absence_reports (
    id integer NOT NULL,
    school_id integer NOT NULL,
    generated_by integer NOT NULL,
    report_month integer NOT NULL,
    report_year integer NOT NULL,
    academic_year text NOT NULL,
    total_absences integer DEFAULT 0,
    resolved_absences integer DEFAULT 0,
    unresolved_absences integer DEFAULT 0,
    average_resolution_time numeric(5,2),
    most_absent_teacher integer,
    most_common_reason text,
    total_affected_students integer DEFAULT 0,
    total_affected_classes integer DEFAULT 0,
    total_notifications_sent integer DEFAULT 0,
    substitute_success_rate numeric(5,2),
    report_data jsonb,
    report_file_url text,
    status text DEFAULT 'draft'::text,
    finalized_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: monthly_absence_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.monthly_absence_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_absence_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.monthly_absence_reports_id_seq OWNED BY public.monthly_absence_reports.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    push_notifications boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    phone text,
    auto_open boolean DEFAULT true,
    sound_enabled boolean DEFAULT true,
    vibration_enabled boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    priority text DEFAULT 'normal'::text,
    is_read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    title_fr text,
    title_en text,
    message_fr text,
    message_en text
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: online_class_activations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_class_activations (
    id integer NOT NULL,
    activator_type text NOT NULL,
    activator_id integer NOT NULL,
    duration_type text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    activated_by text NOT NULL,
    admin_user_id integer,
    payment_id text,
    payment_method text,
    amount_paid integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: online_class_activations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_class_activations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_class_activations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_class_activations_id_seq OWNED BY public.online_class_activations.id;


--
-- Name: online_class_recurrences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_class_recurrences (
    id integer NOT NULL,
    school_id integer NOT NULL,
    course_id integer,
    teacher_id integer NOT NULL,
    class_id integer NOT NULL,
    subject_id integer,
    title text NOT NULL,
    description text,
    rule_type character varying(50) NOT NULL,
    "interval" integer DEFAULT 1,
    by_day text[] DEFAULT '{}'::text[],
    start_time character varying(10) NOT NULL,
    duration_minutes integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    paused_at timestamp without time zone,
    created_by integer NOT NULL,
    auto_notify boolean DEFAULT true,
    occurrences_generated integer DEFAULT 0,
    last_generated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: online_class_recurrences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_class_recurrences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_class_recurrences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_class_recurrences_id_seq OWNED BY public.online_class_recurrences.id;


--
-- Name: online_class_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_class_usage_logs (
    id integer NOT NULL,
    activation_id integer NOT NULL,
    session_id integer NOT NULL,
    teacher_id integer NOT NULL,
    school_id integer,
    session_duration integer,
    participant_count integer,
    was_within_allowed_window boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: online_class_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_class_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_class_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_class_usage_logs_id_seq OWNED BY public.online_class_usage_logs.id;


--
-- Name: online_classes_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_classes_subscriptions (
    id integer NOT NULL,
    school_id integer NOT NULL,
    is_active boolean DEFAULT false,
    plan text DEFAULT 'premium'::text,
    monthly_price integer DEFAULT 250000,
    currency text DEFAULT 'XAF'::text,
    activated_at timestamp without time zone,
    expires_at timestamp without time zone,
    auto_renew boolean DEFAULT true,
    stripe_subscription_id text,
    stripe_customer_id text,
    last_payment_at timestamp without time zone,
    next_payment_at timestamp without time zone,
    grace_period_ends timestamp without time zone,
    canceled_at timestamp without time zone,
    cancel_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: online_classes_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_classes_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_classes_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_classes_subscriptions_id_seq OWNED BY public.online_classes_subscriptions.id;


--
-- Name: online_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_courses (
    id integer NOT NULL,
    school_id integer,
    title text NOT NULL,
    description text,
    subject_id integer,
    class_id integer,
    teacher_id integer NOT NULL,
    language text DEFAULT 'fr'::text,
    is_active boolean DEFAULT true,
    max_participants integer DEFAULT 50,
    allow_recording boolean DEFAULT true,
    require_approval boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_independent boolean DEFAULT false
);


--
-- Name: online_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_courses_id_seq OWNED BY public.online_courses.id;


--
-- Name: page_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_visits (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_email text NOT NULL,
    user_role text NOT NULL,
    page_path text NOT NULL,
    module_name text,
    dashboard_type text,
    time_spent integer,
    ip_address text NOT NULL,
    session_id text,
    visit_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: page_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.page_visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: page_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.page_visits_id_seq OWNED BY public.page_visits.id;


--
-- Name: parent_request_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_request_notifications (
    id integer NOT NULL,
    request_id integer NOT NULL,
    recipient_id integer NOT NULL,
    recipient_type text NOT NULL,
    channel text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: parent_request_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parent_request_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parent_request_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parent_request_notifications_id_seq OWNED BY public.parent_request_notifications.id;


--
-- Name: parent_request_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_request_responses (
    id integer NOT NULL,
    request_id integer NOT NULL,
    responder_id integer NOT NULL,
    response text NOT NULL,
    response_type text NOT NULL,
    is_public boolean DEFAULT false,
    attachments text[],
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: parent_request_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parent_request_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parent_request_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parent_request_responses_id_seq OWNED BY public.parent_request_responses.id;


--
-- Name: parent_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_requests (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    student_id integer NOT NULL,
    school_id integer NOT NULL,
    type text NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'pending'::text,
    requested_date text,
    attachments text[],
    admin_response text,
    response_date timestamp without time zone,
    processed_by integer,
    notes text,
    is_urgent boolean DEFAULT false,
    requires_approval boolean DEFAULT true,
    notifications_sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    school_code text,
    child_first_name text,
    child_last_name text,
    child_date_of_birth text,
    relationship_type text,
    contact_phone text,
    response_message text,
    responded_at timestamp without time zone,
    responded_by integer
);


--
-- Name: parent_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parent_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parent_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parent_requests_id_seq OWNED BY public.parent_requests.id;


--
-- Name: parent_student_relations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_student_relations (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    student_id integer NOT NULL,
    relationship text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'approved'::text,
    requested_by text,
    verification_code text,
    approved_at timestamp without time zone
);


--
-- Name: parent_student_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parent_student_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parent_student_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parent_student_relations_id_seq OWNED BY public.parent_student_relations.id;


--
-- Name: partnership_communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnership_communications (
    id integer NOT NULL,
    agreement_id integer NOT NULL,
    sender_id integer NOT NULL,
    recipient_email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    message_type character varying(50) DEFAULT 'general'::character varying,
    status character varying(20) DEFAULT 'sent'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: partnership_communications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partnership_communications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partnership_communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partnership_communications_id_seq OWNED BY public.partnership_communications.id;


--
-- Name: payment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_items (
    id integer NOT NULL,
    payment_id integer NOT NULL,
    assigned_fee_id integer NOT NULL,
    amount integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payment_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_items_id_seq OWNED BY public.payment_items.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    school_id integer,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text,
    type text NOT NULL,
    status text NOT NULL,
    stripe_payment_intent_id text,
    stripe_subscription_id text,
    description text,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: predefined_appreciations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.predefined_appreciations (
    id integer NOT NULL,
    school_id integer,
    created_by integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    target_role text NOT NULL,
    appreciation_fr text NOT NULL,
    appreciation_en text NOT NULL,
    subject_context text,
    competency_level text,
    grade_range jsonb,
    is_active boolean DEFAULT true,
    is_global boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: predefined_appreciations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.predefined_appreciations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: predefined_appreciations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.predefined_appreciations_id_seq OWNED BY public.predefined_appreciations.id;


--
-- Name: pwa_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pwa_analytics (
    id integer NOT NULL,
    user_id integer,
    session_id text NOT NULL,
    access_method text NOT NULL,
    device_type text,
    user_agent text,
    is_standalone boolean DEFAULT false,
    is_pwa_installed boolean DEFAULT false,
    push_permission_granted boolean DEFAULT false,
    session_duration integer,
    pages_visited integer DEFAULT 1,
    actions_performed integer DEFAULT 0,
    offline_time integer DEFAULT 0,
    ip_address text,
    country text,
    city text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pwa_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pwa_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pwa_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pwa_analytics_id_seq OWNED BY public.pwa_analytics.id;


--
-- Name: replacement_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.replacement_notifications (
    id integer NOT NULL,
    replacement_id integer NOT NULL,
    recipient_id integer NOT NULL,
    notification_type character varying(50) NOT NULL,
    channel character varying(50) NOT NULL,
    sent_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'sent'::character varying
);


--
-- Name: replacement_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.replacement_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replacement_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.replacement_notifications_id_seq OWNED BY public.replacement_notifications.id;


--
-- Name: role_affiliations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_affiliations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL,
    school_id integer,
    description text,
    status text DEFAULT 'active'::text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: role_affiliations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_affiliations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_affiliations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_affiliations_id_seq OWNED BY public.role_affiliations.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    name text NOT NULL,
    school_id integer NOT NULL,
    capacity integer,
    is_occupied boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    type text DEFAULT 'classroom'::text,
    building text,
    floor text,
    equipment text
);


--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: safe_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safe_zones (
    id integer NOT NULL,
    school_id integer NOT NULL,
    parent_id integer,
    name text NOT NULL,
    description text,
    type text DEFAULT 'custom'::text,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    radius integer DEFAULT 100 NOT NULL,
    is_active boolean DEFAULT true,
    alert_on_entry boolean DEFAULT false,
    alert_on_exit boolean DEFAULT true,
    children_ids jsonb,
    schedule jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: safe_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.safe_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: safe_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.safe_zones_id_seq OWNED BY public.safe_zones.id;


--
-- Name: school_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_levels (
    id integer NOT NULL,
    school_id integer NOT NULL,
    name text NOT NULL,
    name_fr text,
    name_en text,
    "order" integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: school_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_levels_id_seq OWNED BY public.school_levels.id;


--
-- Name: school_parent_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_parent_pricing (
    id integer NOT NULL,
    school_id integer NOT NULL,
    communication_enabled boolean DEFAULT true,
    communication_price integer DEFAULT 5000,
    communication_period text DEFAULT 'annual'::text,
    geolocation_enabled boolean DEFAULT true,
    geolocation_price integer DEFAULT 5000,
    geolocation_period text DEFAULT 'annual'::text,
    discount_2_children integer DEFAULT 20,
    discount_3plus_children integer DEFAULT 40,
    updated_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: school_parent_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_parent_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_parent_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_parent_pricing_id_seq OWNED BY public.school_parent_pricing.id;


--
-- Name: school_partnership_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_partnership_agreements (
    id integer NOT NULL,
    school_id integer NOT NULL,
    partner_id integer NOT NULL,
    agreement_type character varying(50) NOT NULL,
    start_date character varying(10),
    end_date character varying(10),
    status character varying(20) DEFAULT 'active'::character varying,
    terms text,
    contact_frequency character varying(20),
    last_contact_date character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: school_partnership_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.school_partnership_agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: school_partnership_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.school_partnership_agreements_id_seq OWNED BY public.school_partnership_agreements.id;


--
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    address text,
    phone text,
    email text,
    logo_url text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    school_logo_url text,
    logo_uploaded_at timestamp without time zone,
    academic_year text,
    current_term text,
    educafric_number text,
    educational_type text DEFAULT 'general'::text NOT NULL,
    term_start_date timestamp without time zone,
    term_end_date timestamp without time zone,
    settings jsonb,
    regionale_ministerielle text,
    delegation_departementale text,
    boite_postale text,
    arrondissement text,
    geolocation_enabled boolean DEFAULT false,
    pwa_enabled boolean DEFAULT true,
    whatsapp_enabled boolean DEFAULT false,
    sms_enabled boolean DEFAULT false,
    email_enabled boolean DEFAULT true,
    use_cba_format boolean DEFAULT false,
    website text,
    description text,
    established_year integer,
    principal_name text,
    student_capacity integer,
    is_sandbox boolean DEFAULT false NOT NULL,
    offline_premium_enabled boolean DEFAULT false NOT NULL,
    communications_enabled boolean DEFAULT true NOT NULL,
    educational_content_enabled boolean DEFAULT true NOT NULL,
    delegate_admins_enabled boolean DEFAULT true NOT NULL,
    canteen_enabled boolean DEFAULT true NOT NULL,
    school_bus_enabled boolean DEFAULT true NOT NULL,
    online_classes_enabled boolean DEFAULT true NOT NULL,
    slogan character varying(255),
    country_code text DEFAULT 'CM'::text NOT NULL,
    currency text DEFAULT 'XAF'::text
);


--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatures (
    id integer NOT NULL,
    school_id integer,
    user_id integer,
    signature_type character varying(50) DEFAULT 'principal'::character varying NOT NULL,
    signature_data text NOT NULL,
    signatory_name character varying(255),
    signatory_title character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    user_role character varying(50) DEFAULT 'director'::character varying
);


--
-- Name: signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.signatures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.signatures_id_seq OWNED BY public.signatures.id;


--
-- Name: subject_competency_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subject_competency_assignments (
    id integer NOT NULL,
    school_id integer NOT NULL,
    subject_id integer NOT NULL,
    competency_id integer NOT NULL,
    form_level text NOT NULL,
    display_order integer DEFAULT 1,
    is_required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: subject_competency_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subject_competency_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subject_competency_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subject_competency_assignments_id_seq OWNED BY public.subject_competency_assignments.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    code text NOT NULL,
    coefficient numeric(3,2) DEFAULT 1.00,
    school_id integer NOT NULL,
    class_id integer,
    bulletin_section text,
    subject_type text DEFAULT 'general'::text,
    name text,
    category text DEFAULT 'general'::text,
    hours_per_week integer DEFAULT 2,
    is_required boolean DEFAULT true
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    school_id integer,
    key text NOT NULL,
    value text,
    type text DEFAULT 'string'::text,
    description text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: teacher_absence_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_absence_actions (
    id integer NOT NULL,
    absence_id integer NOT NULL,
    action_type text NOT NULL,
    performed_by integer NOT NULL,
    action_details jsonb,
    target_audience text,
    notification_method text,
    message_template text,
    recipient_count integer DEFAULT 0,
    successful_deliveries integer DEFAULT 0,
    failed_deliveries integer DEFAULT 0,
    status text DEFAULT 'pending'::text,
    completed_at timestamp without time zone,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_absence_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_absence_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_absence_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_absence_actions_id_seq OWNED BY public.teacher_absence_actions.id;


--
-- Name: teacher_absence_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_absence_notifications (
    id integer NOT NULL,
    absence_id integer NOT NULL,
    recipient_id integer NOT NULL,
    recipient_type text NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_absence_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_absence_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_absence_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_absence_notifications_id_seq OWNED BY public.teacher_absence_notifications.id;


--
-- Name: teacher_absences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_absences (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    school_id integer NOT NULL,
    class_id integer NOT NULL,
    subject_id integer NOT NULL,
    absence_date text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    replacement_teacher_id integer,
    notes text,
    notifications_sent boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    urgency text DEFAULT 'medium'::text,
    contact_phone text,
    contact_email text,
    details text,
    classes_affected text[],
    end_date text
);


--
-- Name: teacher_absences_enhanced; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_absences_enhanced (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    school_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    reason text NOT NULL,
    absence_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    approved_by integer,
    approved_at timestamp without time zone,
    affected_classes jsonb,
    notifications_sent boolean DEFAULT false,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_absences_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_absences_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_absences_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_absences_enhanced_id_seq OWNED BY public.teacher_absences_enhanced.id;


--
-- Name: teacher_absences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_absences_id_seq OWNED BY public.teacher_absences.id;


--
-- Name: teacher_bulletin_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_bulletin_preferences (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    school_id integer NOT NULL,
    term character varying(10) NOT NULL,
    academic_year character varying(20) NOT NULL,
    include_comments boolean DEFAULT true,
    include_rankings boolean DEFAULT true,
    include_statistics boolean DEFAULT true,
    include_performance_levels boolean DEFAULT false,
    include_first_trimester boolean DEFAULT false,
    include_discipline boolean DEFAULT false,
    include_student_work boolean DEFAULT false,
    include_class_profile boolean DEFAULT false,
    include_unjustified_absences boolean DEFAULT false,
    include_justified_absences boolean DEFAULT false,
    include_lateness boolean DEFAULT false,
    include_detentions boolean DEFAULT false,
    include_conduct_warning boolean DEFAULT false,
    include_conduct_blame boolean DEFAULT false,
    include_exclusions boolean DEFAULT false,
    include_permanent_exclusion boolean DEFAULT false,
    include_total_general boolean DEFAULT false,
    include_appreciations boolean DEFAULT false,
    include_general_average boolean DEFAULT false,
    include_trimester_average boolean DEFAULT false,
    include_number_of_averages boolean DEFAULT false,
    include_success_rate boolean DEFAULT false,
    include_coef boolean DEFAULT false,
    include_ctba boolean DEFAULT false,
    include_min_max boolean DEFAULT false,
    include_cba boolean DEFAULT false,
    include_ca boolean DEFAULT false,
    include_cma boolean DEFAULT false,
    include_cote boolean DEFAULT false,
    include_cna boolean DEFAULT false,
    include_work_appreciation boolean DEFAULT false,
    include_parent_visa boolean DEFAULT false,
    include_teacher_visa boolean DEFAULT false,
    include_headmaster_visa boolean DEFAULT false,
    include_class_council_decisions boolean DEFAULT false,
    include_class_council_mentions boolean DEFAULT false,
    include_orientation_recommendations boolean DEFAULT false,
    include_council_date boolean DEFAULT false,
    generation_format character varying(20) DEFAULT 'pdf'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_bulletin_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_bulletin_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_bulletin_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_bulletin_preferences_id_seq OWNED BY public.teacher_bulletin_preferences.id;


--
-- Name: teacher_bulletins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_bulletins (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    school_id integer NOT NULL,
    student_id integer NOT NULL,
    class_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    student_info jsonb NOT NULL,
    subjects jsonb NOT NULL,
    discipline jsonb NOT NULL,
    bulletin_type text,
    language text DEFAULT 'fr'::text,
    status text DEFAULT 'draft'::text NOT NULL,
    signed_at timestamp without time zone,
    signature_hash text,
    sent_to_school_at timestamp without time zone,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    review_status text,
    review_comments text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_third_trimester boolean DEFAULT false,
    annual_summary jsonb
);


--
-- Name: teacher_bulletins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_bulletins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_bulletins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_bulletins_id_seq OWNED BY public.teacher_bulletins.id;


--
-- Name: teacher_grade_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_grade_submissions (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    subject_id integer NOT NULL,
    class_id integer NOT NULL,
    school_id integer NOT NULL,
    term text NOT NULL,
    academic_year text NOT NULL,
    first_evaluation numeric(5,2),
    second_evaluation numeric(5,2),
    third_evaluation numeric(5,2),
    coefficient integer DEFAULT 1 NOT NULL,
    max_score numeric(5,2) DEFAULT 20.00,
    term_average numeric(5,2),
    weighted_score numeric(5,2),
    subject_comments text,
    student_rank integer,
    is_submitted boolean DEFAULT false,
    submitted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    review_status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    review_feedback text,
    return_reason text,
    review_priority text DEFAULT 'normal'::text,
    requires_attention boolean DEFAULT false,
    last_status_change timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teacher_grade_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_grade_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_grade_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_grade_submissions_id_seq OWNED BY public.teacher_grade_submissions.id;


--
-- Name: teacher_independent_activations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_independent_activations (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    duration_type text DEFAULT 'yearly'::text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    activated_by text NOT NULL,
    admin_user_id integer,
    payment_id text,
    payment_method text,
    amount_paid integer DEFAULT 25000,
    currency text DEFAULT 'XAF'::text,
    notes text,
    auto_renew boolean DEFAULT false,
    canceled_at timestamp without time zone,
    cancel_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_independent_activations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_independent_activations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_independent_activations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_independent_activations_id_seq OWNED BY public.teacher_independent_activations.id;


--
-- Name: teacher_independent_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_independent_payments (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    parent_id integer,
    session_id integer,
    amount integer NOT NULL,
    currency text DEFAULT 'XAF'::text,
    payment_method text NOT NULL,
    payment_intent_id text,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    period_start timestamp without time zone,
    period_end timestamp without time zone,
    notes text,
    receipt_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teacher_independent_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_independent_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_independent_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_independent_payments_id_seq OWNED BY public.teacher_independent_payments.id;


--
-- Name: teacher_independent_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_independent_sessions (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    title text NOT NULL,
    description text,
    subject text NOT NULL,
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone NOT NULL,
    actual_start timestamp without time zone,
    actual_end timestamp without time zone,
    session_type text DEFAULT 'online'::text,
    location text,
    room_name text,
    room_password text,
    meeting_url text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    cancel_reason text,
    teacher_notes text,
    student_feedback text,
    rating integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_independent_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_independent_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_independent_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_independent_sessions_id_seq OWNED BY public.teacher_independent_sessions.id;


--
-- Name: teacher_independent_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_independent_students (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    connection_date timestamp without time zone DEFAULT now(),
    connection_method text DEFAULT 'teacher_invite'::text,
    subjects text[],
    level text,
    objectives text,
    status text DEFAULT 'active'::text NOT NULL,
    ended_at timestamp without time zone,
    end_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_independent_students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_independent_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_independent_students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_independent_students_id_seq OWNED BY public.teacher_independent_students.id;


--
-- Name: teacher_notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_notification_preferences (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    email_enabled boolean DEFAULT true,
    whatsapp_enabled boolean DEFAULT true,
    in_app_enabled boolean DEFAULT true,
    notify_on_approval boolean DEFAULT true,
    notify_on_return boolean DEFAULT true,
    notify_on_reminder boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_notification_preferences_id_seq OWNED BY public.teacher_notification_preferences.id;


--
-- Name: teacher_replacements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_replacements (
    id integer NOT NULL,
    absence_id integer NOT NULL,
    school_id integer NOT NULL,
    original_teacher_id integer NOT NULL,
    replacement_teacher_id integer,
    class_id integer NOT NULL,
    subject_id integer NOT NULL,
    session_date timestamp without time zone NOT NULL,
    session_time text,
    status text DEFAULT 'pending'::text,
    assigned_by integer,
    assigned_at timestamp without time zone,
    confirmed_by integer,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text,
    notifications_sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: teacher_replacements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_replacements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_replacements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_replacements_id_seq OWNED BY public.teacher_replacements.id;


--
-- Name: teacher_student_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_student_invitations (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    target_type text NOT NULL,
    target_id integer NOT NULL,
    student_id integer,
    subjects text[],
    level text,
    message text,
    price_per_hour integer,
    price_per_session integer,
    currency text DEFAULT 'XAF'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    response_message text,
    responded_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teacher_student_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_student_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_student_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_student_invitations_id_seq OWNED BY public.teacher_student_invitations.id;


--
-- Name: teacher_subject_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_subject_assignments (
    id integer NOT NULL,
    school_id integer NOT NULL,
    teacher_id integer NOT NULL,
    class_id integer NOT NULL,
    subject_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teacher_subject_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_subject_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_subject_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_subject_assignments_id_seq OWNED BY public.teacher_subject_assignments.id;


--
-- Name: terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.terms (
    id integer NOT NULL,
    name text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    academic_year_id integer NOT NULL,
    is_active boolean DEFAULT false
);


--
-- Name: terms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.terms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: terms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.terms_id_seq OWNED BY public.terms.id;


--
-- Name: timetable_change_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetable_change_requests (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    school_id integer NOT NULL,
    timetable_id integer,
    change_type text NOT NULL,
    current_details jsonb,
    requested_details jsonb,
    reason text NOT NULL,
    urgency text DEFAULT 'normal'::text,
    status text DEFAULT 'pending'::text,
    admin_response text,
    responded_by integer,
    responded_at timestamp without time zone,
    is_read_by_teacher boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: timetable_change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timetable_change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timetable_change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timetable_change_requests_id_seq OWNED BY public.timetable_change_requests.id;


--
-- Name: timetable_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetable_notifications (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    timetable_id integer,
    change_type character varying(20) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer,
    CONSTRAINT timetable_notifications_change_type_check CHECK (((change_type)::text = ANY ((ARRAY['created'::character varying, 'updated'::character varying, 'deleted'::character varying])::text[])))
);


--
-- Name: timetable_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timetable_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timetable_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timetable_notifications_id_seq OWNED BY public.timetable_notifications.id;


--
-- Name: timetable_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetable_slots (
    id integer NOT NULL,
    class_id integer NOT NULL,
    subject_id integer NOT NULL,
    teacher_id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    room text,
    academic_year_id integer NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: timetable_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timetable_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timetable_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timetable_slots_id_seq OWNED BY public.timetable_slots.id;


--
-- Name: timetables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetables (
    id integer NOT NULL,
    school_id integer NOT NULL,
    teacher_id integer NOT NULL,
    class_id integer NOT NULL,
    subject_name character varying(255) NOT NULL,
    day_of_week integer NOT NULL,
    start_time character varying(8) NOT NULL,
    end_time character varying(8) NOT NULL,
    room character varying(255),
    academic_year character varying(20) NOT NULL,
    term character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by integer,
    last_modified_by integer,
    notes text,
    CONSTRAINT timetables_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: timetables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timetables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timetables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timetables_id_seq OWNED BY public.timetables.id;


--
-- Name: tracking_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracking_devices (
    id integer NOT NULL,
    user_id integer NOT NULL,
    student_id integer,
    device_name text,
    device_type text,
    is_active boolean DEFAULT true,
    current_latitude text,
    current_longitude text,
    location_accuracy text,
    current_address text,
    last_location jsonb,
    battery_level integer,
    last_seen timestamp without time zone,
    tracking_settings jsonb,
    last_update timestamp without time zone,
    updated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: tracking_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tracking_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tracking_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tracking_devices_id_seq OWNED BY public.tracking_devices.id;


--
-- Name: tutorial_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    current_step integer DEFAULT 0,
    completed boolean DEFAULT false,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tutorial_version text DEFAULT '1.0'::text NOT NULL,
    is_completed boolean DEFAULT false,
    total_steps integer DEFAULT 0,
    last_accessed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    skipped_at timestamp without time zone,
    user_role text DEFAULT 'Student'::text NOT NULL,
    device_type text,
    completion_method text,
    session_data text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tutorial_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tutorial_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutorial_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tutorial_progress_id_seq OWNED BY public.tutorial_progress.id;


--
-- Name: tutorial_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_steps (
    id integer NOT NULL,
    user_id integer NOT NULL,
    step_id character varying(255) NOT NULL,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: tutorial_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tutorial_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutorial_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tutorial_steps_id_seq OWNED BY public.tutorial_steps.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date text NOT NULL,
    type text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text,
    password text NOT NULL,
    role text NOT NULL,
    secondary_roles text[],
    first_name text NOT NULL,
    last_name text NOT NULL,
    gender text,
    phone text,
    school_id integer,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text DEFAULT 'inactive'::text,
    two_factor_enabled boolean DEFAULT false,
    firebase_uid text,
    is_test_account boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_reset_token text,
    password_reset_expiry timestamp without time zone,
    last_login_at timestamp without time zone,
    profile_picture_url text,
    preferred_language character varying(2) DEFAULT 'en'::character varying,
    whatsapp_number character varying(20),
    photo_url text,
    two_factor_secret text,
    two_factor_backup_codes text[],
    two_factor_verified_at timestamp without time zone,
    stripe_payment_intent_id text,
    subscription_plan text DEFAULT 'free'::text,
    subscription_start timestamp without time zone DEFAULT now(),
    subscription_end timestamp without time zone,
    last_login timestamp without time zone,
    session_data jsonb DEFAULT '{}'::jsonb,
    active_role text,
    role_history text,
    deletion_requested text,
    deletion_requested_at text,
    deletion_approved_by text,
    deletion_approved_at text,
    is_pwa_user boolean DEFAULT false,
    last_pwa_access timestamp without time zone,
    pwa_install_date timestamp without time zone,
    access_method text DEFAULT 'web'::text,
    teacher_signature_url text,
    is_principal_teacher boolean DEFAULT false,
    principal_of_class_id integer,
    signature_required boolean DEFAULT false,
    signature_uploaded_at timestamp without time zone,
    delegated_permissions text[],
    delegated_by_user_id integer,
    delegation_level text,
    delegation_expiry timestamp without time zone,
    can_delegate boolean DEFAULT false,
    facebook_id text,
    date_of_birth character varying(255),
    place_of_birth character varying(255),
    educafric_number text,
    guardian text,
    parent_email text,
    parent_phone text,
    is_repeater boolean DEFAULT false,
    whatsapp_e164 character varying(20),
    wa_opt_in boolean DEFAULT false,
    wa_language character varying(2) DEFAULT 'fr'::character varying,
    preferred_channel text DEFAULT 'email'::text,
    work_mode text DEFAULT 'school'::text,
    bio text,
    "position" text,
    experience integer,
    years_in_position integer,
    profile_image text,
    qualifications text,
    languages text,
    is_active boolean DEFAULT true
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wa_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wa_clicks (
    id integer NOT NULL,
    recipient_id integer NOT NULL,
    template_id text NOT NULL,
    campaign text,
    ip text,
    user_agent text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: wa_clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wa_clicks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wa_clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wa_clicks_id_seq OWNED BY public.wa_clicks.id;


--
-- Name: webpush_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webpush_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh_key text NOT NULL,
    auth_key text NOT NULL,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: webpush_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webpush_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webpush_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webpush_subscriptions_id_seq OWNED BY public.webpush_subscriptions.id;


--
-- Name: whatsapp_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_conversations (
    id integer NOT NULL,
    phone_number text NOT NULL,
    user_id integer,
    user_role text,
    conversation_status text DEFAULT 'active'::text,
    last_message_at timestamp without time zone DEFAULT now(),
    message_count integer DEFAULT 0,
    is_bot boolean DEFAULT true,
    assigned_to integer,
    tags jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: whatsapp_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_conversations_id_seq OWNED BY public.whatsapp_conversations.id;


--
-- Name: whatsapp_faq_knowledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_faq_knowledge (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    keywords text[],
    language text DEFAULT 'fr'::text,
    priority integer DEFAULT 0,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: whatsapp_faq_knowledge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_faq_knowledge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_faq_knowledge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_faq_knowledge_id_seq OWNED BY public.whatsapp_faq_knowledge.id;


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    message_id text,
    direction text NOT NULL,
    from_number text NOT NULL,
    to_number text NOT NULL,
    message_type text DEFAULT 'text'::text,
    content text,
    media_url text,
    status text DEFAULT 'sent'::text,
    is_bot boolean DEFAULT true,
    intent text,
    intent_confidence integer,
    response_time integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_messages_id_seq OWNED BY public.whatsapp_messages.id;


--
-- Name: whatsapp_quick_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_quick_replies (
    id integer NOT NULL,
    trigger text NOT NULL,
    response_text text NOT NULL,
    category text NOT NULL,
    language text DEFAULT 'fr'::text,
    include_actions jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: whatsapp_quick_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_quick_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_quick_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_quick_replies_id_seq OWNED BY public.whatsapp_quick_replies.id;


--
-- Name: zone_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zone_status (
    id integer NOT NULL,
    device_id integer NOT NULL,
    zone_id integer NOT NULL,
    is_in_zone boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: zone_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zone_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zone_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zone_status_id_seq OWNED BY public.zone_status.id;


--
-- Name: academic_years id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years ALTER COLUMN id SET DEFAULT nextval('public.academic_years_id_seq'::regclass);


--
-- Name: archive_access_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archive_access_logs ALTER COLUMN id SET DEFAULT nextval('public.archive_access_logs_id_seq'::regclass);


--
-- Name: archived_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archived_documents ALTER COLUMN id SET DEFAULT nextval('public.archived_documents_id_seq'::regclass);


--
-- Name: assigned_fees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_fees ALTER COLUMN id SET DEFAULT nextval('public.assigned_fees_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: audit_log_access_tracking id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log_access_tracking ALTER COLUMN id SET DEFAULT nextval('public.audit_log_access_tracking_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bulletin_comprehensive id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_comprehensive ALTER COLUMN id SET DEFAULT nextval('public.bulletin_comprehensive_id_seq'::regclass);


--
-- Name: bulletin_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_notifications ALTER COLUMN id SET DEFAULT nextval('public.bulletin_notifications_id_seq'::regclass);


--
-- Name: bulletin_subject_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_subject_codes ALTER COLUMN id SET DEFAULT nextval('public.bulletin_subject_codes_id_seq'::regclass);


--
-- Name: bulletin_verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_verifications ALTER COLUMN id SET DEFAULT nextval('public.bulletin_verifications_id_seq'::regclass);


--
-- Name: bulletin_workflow id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_workflow ALTER COLUMN id SET DEFAULT nextval('public.bulletin_workflow_id_seq'::regclass);


--
-- Name: bulletins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletins ALTER COLUMN id SET DEFAULT nextval('public.bulletins_id_seq'::regclass);


--
-- Name: business_partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_partners ALTER COLUMN id SET DEFAULT nextval('public.business_partners_id_seq'::regclass);


--
-- Name: chat_conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations ALTER COLUMN id SET DEFAULT nextval('public.chat_conversations_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_typing_indicators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_typing_indicators ALTER COLUMN id SET DEFAULT nextval('public.chat_typing_indicators_id_seq'::regclass);


--
-- Name: class_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions ALTER COLUMN id SET DEFAULT nextval('public.class_sessions_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: communication_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_logs ALTER COLUMN id SET DEFAULT nextval('public.communication_logs_id_seq'::regclass);


--
-- Name: competencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencies ALTER COLUMN id SET DEFAULT nextval('public.competencies_id_seq'::regclass);


--
-- Name: competency_evaluation_systems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_evaluation_systems ALTER COLUMN id SET DEFAULT nextval('public.competency_evaluation_systems_id_seq'::regclass);


--
-- Name: competency_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_templates ALTER COLUMN id SET DEFAULT nextval('public.competency_templates_id_seq'::regclass);


--
-- Name: course_enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments ALTER COLUMN id SET DEFAULT nextval('public.course_enrollments_id_seq'::regclass);


--
-- Name: daily_connections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_connections ALTER COLUMN id SET DEFAULT nextval('public.daily_connections_id_seq'::regclass);


--
-- Name: device_location_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_location_history ALTER COLUMN id SET DEFAULT nextval('public.device_location_history_id_seq'::regclass);


--
-- Name: educafric_number_counters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_number_counters ALTER COLUMN id SET DEFAULT nextval('public.educafric_number_counters_id_seq'::regclass);


--
-- Name: educafric_numbers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_numbers ALTER COLUMN id SET DEFAULT nextval('public.educafric_numbers_id_seq'::regclass);


--
-- Name: educational_content id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educational_content ALTER COLUMN id SET DEFAULT nextval('public.educational_content_id_seq'::regclass);


--
-- Name: emergency_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_alerts ALTER COLUMN id SET DEFAULT nextval('public.emergency_alerts_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: fee_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.fee_audit_logs_id_seq'::regclass);


--
-- Name: fee_notification_queue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_notification_queue ALTER COLUMN id SET DEFAULT nextval('public.fee_notification_queue_id_seq'::regclass);


--
-- Name: fee_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_receipts ALTER COLUMN id SET DEFAULT nextval('public.fee_receipts_id_seq'::regclass);


--
-- Name: fee_structures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_structures ALTER COLUMN id SET DEFAULT nextval('public.fee_structures_id_seq'::regclass);


--
-- Name: geofence_violations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_violations ALTER COLUMN id SET DEFAULT nextval('public.geofence_violations_id_seq'::regclass);


--
-- Name: geolocation_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocation_alerts ALTER COLUMN id SET DEFAULT nextval('public.geolocation_alerts_id_seq'::regclass);


--
-- Name: geolocation_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocation_devices ALTER COLUMN id SET DEFAULT nextval('public.geolocation_devices_id_seq'::regclass);


--
-- Name: grade_review_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_review_history ALTER COLUMN id SET DEFAULT nextval('public.grade_review_history_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: homework id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework ALTER COLUMN id SET DEFAULT nextval('public.homework_id_seq'::regclass);


--
-- Name: homework_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions ALTER COLUMN id SET DEFAULT nextval('public.homework_submissions_id_seq'::regclass);


--
-- Name: internships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internships ALTER COLUMN id SET DEFAULT nextval('public.internships_id_seq'::regclass);


--
-- Name: library_books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_books ALTER COLUMN id SET DEFAULT nextval('public.library_books_id_seq'::regclass);


--
-- Name: library_recommendation_audience id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_audience ALTER COLUMN id SET DEFAULT nextval('public.library_recommendation_audience_id_seq'::regclass);


--
-- Name: library_recommendation_dispatch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_dispatch ALTER COLUMN id SET DEFAULT nextval('public.library_recommendation_dispatch_id_seq'::regclass);


--
-- Name: library_recommendations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendations ALTER COLUMN id SET DEFAULT nextval('public.library_recommendations_id_seq'::regclass);


--
-- Name: login_activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_activity ALTER COLUMN id SET DEFAULT nextval('public.login_activity_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: monthly_absence_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_absence_reports ALTER COLUMN id SET DEFAULT nextval('public.monthly_absence_reports_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: online_class_activations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_activations ALTER COLUMN id SET DEFAULT nextval('public.online_class_activations_id_seq'::regclass);


--
-- Name: online_class_recurrences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_recurrences ALTER COLUMN id SET DEFAULT nextval('public.online_class_recurrences_id_seq'::regclass);


--
-- Name: online_class_usage_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.online_class_usage_logs_id_seq'::regclass);


--
-- Name: online_classes_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.online_classes_subscriptions_id_seq'::regclass);


--
-- Name: online_courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_courses ALTER COLUMN id SET DEFAULT nextval('public.online_courses_id_seq'::regclass);


--
-- Name: page_visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_visits ALTER COLUMN id SET DEFAULT nextval('public.page_visits_id_seq'::regclass);


--
-- Name: parent_request_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_request_notifications ALTER COLUMN id SET DEFAULT nextval('public.parent_request_notifications_id_seq'::regclass);


--
-- Name: parent_request_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_request_responses ALTER COLUMN id SET DEFAULT nextval('public.parent_request_responses_id_seq'::regclass);


--
-- Name: parent_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_requests ALTER COLUMN id SET DEFAULT nextval('public.parent_requests_id_seq'::regclass);


--
-- Name: parent_student_relations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_student_relations ALTER COLUMN id SET DEFAULT nextval('public.parent_student_relations_id_seq'::regclass);


--
-- Name: partnership_communications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_communications ALTER COLUMN id SET DEFAULT nextval('public.partnership_communications_id_seq'::regclass);


--
-- Name: payment_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_items ALTER COLUMN id SET DEFAULT nextval('public.payment_items_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: predefined_appreciations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.predefined_appreciations ALTER COLUMN id SET DEFAULT nextval('public.predefined_appreciations_id_seq'::regclass);


--
-- Name: pwa_analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pwa_analytics ALTER COLUMN id SET DEFAULT nextval('public.pwa_analytics_id_seq'::regclass);


--
-- Name: replacement_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_notifications ALTER COLUMN id SET DEFAULT nextval('public.replacement_notifications_id_seq'::regclass);


--
-- Name: role_affiliations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_affiliations ALTER COLUMN id SET DEFAULT nextval('public.role_affiliations_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: safe_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safe_zones ALTER COLUMN id SET DEFAULT nextval('public.safe_zones_id_seq'::regclass);


--
-- Name: school_levels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_levels ALTER COLUMN id SET DEFAULT nextval('public.school_levels_id_seq'::regclass);


--
-- Name: school_parent_pricing id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_parent_pricing ALTER COLUMN id SET DEFAULT nextval('public.school_parent_pricing_id_seq'::regclass);


--
-- Name: school_partnership_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_partnership_agreements ALTER COLUMN id SET DEFAULT nextval('public.school_partnership_agreements_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: signatures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures ALTER COLUMN id SET DEFAULT nextval('public.signatures_id_seq'::regclass);


--
-- Name: subject_competency_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject_competency_assignments ALTER COLUMN id SET DEFAULT nextval('public.subject_competency_assignments_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: teacher_absence_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absence_actions ALTER COLUMN id SET DEFAULT nextval('public.teacher_absence_actions_id_seq'::regclass);


--
-- Name: teacher_absence_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absence_notifications ALTER COLUMN id SET DEFAULT nextval('public.teacher_absence_notifications_id_seq'::regclass);


--
-- Name: teacher_absences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absences ALTER COLUMN id SET DEFAULT nextval('public.teacher_absences_id_seq'::regclass);


--
-- Name: teacher_absences_enhanced id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absences_enhanced ALTER COLUMN id SET DEFAULT nextval('public.teacher_absences_enhanced_id_seq'::regclass);


--
-- Name: teacher_bulletin_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_bulletin_preferences ALTER COLUMN id SET DEFAULT nextval('public.teacher_bulletin_preferences_id_seq'::regclass);


--
-- Name: teacher_bulletins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_bulletins ALTER COLUMN id SET DEFAULT nextval('public.teacher_bulletins_id_seq'::regclass);


--
-- Name: teacher_grade_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_grade_submissions ALTER COLUMN id SET DEFAULT nextval('public.teacher_grade_submissions_id_seq'::regclass);


--
-- Name: teacher_independent_activations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_activations ALTER COLUMN id SET DEFAULT nextval('public.teacher_independent_activations_id_seq'::regclass);


--
-- Name: teacher_independent_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_payments ALTER COLUMN id SET DEFAULT nextval('public.teacher_independent_payments_id_seq'::regclass);


--
-- Name: teacher_independent_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_sessions ALTER COLUMN id SET DEFAULT nextval('public.teacher_independent_sessions_id_seq'::regclass);


--
-- Name: teacher_independent_students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_students ALTER COLUMN id SET DEFAULT nextval('public.teacher_independent_students_id_seq'::regclass);


--
-- Name: teacher_notification_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.teacher_notification_preferences_id_seq'::regclass);


--
-- Name: teacher_replacements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_replacements ALTER COLUMN id SET DEFAULT nextval('public.teacher_replacements_id_seq'::regclass);


--
-- Name: teacher_student_invitations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_student_invitations ALTER COLUMN id SET DEFAULT nextval('public.teacher_student_invitations_id_seq'::regclass);


--
-- Name: teacher_subject_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_subject_assignments ALTER COLUMN id SET DEFAULT nextval('public.teacher_subject_assignments_id_seq'::regclass);


--
-- Name: terms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.terms ALTER COLUMN id SET DEFAULT nextval('public.terms_id_seq'::regclass);


--
-- Name: timetable_change_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_change_requests ALTER COLUMN id SET DEFAULT nextval('public.timetable_change_requests_id_seq'::regclass);


--
-- Name: timetable_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_notifications ALTER COLUMN id SET DEFAULT nextval('public.timetable_notifications_id_seq'::regclass);


--
-- Name: timetable_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_slots ALTER COLUMN id SET DEFAULT nextval('public.timetable_slots_id_seq'::regclass);


--
-- Name: timetables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables ALTER COLUMN id SET DEFAULT nextval('public.timetables_id_seq'::regclass);


--
-- Name: tracking_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_devices ALTER COLUMN id SET DEFAULT nextval('public.tracking_devices_id_seq'::regclass);


--
-- Name: tutorial_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_progress ALTER COLUMN id SET DEFAULT nextval('public.tutorial_progress_id_seq'::regclass);


--
-- Name: tutorial_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_steps ALTER COLUMN id SET DEFAULT nextval('public.tutorial_steps_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wa_clicks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wa_clicks ALTER COLUMN id SET DEFAULT nextval('public.wa_clicks_id_seq'::regclass);


--
-- Name: webpush_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webpush_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.webpush_subscriptions_id_seq'::regclass);


--
-- Name: whatsapp_conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_conversations_id_seq'::regclass);


--
-- Name: whatsapp_faq_knowledge id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_faq_knowledge ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_faq_knowledge_id_seq'::regclass);


--
-- Name: whatsapp_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_messages_id_seq'::regclass);


--
-- Name: whatsapp_quick_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_quick_replies ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_quick_replies_id_seq'::regclass);


--
-- Name: zone_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zone_status ALTER COLUMN id SET DEFAULT nextval('public.zone_status_id_seq'::regclass);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: archive_access_logs archive_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archive_access_logs
    ADD CONSTRAINT archive_access_logs_pkey PRIMARY KEY (id);


--
-- Name: archived_documents archived_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archived_documents
    ADD CONSTRAINT archived_documents_pkey PRIMARY KEY (id);


--
-- Name: assigned_fees assigned_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_fees
    ADD CONSTRAINT assigned_fees_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audit_log_access_tracking audit_log_access_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log_access_tracking
    ADD CONSTRAINT audit_log_access_tracking_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bulletin_comprehensive bulletin_comprehensive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_comprehensive
    ADD CONSTRAINT bulletin_comprehensive_pkey PRIMARY KEY (id);


--
-- Name: bulletin_notifications bulletin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_notifications
    ADD CONSTRAINT bulletin_notifications_pkey PRIMARY KEY (id);


--
-- Name: bulletin_subject_codes bulletin_subject_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_subject_codes
    ADD CONSTRAINT bulletin_subject_codes_pkey PRIMARY KEY (id);


--
-- Name: bulletin_verifications bulletin_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_pkey PRIMARY KEY (id);


--
-- Name: bulletin_verifications bulletin_verifications_short_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_short_code_key UNIQUE (short_code);


--
-- Name: bulletin_verifications bulletin_verifications_verification_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_verifications
    ADD CONSTRAINT bulletin_verifications_verification_code_key UNIQUE (verification_code);


--
-- Name: bulletin_workflow bulletin_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletin_workflow
    ADD CONSTRAINT bulletin_workflow_pkey PRIMARY KEY (id);


--
-- Name: bulletins bulletins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulletins
    ADD CONSTRAINT bulletins_pkey PRIMARY KEY (id);


--
-- Name: business_partners business_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_partners
    ADD CONSTRAINT business_partners_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_typing_indicators chat_typing_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_typing_indicators
    ADD CONSTRAINT chat_typing_indicators_pkey PRIMARY KEY (id);


--
-- Name: class_sessions class_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_pkey PRIMARY KEY (id);


--
-- Name: class_sessions class_sessions_room_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_room_name_key UNIQUE (room_name);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: communication_logs communication_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_logs
    ADD CONSTRAINT communication_logs_pkey PRIMARY KEY (id);


--
-- Name: competencies competencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_pkey PRIMARY KEY (id);


--
-- Name: competency_evaluation_systems competency_evaluation_systems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_evaluation_systems
    ADD CONSTRAINT competency_evaluation_systems_pkey PRIMARY KEY (id);


--
-- Name: competency_templates competency_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_templates
    ADD CONSTRAINT competency_templates_pkey PRIMARY KEY (id);


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: daily_connections daily_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_connections
    ADD CONSTRAINT daily_connections_pkey PRIMARY KEY (id);


--
-- Name: device_location_history device_location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_location_history
    ADD CONSTRAINT device_location_history_pkey PRIMARY KEY (id);


--
-- Name: educafric_number_counters educafric_number_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_number_counters
    ADD CONSTRAINT educafric_number_counters_pkey PRIMARY KEY (id);


--
-- Name: educafric_number_counters educafric_number_counters_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_number_counters
    ADD CONSTRAINT educafric_number_counters_type_key UNIQUE (type);


--
-- Name: educafric_numbers educafric_numbers_educafric_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_numbers
    ADD CONSTRAINT educafric_numbers_educafric_number_key UNIQUE (educafric_number);


--
-- Name: educafric_numbers educafric_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educafric_numbers
    ADD CONSTRAINT educafric_numbers_pkey PRIMARY KEY (id);


--
-- Name: educational_content educational_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_pkey PRIMARY KEY (id);


--
-- Name: emergency_alerts emergency_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: fee_audit_logs fee_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_audit_logs
    ADD CONSTRAINT fee_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: fee_notification_queue fee_notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_notification_queue
    ADD CONSTRAINT fee_notification_queue_pkey PRIMARY KEY (id);


--
-- Name: fee_receipts fee_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_receipts
    ADD CONSTRAINT fee_receipts_pkey PRIMARY KEY (id);


--
-- Name: fee_receipts fee_receipts_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_receipts
    ADD CONSTRAINT fee_receipts_receipt_number_key UNIQUE (receipt_number);


--
-- Name: fee_structures fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);


--
-- Name: geofence_violations geofence_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_violations
    ADD CONSTRAINT geofence_violations_pkey PRIMARY KEY (id);


--
-- Name: geolocation_alerts geolocation_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocation_alerts
    ADD CONSTRAINT geolocation_alerts_pkey PRIMARY KEY (id);


--
-- Name: geolocation_devices geolocation_devices_device_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocation_devices
    ADD CONSTRAINT geolocation_devices_device_id_key UNIQUE (device_id);


--
-- Name: geolocation_devices geolocation_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocation_devices
    ADD CONSTRAINT geolocation_devices_pkey PRIMARY KEY (id);


--
-- Name: grade_review_history grade_review_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_review_history
    ADD CONSTRAINT grade_review_history_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: homework homework_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_pkey PRIMARY KEY (id);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);


--
-- Name: internships internships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);


--
-- Name: library_books library_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_books
    ADD CONSTRAINT library_books_pkey PRIMARY KEY (id);


--
-- Name: library_recommendation_audience library_recommendation_audience_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_audience
    ADD CONSTRAINT library_recommendation_audience_pkey PRIMARY KEY (id);


--
-- Name: library_recommendation_dispatch library_recommendation_dispatch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_dispatch
    ADD CONSTRAINT library_recommendation_dispatch_pkey PRIMARY KEY (id);


--
-- Name: library_recommendations library_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendations
    ADD CONSTRAINT library_recommendations_pkey PRIMARY KEY (id);


--
-- Name: login_activity login_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_activity
    ADD CONSTRAINT login_activity_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: monthly_absence_reports monthly_absence_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_absence_reports
    ADD CONSTRAINT monthly_absence_reports_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: online_class_activations online_class_activations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_activations
    ADD CONSTRAINT online_class_activations_pkey PRIMARY KEY (id);


--
-- Name: online_class_recurrences online_class_recurrences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_recurrences
    ADD CONSTRAINT online_class_recurrences_pkey PRIMARY KEY (id);


--
-- Name: online_class_usage_logs online_class_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: online_classes_subscriptions online_classes_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes_subscriptions
    ADD CONSTRAINT online_classes_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: online_courses online_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_courses
    ADD CONSTRAINT online_courses_pkey PRIMARY KEY (id);


--
-- Name: page_visits page_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_visits
    ADD CONSTRAINT page_visits_pkey PRIMARY KEY (id);


--
-- Name: parent_request_notifications parent_request_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_request_notifications
    ADD CONSTRAINT parent_request_notifications_pkey PRIMARY KEY (id);


--
-- Name: parent_request_responses parent_request_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_request_responses
    ADD CONSTRAINT parent_request_responses_pkey PRIMARY KEY (id);


--
-- Name: parent_requests parent_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_requests
    ADD CONSTRAINT parent_requests_pkey PRIMARY KEY (id);


--
-- Name: parent_student_relations parent_student_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_student_relations
    ADD CONSTRAINT parent_student_relations_pkey PRIMARY KEY (id);


--
-- Name: partnership_communications partnership_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_communications
    ADD CONSTRAINT partnership_communications_pkey PRIMARY KEY (id);


--
-- Name: payment_items payment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_items
    ADD CONSTRAINT payment_items_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: predefined_appreciations predefined_appreciations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.predefined_appreciations
    ADD CONSTRAINT predefined_appreciations_pkey PRIMARY KEY (id);


--
-- Name: pwa_analytics pwa_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pwa_analytics
    ADD CONSTRAINT pwa_analytics_pkey PRIMARY KEY (id);


--
-- Name: replacement_notifications replacement_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_notifications
    ADD CONSTRAINT replacement_notifications_pkey PRIMARY KEY (id);


--
-- Name: role_affiliations role_affiliations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_affiliations
    ADD CONSTRAINT role_affiliations_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: safe_zones safe_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safe_zones
    ADD CONSTRAINT safe_zones_pkey PRIMARY KEY (id);


--
-- Name: school_levels school_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_levels
    ADD CONSTRAINT school_levels_pkey PRIMARY KEY (id);


--
-- Name: school_parent_pricing school_parent_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_parent_pricing
    ADD CONSTRAINT school_parent_pricing_pkey PRIMARY KEY (id);


--
-- Name: school_parent_pricing school_parent_pricing_school_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_parent_pricing
    ADD CONSTRAINT school_parent_pricing_school_id_key UNIQUE (school_id);


--
-- Name: school_partnership_agreements school_partnership_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_partnership_agreements
    ADD CONSTRAINT school_partnership_agreements_pkey PRIMARY KEY (id);


--
-- Name: schools schools_educafric_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_educafric_number_key UNIQUE (educafric_number);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: subject_competency_assignments subject_competency_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject_competency_assignments
    ADD CONSTRAINT subject_competency_assignments_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_unique UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: teacher_absence_actions teacher_absence_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absence_actions
    ADD CONSTRAINT teacher_absence_actions_pkey PRIMARY KEY (id);


--
-- Name: teacher_absence_notifications teacher_absence_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absence_notifications
    ADD CONSTRAINT teacher_absence_notifications_pkey PRIMARY KEY (id);


--
-- Name: teacher_absences_enhanced teacher_absences_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absences_enhanced
    ADD CONSTRAINT teacher_absences_enhanced_pkey PRIMARY KEY (id);


--
-- Name: teacher_absences teacher_absences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_absences
    ADD CONSTRAINT teacher_absences_pkey PRIMARY KEY (id);


--
-- Name: teacher_bulletin_preferences teacher_bulletin_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_bulletin_preferences
    ADD CONSTRAINT teacher_bulletin_preferences_pkey PRIMARY KEY (id);


--
-- Name: teacher_bulletin_preferences teacher_bulletin_preferences_teacher_id_student_id_class_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_bulletin_preferences
    ADD CONSTRAINT teacher_bulletin_preferences_teacher_id_student_id_class_id_key UNIQUE (teacher_id, student_id, class_id, term, academic_year);


--
-- Name: teacher_bulletins teacher_bulletins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_bulletins
    ADD CONSTRAINT teacher_bulletins_pkey PRIMARY KEY (id);


--
-- Name: teacher_grade_submissions teacher_grade_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_grade_submissions
    ADD CONSTRAINT teacher_grade_submissions_pkey PRIMARY KEY (id);


--
-- Name: teacher_independent_activations teacher_independent_activations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_activations
    ADD CONSTRAINT teacher_independent_activations_pkey PRIMARY KEY (id);


--
-- Name: teacher_independent_payments teacher_independent_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_payments
    ADD CONSTRAINT teacher_independent_payments_pkey PRIMARY KEY (id);


--
-- Name: teacher_independent_sessions teacher_independent_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_sessions
    ADD CONSTRAINT teacher_independent_sessions_pkey PRIMARY KEY (id);


--
-- Name: teacher_independent_students teacher_independent_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_independent_students
    ADD CONSTRAINT teacher_independent_students_pkey PRIMARY KEY (id);


--
-- Name: teacher_notification_preferences teacher_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_notification_preferences
    ADD CONSTRAINT teacher_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: teacher_notification_preferences teacher_notification_preferences_teacher_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_notification_preferences
    ADD CONSTRAINT teacher_notification_preferences_teacher_id_key UNIQUE (teacher_id);


--
-- Name: teacher_replacements teacher_replacements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_replacements
    ADD CONSTRAINT teacher_replacements_pkey PRIMARY KEY (id);


--
-- Name: teacher_student_invitations teacher_student_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_student_invitations
    ADD CONSTRAINT teacher_student_invitations_pkey PRIMARY KEY (id);


--
-- Name: teacher_subject_assignments teacher_subject_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_subject_assignments
    ADD CONSTRAINT teacher_subject_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_subject_assignments teacher_subject_assignments_school_id_teacher_id_class_id_s_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_subject_assignments
    ADD CONSTRAINT teacher_subject_assignments_school_id_teacher_id_class_id_s_key UNIQUE (school_id, teacher_id, class_id, subject_id);


--
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (id);


--
-- Name: timetable_change_requests timetable_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_change_requests
    ADD CONSTRAINT timetable_change_requests_pkey PRIMARY KEY (id);


--
-- Name: timetable_notifications timetable_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_notifications
    ADD CONSTRAINT timetable_notifications_pkey PRIMARY KEY (id);


--
-- Name: timetable_slots timetable_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_school_id_teacher_id_day_of_week_start_time_end__key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_school_id_teacher_id_day_of_week_start_time_end__key UNIQUE (school_id, teacher_id, day_of_week, start_time, end_time, academic_year, term);


--
-- Name: tracking_devices tracking_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_devices
    ADD CONSTRAINT tracking_devices_pkey PRIMARY KEY (id);


--
-- Name: tutorial_progress tutorial_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_progress
    ADD CONSTRAINT tutorial_progress_pkey PRIMARY KEY (id);


--
-- Name: tutorial_steps tutorial_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_steps
    ADD CONSTRAINT tutorial_steps_pkey PRIMARY KEY (id);


--
-- Name: teacher_grade_submissions uq_grades_unique_per_year; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_grade_submissions
    ADD CONSTRAINT uq_grades_unique_per_year UNIQUE (student_id, subject_id, class_id, school_id, academic_year);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: users users_educafric_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_educafric_number_key UNIQUE (educafric_number);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_facebook_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_facebook_id_key UNIQUE (facebook_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wa_clicks wa_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wa_clicks
    ADD CONSTRAINT wa_clicks_pkey PRIMARY KEY (id);


--
-- Name: webpush_subscriptions webpush_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webpush_subscriptions
    ADD CONSTRAINT webpush_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_conversations whatsapp_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_faq_knowledge whatsapp_faq_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_faq_knowledge
    ADD CONSTRAINT whatsapp_faq_knowledge_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_quick_replies whatsapp_quick_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_quick_replies
    ADD CONSTRAINT whatsapp_quick_replies_pkey PRIMARY KEY (id);


--
-- Name: zone_status zone_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zone_status
    ADD CONSTRAINT zone_status_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_archive_access_logs_archive; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archive_access_logs_archive ON public.archive_access_logs USING btree (archive_id, school_id);


--
-- Name: idx_archived_documents_filters; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archived_documents_filters ON public.archived_documents USING btree (school_id, academic_year, class_id, term, student_id);


--
-- Name: idx_archived_documents_school_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archived_documents_school_sent_at ON public.archived_documents USING btree (school_id, sent_at DESC);


--
-- Name: idx_audit_logs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_category ON public.audit_logs USING btree (action_category);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_chat_conversations_participants; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_participants ON public.chat_conversations USING btree (participant_one_id, participant_two_id);


--
-- Name: idx_chat_conversations_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_school ON public.chat_conversations USING btree (school_id);


--
-- Name: idx_chat_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages USING btree (conversation_id);


--
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);


--
-- Name: idx_grades_class_school_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_class_school_year ON public.teacher_grade_submissions USING btree (class_id, school_id, academic_year);


--
-- Name: idx_grades_student_class_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_student_class_year ON public.teacher_grade_submissions USING btree (student_id, class_id, academic_year);


--
-- Name: idx_grades_teacher_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_teacher_subject ON public.teacher_grade_submissions USING btree (teacher_id, subject_id, academic_year);


--
-- Name: idx_login_activity_login_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_login_activity_login_time ON public.login_activity USING btree (login_time);


--
-- Name: idx_login_activity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_login_activity_user_id ON public.login_activity USING btree (user_id);


--
-- Name: idx_signatures_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_school_id ON public.signatures USING btree (school_id);


--
-- Name: idx_signatures_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_type ON public.signatures USING btree (signature_type);


--
-- Name: idx_signatures_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_user_id ON public.signatures USING btree (user_id);


--
-- Name: idx_teacher_absences_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_absences_school ON public.teacher_absences_enhanced USING btree (school_id);


--
-- Name: idx_teacher_absences_teacher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_absences_teacher ON public.teacher_absences_enhanced USING btree (teacher_id);


--
-- Name: idx_teacher_grade_submissions_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_grade_submissions_class_id ON public.teacher_grade_submissions USING btree (class_id);


--
-- Name: idx_teacher_grade_submissions_review_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_grade_submissions_review_status ON public.teacher_grade_submissions USING btree (review_status);


--
-- Name: idx_teacher_grade_submissions_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_grade_submissions_school_id ON public.teacher_grade_submissions USING btree (school_id);


--
-- Name: idx_teacher_grade_submissions_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_grade_submissions_subject_id ON public.teacher_grade_submissions USING btree (subject_id);


--
-- Name: idx_teacher_grade_submissions_teacher_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_grade_submissions_teacher_id ON public.teacher_grade_submissions USING btree (teacher_id);


--
-- Name: idx_teacher_replacements_school; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_replacements_school ON public.teacher_replacements USING btree (school_id);


--
-- Name: idx_teacher_replacements_teacher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teacher_replacements_teacher ON public.teacher_replacements USING btree (replacement_teacher_id);


--
-- Name: idx_whatsapp_conversations_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_conversations_phone ON public.whatsapp_conversations USING btree (phone_number);


--
-- Name: idx_whatsapp_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_messages_conversation ON public.whatsapp_messages USING btree (conversation_id);


--
-- Name: class_sessions class_sessions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: class_sessions class_sessions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.online_courses(id);


--
-- Name: class_sessions class_sessions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: class_sessions class_sessions_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.online_courses(id);


--
-- Name: internships internships_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.business_partners(id) ON DELETE CASCADE;


--
-- Name: library_recommendation_audience library_recommendation_audience_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_audience
    ADD CONSTRAINT library_recommendation_audience_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.library_recommendations(id) ON DELETE CASCADE;


--
-- Name: library_recommendation_dispatch library_recommendation_dispatch_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendation_dispatch
    ADD CONSTRAINT library_recommendation_dispatch_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.library_recommendations(id) ON DELETE CASCADE;


--
-- Name: library_recommendations library_recommendations_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_recommendations
    ADD CONSTRAINT library_recommendations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.library_books(id) ON DELETE CASCADE;


--
-- Name: online_class_usage_logs online_class_usage_logs_activation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_activation_id_fkey FOREIGN KEY (activation_id) REFERENCES public.online_class_activations(id);


--
-- Name: online_class_usage_logs online_class_usage_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id);


--
-- Name: online_class_usage_logs online_class_usage_logs_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_class_usage_logs
    ADD CONSTRAINT online_class_usage_logs_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: partnership_communications partnership_communications_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_communications
    ADD CONSTRAINT partnership_communications_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.school_partnership_agreements(id) ON DELETE CASCADE;


--
-- Name: school_partnership_agreements school_partnership_agreements_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_partnership_agreements
    ADD CONSTRAINT school_partnership_agreements_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.business_partners(id) ON DELETE CASCADE;


--
-- Name: signatures signatures_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: signatures signatures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: timetable_notifications timetable_notifications_timetable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable_notifications
    ADD CONSTRAINT timetable_notifications_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id);


--
-- PostgreSQL database dump complete
--

\unrestrict safhjfsCQ2gOEEpzL1LKqznE1fr4xABni2VKE25e6BUiXtgCD124obAHfgHc1Gb

