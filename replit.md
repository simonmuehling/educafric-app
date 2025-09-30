# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first African educational technology platform. It provides a complete digital learning ecosystem with integrated academic management, communication tools, and financial features tailored for the African market (e.g., SMS/WhatsApp communication, localized payments). The platform aims to offer significant cost savings for schools, high ROI for stakeholders, and improved educational outcomes, aligning with UN Sustainable Development Goals. It is designed for production deployment, supporting 3500+ concurrent users, and features a unique payment model where Educafric pays schools. It includes a smart data separation system to distinguish between sandbox and real user data based on email patterns, ensuring strict data integrity.

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

**RESTAURATION ROUTES POST-REFACTOR**:
- ✅ **11 routes critiques restaurées** après problèmes causés par le refactor majeur
- ✅ Corrections schéma DB et erreurs TypeScript résolues.
- ✅ Imports manquants ajoutés dans `server/routes.ts`.
- ✅ Interface Directeur fonctionnelle, services restaurés (PWA, notifications, géolocalisation, paiements Stripe, upload fichiers).
- ✅ Serveur stable avec logs: `[TRACKING] ✅`, `[NOTIFICATIONS] ✅`, `All routes configured ✅`

**RÉSOLUTION CONFLITS ROUTES PARAMÈTRES**:
- ✅ **Problème résolu** : Conflits entre routes settings définies dans routes.ts principal ET routers externes
- ✅ **Solution implémentée** : Réorganisation ordre d'enregistrement - routes settings définies AVANT routers externes
- ✅ **Routes Settings fonctionnelles** : `/api/director/settings`, `/api/teacher/settings`, `/api/student/settings`, `/api/parent/settings`, `/api/freelancer/settings`, `/api/school/settings`
- ✅ **Serveur stabilisé** : Plus d'erreurs de syntaxe, démarrage réussi avec "All routes configured ✅"
- ✅ **Modules Settings opérationnels** : teacher-settings, student-settings, parent-settings, freelancer-settings accessibles via FastModuleLoader
- ✅ **Architecture optimisée** : Ordre prioritaire - Settings → API Modules → System Routes → Services
- ⚠️ **RÈGLE CRITIQUE** : Toujours maintenir l'ordre d'enregistrement des routes pour éviter conflits futurs

**ROUTES API INTERFACES UTILISATEURS COMPLÈTES**:
- ✅ **Routes Teacher** : `/api/teacher/schools`, `/api/teacher/classes`, `/api/teacher/students`
- ✅ **Routes Student** : `/api/student/grades`, `/api/student/timetable`, `/api/student/request-account-deletion`
- ✅ **Routes Parent** : `/api/parent/children`, `/api/parent/safe-zones`, `/api/parent/children/:childId/location`, `/api/parent/children/:childId/alerts`, `/api/parent/approve-account-deletion`
- ✅ **Routes Freelancer** : `/api/freelancer/students`, `/api/freelancer/sessions`, `/api/freelancer/schedule`, `/api/freelancer/profile`, `/api/freelancer/payments`, `/api/freelancer/resources`

**REMPLACEMENT COMPLET MODULE BULLETINS - SEPTEMBER 2025**:
- ✅ **ComprehensiveBulletinGenerator REMPLACE module Bulletins original**
- ✅ **Workflow End-to-End validé** : draft → submitted → approved → signed → sent avec timestamps
- ✅ **8 Onglets système fonctionnels** : class-selection, student-management, manual-data-entry, generation-options, bulk-operations, pending-bulletins, approved-bulletins, reports
- ✅ **Intégrations complètes** : API routes sécurisées (auth + schoolId), notifications Vonage/Hostinger, templates bilingues FR/EN, tracking destinataires, signatures numériques, export PDF avec QR codes
- ✅ **Performance et robustesse** : 23+ bulletins testés, gestion d'erreurs avancée, responsive design PWA, cache React Query
- ✅ **Schema avancé** : bulletinComprehensive + bulletinSubjectCodes avec tracking notifications détaillé par canal (Email/SMS/WhatsApp)
- ✅ **Fonctionnalités étendues** : Absences/retards, sanctions disciplinaires, coefficients matières (CTBA/CBA/CA/CMA/COTE), appréciations, signatures multi-niveaux
- ✅ **Système prêt pour production** : Remplace complètement l'ancien module avec fonctionnalités africaines avancées
- ✅ **Routes Connexions Éducatives** : `/api/teacher-student/connections`, `/api/teacher-student/messages`, `/api/student-parent/connections`, `/api/student-parent/messages`
- ✅ **Routes École-Hiérarchie** : `/api/school/teachers`, `/api/school/students`, `/api/school/parent-child-connections`
- ✅ **Routes Générales** : `/api/students`, `/api/teachers`, `/api/parent-requests-test`
- ✅ **Toutes routes retournent JSON** au lieu d'erreurs HTML 404
- ✅ **Hiérarchie complète fonctionnelle** : École → Directeur → Enseignant → Élèves → Parents → Freelancers
- ⚠️ **CRITIQUE** : NE PAS supprimer ces routes lors de futurs refactors - elles sont essentielles pour tous les dashboards

Website URL Standard: All "Contacts Utiles" information must use https://www.educafric.com (not https://educafric.com) across all documents, guides, and system files.

Console Error Prevention: 
- ✅ Toutes erreurs PWA/MIME type JavaScript complètement éliminées.
- Console filtering activé en production et développement.
- Interception globale des erreurs MIME avec preventDefault().
- Validation PWA automatique avec `./scripts/validate-pwa.sh`.
- Fichier .htaccess créé pour production avec MIME types corrects.

Fast Module Optimization System:
- ✅ FastModuleLoader: Système de préchargement instantané pour tous dashboards.
- ✅ 14 modules critiques préchargés automatiquement au démarrage (Director, Parent, Commercial).
- ✅ Cache intelligent avec gestion mémoire optimisée.
- ✅ Préchargement au survol des icônes pour UX instantanée.
- ✅ OptimizedModuleWrapper pour éviter re-renders inutiles.
- ✅ Performance monitoring intégré avec métriques temps réel.
- ✅ Support complet modules existants réels (plus de modules inexistants).

**INTÉGRATION CALENDRIER ACADÉMIQUE - SEPTEMBER 2025**:
- ✅ **Export calendrier iCal/ICS** pour événements académiques (emploi du temps + classes en ligne)
- ✅ **CalendarService** génère fichiers .ics compatibles Google Calendar, Outlook, Apple Calendar
- ✅ **Événements inclus** : Cours réguliers (timetables) + Sessions Jitsi en ligne (classSessions)
- ✅ **Accès restreint** : Directeurs (école complète) et Enseignants (emploi du temps personnel) uniquement
- ✅ **Routes API** : `/api/calendar/export/{school|teacher}/{id}` et `/api/calendar/subscription-url/{school|teacher}`
- ✅ **Sécurité renforcée** : Mots de passe Jitsi jamais exposés dans ICS (note générique uniquement)
- ✅ **Performance optimisée** : Requêtes avec joins pour éliminer N+1, filtrage actif (isActive + status scheduled/live)
- ✅ **UI intégrée** : Module CalendarExport ajouté aux dashboards Directeur et Enseignant
- ✅ **Fenêtre temporelle** : Prochains 3 mois d'événements, filtrage par année académique/trimestre
- ✅ **Liens Jitsi** : URLs complètes meet.educafric.com incluses dans LOCATION et DESCRIPTION

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
- Built with React and TypeScript, using Wouter for routing, TanStack Query for state management, and Radix UI + Shadcn/UI for components.
- Styled with Tailwind CSS, featuring a custom African-themed color palette, modern gradients, rounded cards, and animated interactions using the Nunito font.
- Designed as a Progressive Web App (PWA) with strong mobile optimization, including `MobileActionsOverlay` and compact navigation.
- Ensures unified UI/UX across all dashboards through standardized, reusable components like `ModuleContainer` and `ModernDashboardLayout`.
- A separate React Native application (`educafric-mobile/`) exists for Android, sharing the backend.

### Backend Architecture
- Uses Express.js for RESTful APIs.
- Drizzle ORM with PostgreSQL for type-safe database operations.
- Implements session-based authentication with `express-session` and `Passport.js`.
- Features robust role-based access control for 8 distinct user roles.
- Employs BCrypt for secure password hashing.
- Includes consolidated error handling and security hardening measures (helmet, cors, rate-limiting, 2FA, IDS).

### Database Design
- PostgreSQL is the primary database, hosted on Neon Serverless.
- Supports a multi-tenant architecture to accommodate multiple schools.
- Features a comprehensive schema covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation data.
- Structured to organize educational data by academic year/term.

### Key Features and System Design Choices
- **Authentication & Authorization**: Secure local and Firebase Google OAuth with comprehensive session management and granular permissions.
- **Educational Management System**: Grade management with African-style report cards, real-time attendance, homework assignment, and flexible timetable management.
- **Communication System**: Multi-channel notifications via Vonage (SMS/WhatsApp), Hostinger SMTP (Email), and PWA push notifications, with bilingual, contextual templates.
- **Payment & Subscription Management**: Stripe integration for international payments, complemented by local African payment methods (Orange Money, Express Union, Afriland First Bank). Supports multiple subscription tiers.
- **Geolocation Services**: GPS tracking for devices, geofencing, safe zone management, real-time monitoring, and emergency alerts.
- **Document Management System**: Centralized system for commercial, administrative, and legal documents, with digital signatures, PDF generation, and controlled access.
- **Bidirectional Connection System**: Facilitates connections between parents-children, students-parents, and freelancers-students, with duplicate detection and school verification.
- **Phone Number Validation**: Comprehensive uniqueness and format validation, especially for Cameroon numbers, with WhatsApp support.
- **Bilingual Support**: Dynamic French/English language switching with complete localization of UI, content, and documentation, including African educational terminology.
- **Sandbox Environment**: A dedicated, fully unlocked environment with realistic African demo data.
- **Tutorial System**: Backend-driven with progress tracking and analytics.
- **Mobile School Configuration Guide**: Optimized for smartphones and integrated into the unified dashboard system.

### Pricing Structure
- Schools: Annual plans only, no student limitations.
- Freelancers: Professional plan.
- Parents: Quarterly subscriptions.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth) and real-time features.
- **Vonage**: SMS and WhatsApp messaging APIs.
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