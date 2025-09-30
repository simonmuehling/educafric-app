# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first African educational technology platform. It provides a complete digital learning ecosystem by integrating academic management, communication tools, and financial features tailored for the African market. The platform aims to offer significant cost savings for schools, improve educational outcomes, and supports 3500+ concurrent users. Unique features include a payment model where Educafric pays schools and a smart data separation system for sandbox and real user data. Its ambition is to revolutionize education in Africa, aligning with UN Sustainable Development Goals.

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
- ✅ Performance monitoring intégré avec métriques temps réels.
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

**SUPPRESSION MODULE ABONNEMENT ÉCOLES + IMPORTS EXCEL MASSE - SEPTEMBER 30, 2025**:
- ✅ **Abonnement Écoles supprimé** : Champs subscription_status, subscription_plan, max_students, max_teachers retirés de la table schools
- ✅ **Type éducatif ajouté** : Nouveau champ educational_type (general/technical) avec default 'general' dans table schools
- ✅ **Classification écoles** : Support type école (public/private) ET type éducatif (general/technical) dans signup
- ✅ **Service Import Excel** : Extension de excelImportService.ts avec support bilingue (FR/EN)
  - importClasses() : Import masse classes avec validation nom/niveau/section/maxStudents/teacherEmail/academicYear
  - importTimetables() : Import masse emplois du temps avec validation classe/teacher/subject/jour/horaires
  - generateTemplate() : Génération templates Excel pour classes, timetables, teachers, students, parents
- ✅ **Routes API Import** : Nouveaux endpoints dans /api/bulk-import/
  - GET /template/classes : Télécharger template Excel classes
  - GET /template/timetables : Télécharger template Excel emplois du temps
  - POST /import/classes : Import Excel classes (multer, validation, création masse)
  - POST /import/timetables : Import Excel emplois du temps (multer, validation, création masse)
- ✅ **Sécurité imports** : Authentification Director/Admin requise, validation données, gestion erreurs détaillée
- ✅ **Templates bilingues** : Headers FR/EN, exemples réalistes africains, instructions intégrées
- ✅ **Gestion erreurs** : Rapport détaillé ligne par ligne avec errors[], warnings[], created count
- ⚠️ **À implémenter** : UI upload Excel dans modules Director (Class Management, Timetable Management)

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
- Designed as a Progressive Web App (PWA) with strong mobile optimization.
- Ensures unified UI/UX across all dashboards through standardized, reusable components.
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
- **Payment & Subscription Management**: Stripe integration for international payments, complemented by local African payment methods.
- **Geolocation Services**: GPS tracking for devices, geofencing, safe zone management, real-time monitoring, and emergency alerts.
- **Document Management System**: Centralized system for commercial, administrative, and legal documents, with digital signatures, PDF generation, and controlled access.
- **Bidirectional Connection System**: Facilitates connections between parents-children, students-parents, and freelancers-students, with duplicate detection and school verification.
- **Bilingual Support**: Dynamic French/English language switching with complete localization of UI, content, and documentation.
- **Sandbox Environment**: A dedicated, fully unlocked environment with realistic African demo data.

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