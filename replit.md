## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first educational technology platform designed for the African market. It aims to revolutionize education by integrating academic management, communication, and financial features into a digital learning ecosystem. The platform seeks to reduce costs for schools, improve educational outcomes, and support high concurrent user loads, aligning with UN Sustainable Development Goals and aspiring to achieve significant market penetration as a complete educational solution.

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

**NUMÉROS EDUCAFRIC AVEC AUTO-GÉNÉRATION**:
- ✅ **Système simplifié pour Site Admins** : Site Admins peuvent créer écoles SANS pré-créer numéros EDUCAFRIC
- ✅ **Auto- génération intelligente** : Si aucun numéro fourni, le système génère automatiquement un numéro EDU-CM-SC-###
- ✅ **Format standardisé** : EDU-CM-SC-### (SC = School, séquence incrémentielle)
- ✅ **Trois workflows d'inscription disponibles** :
  1. **Site Admin Direct (SIMPLIFIÉ)** : Site Admin crée école directement, numéro auto-généré
  2. **Site Admin avec Numéro** : Site Admin crée école avec numéro pré-créé (optionnel)
  3. **Director Self-Registration** : Director s'inscrit avec numéro EDUCAFRIC pré-assigné (obligatoire)
- ⚠️ **RÈGLE CRITIQUE** : Directors DOIVENT utiliser numéro pré-assigné, Site Admins peuvent auto-générer

**EMAIL OPTIONNEL - TÉLÉPHONE PRIORITAIRE**:
- ✅ **Email est maintenant OPTIONNEL** : Le numéro de téléphone est devenu l'identifiant principal unique
- ✅ **Schéma database modifié** : Colonne `email` dans table `users` est maintenant nullable
- ✅ **Validation Zod mise à jour** : `createUserSchema` accepte email optionnel, phone requis (min 10 caractères)
- ✅ **Authentification hybride** : Login accepte SOIT email SOIT téléphone + mot de passe
- ✅ **Passport strategy adaptée** : `LocalStrategy` modifiée pour vérifier phone OU email
- ⚠️ **RÈGLE CRITIQUE** : Numéro de téléphone DOIT être unique et valide (min 10 caractères)

- ALWAYS consolidate ALL dashboards (Teacher, Student, Parent, Freelancer, Commercial, SiteAdmin) when making changes
- NEVER make partial updates to only some dashboards
- ALWAYS preserve button functionality when making changes - buttons must remain functional
- **DOCUMENTS MUST APPEAR INSTANTLY:** User is frustrated that document creation takes hours - streamline to work immediately
- **DOCUMENT DIRECTORY STANDARD:** ALL documents MUST be placed in `/public/documents/` directory with lowercase kebab-case naming (never create documents in other locations)
- **DOCUMENT CREATION METHOD:** Use consolidated EDUCAFRIC system:
  1. Create specialized PDF generator method in `server/services/pdfGenerator.ts`
  2. Add document to commercial docs list in `server/routes.ts` (both view and download routes)
  3. Create HTML version in `/public/documents/` for web viewing
  4. Update alphabetical index in `00-index-documents-alphabetique.html`
  5. Test via API routes `/api/commercial/documents/{id}/download` and direct HTML access

## System Architecture

### Frontend
- **Web**: React with TypeScript, Wouter for routing, TanStack Query for state management. Radix UI + Shadcn/UI for components, styled with Tailwind CSS. Custom African-themed design, PWA, and mobile optimized.
- **Mobile**: Separate React Native application (`educafric-mobile/`) for Android, sharing the backend, with production-ready configurations.

### Backend
- **API**: Express.js for RESTful APIs.
- **ORM**: Drizzle ORM with PostgreSQL.
- **Authentication**: Session-based with `express-session` and `Passport.js`.
- **Security**: Robust role-based access control (8 roles), BCrypt for passwords, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).
- **CBA Support**: Competency-Based Approach bulletin generation with letter grading, performance bands, and competency tracking for technical schools.

### Database
- **Type**: PostgreSQL, hosted on Neon Serverless, with multi-tenant support.
- **Schema**: Comprehensive, covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation, structured by academic year/term.

### Key Features and Design Choices
- **Offline-First Architecture**: Comprehensive offline support including Service Worker for caching, IndexedDB for local storage, and Background Sync for data synchronization. Includes smart 2G/3G detection and an offline banner.
- **Authentication & Authorization**: Secure local and Firebase Google OAuth, comprehensive session management, granular permissions.
- **Educational Management**: Grade management (African-style report cards), real-time attendance, homework assignment, flexible timetable management.
- **Communication System**: Multi-channel notifications via WhatsApp Click-to-Chat (wa.me links) and Hostinger SMTP Email, with bilingual, contextual templates and automatic parent notifications.
- **Payment & Subscription**: Stripe integration for international payments, local African payment methods (e.g., MTN Mobile Money).
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with verification.
- **Bilingual Support**: Dynamic French/English language switching, full localization.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data, including an **Offline Demo Mode** with pre-bundled data and offline authentication.
- **Academic Calendar**: iCal/ICS export for events with Jitsi links.
- **Bulk Excel Imports**: Comprehensive service for mass importing data with bilingual templates and validation.
- **Consolidated Bulletin Generation**: `ComprehensiveBulletinGenerator` for end-to-end report card workflow with advanced features, digital signatures, and PDF export.
- **CBA (Competency-Based Approach) Bulletins**: Full support for Cameroon Ministry of Secondary Education CBA format for technical schools, including Competency Library, Letter Grading System (A-F), Performance Bands (CVWA, CWA, CA, CAA, CNA), subject min-max ranges, teacher remarks, and enhanced discipline tracking. Enabled via `useCBAFormat` flag per school.
- **Online Classes with Jitsi Meet**: Paid module for schools and independent teachers, featuring time-window access, JWT-secured video conferencing, course creation, attendance tracking, and integrated payments.
- **Teacher Hybrid Work Mode**: Extends teacher roles to support `school`, `independent` (private tutor), and `hybrid` modes, with a subscription model and integrated payment processing.

### CBA Implementation Details
- **Database Schema**: `competencies` table stores reusable bilingual competency descriptions linked to subjects and form levels. `schools.useCBAFormat` flag enables CBA per school.
- **Backend Services**: `CompetencyService` (CRUD for competencies with multi-tenant isolation), `CBAGradingService` (letter grade calculations, performance bands), `CBBulletinExtensionService` (integrates CBA into bulletin generation).
- **API Endpoints**: CRUD operations for competencies under `/api/director/competencies`.
- **Security Features**: IDOR prevention, input validation (Zod), multi-tenant isolation, soft delete for competencies.
- **CBA Bulletin Workflow**: Director enables CBA, manages competencies, teachers enter grades, and the system automatically includes CBA elements (competencies, letter grades, performance bands) in generated bulletins and PDF exports.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth).
- **WhatsApp**: Click-to-Chat integration via wa.me links.
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