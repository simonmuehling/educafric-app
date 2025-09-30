# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first educational technology platform for the African market. It integrates academic management, communication, and financial features to create a digital learning ecosystem. The platform aims to reduce costs for schools, improve educational outcomes, support high concurrent user loads, and includes unique features like a payment model where Educafric pays schools, and intelligent data separation for sandbox and real user data. Its primary goal is to revolutionize education in Africa, aligning with UN Sustainable Development Goals, with ambitions for significant market penetration and market potential by offering a complete educational solution.

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
- **Frameworks**: React with TypeScript, Wouter for routing, TanStack Query for state management.
- **UI Components**: Radix UI + Shadcn/UI, styled with Tailwind CSS.
- **Design**: Custom African-themed color palette, modern gradients, rounded cards, animated interactions using Nunito font.
- **Accessibility**: Progressive Web App (PWA) with strong mobile optimization.
- **Consistency**: Unified UI/UX across all dashboards via reusable components.
- **Mobile**: Separate React Native application (`educafric-mobile/`) for Android, sharing the backend.

### Backend Architecture
- **Framework**: Express.js for RESTful APIs.
- **ORM**: Drizzle ORM with PostgreSQL for type-safe database operations.
- **Authentication**: Session-based authentication using `express-session` and `Passport.js`.
- **Security**: Robust role-based access control (8 user roles), BCrypt for password hashing, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).

### Database Design
- **Type**: PostgreSQL, hosted on Neon Serverless.
- **Architecture**: Multi-tenant support for multiple schools.
- **Schema**: Comprehensive, covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation.
- **Organization**: Data structured by academic year/term.

### Key Features and System Design Choices
- **Authentication & Authorization**: Secure local and Firebase Google OAuth, comprehensive session management, granular permissions.
- **Educational Management System**: Grade management (African-style report cards), real-time attendance, homework assignment, flexible timetable management.
- **Communication System**: Multi-channel notifications (Vonage SMS/WhatsApp, Hostinger SMTP Email, PWA push), bilingual, contextual templates.
- **Payment & Subscription Management**: Stripe integration for international payments, local African payment methods.
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management System**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with duplicate detection and school verification.
- **Bilingual Support**: Dynamic French/English language switching, complete localization of UI, content, documentation.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth).
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