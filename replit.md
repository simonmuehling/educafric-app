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

### Frontend
- **Web**: React with TypeScript, Wouter for routing, TanStack Query for state management. Radix UI + Shadcn/UI for components, styled with Tailwind CSS. Custom African-themed design, PWA, and mobile optimized.
- **Mobile**: Separate React Native application (`educafric-mobile/`) for Android, sharing the backend, with production-ready configurations and deployment guide.

### Backend
- **API**: Express.js for RESTful APIs.
- **ORM**: Drizzle ORM with PostgreSQL.
- **Authentication**: Session-based with `express-session` and `Passport.js`.
- **Security**: Robust role-based access control (8 roles), BCrypt for passwords, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).

### Database
- **Type**: PostgreSQL, hosted on Neon Serverless, with multi-tenant support.
- **Schema**: Comprehensive, covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation, structured by academic year/term.

### Key Features and Design Choices
- **Offline-First Architecture**: Comprehensive offline support for low connectivity. This includes an enhanced Service Worker for caching (profiles, API data, images, static assets), IndexedDB for local data storage (with specific TTLs for various data types), and Background Sync for automatic and periodic synchronization of offline actions. Offline queue for educational actions, smart 2G/3G detection, and a user-facing offline banner are also implemented.
- **Authentication & Authorization**: Secure local and Firebase Google OAuth, comprehensive session management, granular permissions.
- **Educational Management**: Grade management (African-style report cards), real-time attendance, homework assignment, flexible timetable management.
- **Communication System**: Multi-channel notifications via WhatsApp Click-to-Chat (wa.me links) and Hostinger SMTP Email, with bilingual, contextual templates. Automatic absence/lateness notifications to parents via email with an embedded WhatsApp button.
- **Payment & Subscription**: Stripe integration for international payments, local African payment methods, with production-ready security hardening for Stripe and MTN Mobile Money.
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with verification.
- **Bilingual Support**: Dynamic French/English language switching, full localization.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data. **Offline Demo Mode** allows the sandbox to work completely offline for demos, exhibitions, and low-connectivity areas with pre-bundled data, offline authentication, Service Worker caching, and IndexedDB storage. Sandbox mode is explicitly activated (not triggered by connectivity loss) to prevent data contamination of regular user accounts.
- **Academic Calendar**: iCal/ICS export for events with Jitsi links.
- **Bulk Excel Imports**: Comprehensive service for mass importing data with bilingual templates and validation.
- **Consolidated Bulletin Generation**: `ComprehensiveBulletinGenerator` for end-to-end report card workflow with advanced features, digital signatures, and PDF export.
- **Online Classes with Jitsi Meet**: Paid module for schools and independent teachers, featuring time-window access, JWT-secured video conferencing, course creation, attendance tracking, and integrated payments.
- **Teacher Hybrid Work Mode**: Extends teacher roles to support `school`, `independent` (private tutor), and `hybrid` modes, with a subscription model for independent tutoring features and integrated payment processing.

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