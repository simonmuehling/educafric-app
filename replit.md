# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first educational technology platform designed for the African market. It integrates academic management, communication, and financial features to create a digital learning ecosystem. The platform aims to reduce costs for schools, improve educational outcomes, and support high concurrent user loads, ultimately revolutionizing education in Africa and aligning with UN Sustainable Development Goals. The project has ambitions for significant market penetration and becoming a complete educational solution.

## User Preferences
Preferred communication style: Simple, everyday language.

**EXEMPTION PREMIUM PERMANENTE**:
- ✅ Comptes sandbox et @test.educafric.com sont définitivement exemptés de TOUTES restrictions premium
- ✅ Patterns d'exemption : @test.educafric.com, sandbox@, demo@, test@, .sandbox@, .demo@, .test@
- ✅ Exemptions appliquées dans middleware subscriptionMiddleware.ts et service subscriptionService.ts
- ✅ Exemptions couvrent : restrictions de fonctionnalités, limites freemium, vérifications d'abonnement
- ✅ Logs automatiques : [PREMIUM_EXEMPT] et [LIMITS_EXEMPT] pour tracking

**PROTECTION ANTI-CONFLIT MODULES**:
- ✅ Système de mapping des modules réorganisé avec séparation stricte par dashboard
- ✅ Validation automatique des mappings pour détecter les conflits et doublons
- ✅ Protection spéciale pour le module 'students' : DOIT pointer vers FunctionalDirectorStudentManagement
- ✅ Structure organisée : Director → Commercial → Parent → Student → Teacher → Freelancer → Shared
- ✅ Commentaires de protection et alertes intégrés dans fastModuleLoader.ts
- ⚠️ RÈGLE CRITIQUE : NE JAMAIS mélanger les mappings de modules entre dashboards différents

**RÉSOLUTION CONFLITS ROUTES PARAMÈTRES**:
- ✅ **Problème résolu** : Conflits entre routes settings définies dans routes.ts principal ET routers externes
- ✅ **Solution implémentée** : Réorganisation ordre d'enregistrement - routes settings définies AVANT routers externes
- ✅ **Routes Settings fonctionnelles** : `/api/director/settings`, `/api/teacher/settings`, `/api/student/settings`, `/api/parent/settings`, `/api/freelancer/settings`, `/api/school/settings`
- ✅ **Architecture optimisée** : Ordre prioritaire - Settings → API Modules → System Routes → Services
- ⚠️ **RÈGLE CRITIQUE** : Toujours maintenir l'ordre d'enregistrement des routes pour éviter conflits futurs

- ALWAYS consolidate ALL dashboards (Teacher, Student, Parent, Freelancer, Commercial, SiteAdmin) when making changes
- NEVER make partial updates to only some dashboards
- ALWAYS preserve button functionality when making changes - buttons must remain functional
- User does not want to repeat instructions about button functionality preservation
- **DOCUMENTS MUST APPEAR INSTANTLY:** User is frustrated that document creation takes hours - streamline to work immediately
- **DOCUMENT DIRECTORY STANDARD:** ALL documents MUST be placed in `/public/documents/` directory with lowercase kebab-case naming (never create documents in other locations)
- **DOCUMENT CREATION METHOD:** Use consolidated EDUCAFRIC system:
  1. Create specialized PDF generator method in `server/services/pdfGenerator.ts`
  2. Add document to commercial docs list in `server/routes.ts` (both view and download routes)
  3. Create HTML version in `/public/documents/` for web viewing
  4. Update alphabetical index in `00-index-documents-alphabetique.html`
  5. Test via API routes `/api/commercial/documents/{id}/download` and direct HTML access

## System Architecture

### Frontend Architecture
- **Frameworks**: React with TypeScript, Wouter for routing, TanStack Query for state management.
- **UI Components**: Radix UI + Shadcn/UI, styled with Tailwind CSS.
- **Design**: Custom African-themed color palette, modern gradients, rounded cards, animated interactions using Nunito font. Unified UI/UX across all dashboards.
- **Accessibility**: Progressive Web App (PWA) with strong mobile optimization.
- **Mobile**: Separate React Native application (`educafric-mobile/`) for Android, sharing the backend.

### Backend Architecture
- **Framework**: Express.js for RESTful APIs.
- **ORM**: Drizzle ORM with PostgreSQL.
- **Authentication**: Session-based authentication using `express-session` and `Passport.js`.
- **Security**: Robust role-based access control (8 user roles), BCrypt for password hashing, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).

### Database Design
- **Type**: PostgreSQL, hosted on Neon Serverless, with multi-tenant support.
- **Schema**: Comprehensive, covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation, structured by academic year/term.

### Key Features and System Design Choices
- **Authentication & Authorization**: Secure local and Firebase Google OAuth, comprehensive session management, granular permissions.
- **Educational Management System**: Grade management (African-style report cards), real-time attendance, homework assignment, flexible timetable management.
- **Communication System**: Multi-channel notifications (WhatsApp Click-to-Chat via wa.me links, Hostinger SMTP Email, PWA push), bilingual, contextual templates. SMS service removed - WhatsApp is the primary mobile notification method.
  - **Attendance/Absence Notifications (Oct 2025)**: Automatic notifications for student absences. When teachers/directors mark students as absent/late/excused:
    - **Primary**: Email notification with detailed absence information
    - **WhatsApp Button**: Embedded green WhatsApp button in email with wa.me link (instant, free, no API configuration needed)
    - **Click-to-Chat**: Parent clicks button → WhatsApp opens → Pre-filled message ready to send to school
    - **Template**: Uses `absence_alert` template with student name, date, reason
    - **No Configuration**: Works immediately without Meta API setup (can upgrade to API later)
    - **Opt-in**: Parents must enable WhatsApp (waOptIn) and provide E.164 phone number for button to appear
    - **Bilingual**: Supports FR/EN automatic language detection
- **Payment & Subscription Management**: Stripe integration for international payments, local African payment methods.
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management System**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with duplicate detection and school verification.
- **Bilingual Support**: Dynamic French/English language switching, complete localization of UI, content, documentation.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data.
- **Academic Calendar Integration**: Export events (timetables, online classes) via iCal/ICS with Jitsi links, restricted access for Directors and Teachers.
- **Bulk Excel Imports**: Comprehensive service for mass importing classes, timetables, teachers, students, rooms, and school settings with bilingual templates and robust validation.
- **Consolidated Bulletin Generation**: `ComprehensiveBulletinGenerator` replaces the original module, providing an end-to-end workflow (draft to sent), 8 functional system tabs, and extensive integrations including secure API routes, notifications, bilingual templates, digital signatures, and PDF export with QR codes. It supports advanced features like absences, disciplinary sanctions, and multi-level signatures, tailored for African educational needs.
- **Online Classes with Jitsi Meet**: Paid module with manual admin activation for schools (yearly/semester/trimester/monthly) and direct purchase option for independent teachers (150,000 CFA/year). Features time-window access control based on school timetables (free usage 2h before/after school hours), JWT-secured video conferencing at meet.educafric.com, course creation and session management, attendance tracking, and integration with Stripe + MTN Mobile Money for teacher payments.
  - **Payment Security (Oct 2025)**: Production-ready payment integration with critical security hardening:
    - Stripe: XAF zero-decimal currency handling (no multiplication), mandatory webhook signature verification with STRIPE_WEBHOOK_SECRET (no insecure fallbacks), server-side amount reconciliation
    - MTN Mobile Money: Y-Note integration with webhook amount verification, order ID validation, server-side price calculation enforcement
    - Frontend: Real-time polling system for payment confirmation (replaces fake success timers), 2-minute timeout with graceful failure messaging
    - Protection: All webhooks validate received amounts against server-calculated prices before activation, preventing under/overpayment exploits

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth).
- **WhatsApp**: Click-to-Chat integration via wa.me links (direct links, no API dependency).
- **Hostinger**: SMTP services for email communication.

### Development Tools
- **Vite**: Fast development server and build tool.
- **Drizzle Kit**: Database migrations and schema management.
- **ESBuild**: Server-side TypeScript compilation.

### UI/UX Libraries
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **React Hook Form + Zod**: Form validation and management.
- **Lucide Icons**: Icon library.
- **jsPDF**: Client-side PDF generation.