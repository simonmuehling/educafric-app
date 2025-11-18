## Overview
Educafric is a comprehensive, bilingual (French/English), mobile-first educational technology platform for the African market. It aims to digitalize education by integrating academic management, communication, and financial features, reducing costs for schools, improving educational outcomes, and supporting high concurrent user loads. The platform aligns with UN Sustainable Development Goals and seeks to achieve significant market penetration as a complete educational solution.

## User Preferences
- **EXEMPTION PREMIUM PERMANENTE**: Comptes sandbox et @test.educafric.com sont définitivement exemptés de TOUTES restrictions premium. Patterns d'exemption incluent @test.educafric.com, sandbox@, demo@, test@, .sandbox@, .demo@, .test@. Exemptions couvrent : restrictions de fonctionnalités, limites freemium, vérifications d'abonnement. Logs automatiques : [PREMIUM_EXEMPT] et [LIMITS_EXEMPT] pour tracking.
- **PROTECTION ANTI-CONFLIT MODULES**: Système de mapping des modules réorganisé avec séparation stricte par dashboard. Validation automatique des mappings pour détecter les conflits et doublons. Le module 'students' DOIT pointer vers FunctionalDirectorStudentManagement. Structure organisée : Director → Commercial → Parent → Student → Teacher → Freelancer → Shared. NE JAMAIS mélanger les mappings de modules entre dashboards différents.
- **RÉSOLUTION CONFLITS ROUTES PARAMÈTRES**: Problème de conflits entre routes settings résolu par réorganisation de l'ordre d'enregistrement. Routes settings définies AVANT routers externes. Ordre prioritaire : Settings → API Modules → System Routes → Services. Toujours maintenir l'ordre d'enregistrement des routes.
- **NUMÉROS EDUCAFRIC AVEC AUTO-GÉNÉRATION**: Site Admins peuvent créer écoles SANS pré-créer numéros EDUCAFRIC, le système génère automatiquement un numéro EDU-CM-SC-### si non fourni. Format standardisé : EDU-CM-SC-### (SC = School, séquence incrémentielle). Directors DOIVENT utiliser numéro pré-assigné, Site Admins peuvent auto-générer.
- **EMAIL OPTIONNEL - TÉLÉPHONE PRIORITAIRE**: Email est maintenant OPTIONNEL, le numéro de téléphone est l'identifiant principal unique. La colonne `email` dans `users` est nullable. Validation Zod et Passport strategy adaptées pour accepter email optionnel et téléphone requis (min 10 caractères). Le numéro de téléphone DOIT être unique et valide (min 10 caractères).
- **NIVEAUX SCOLAIRES PERSONNALISABLES**: Écoles définissent leurs propres niveaux académiques via la table `school_levels` et l'API CRUD dédiée `/api/director/school-levels`. Une interface UI est disponible. L'import de classes valide les niveaux contre les niveaux définis par l'école avec normalisation robuste et messages d'erreur clairs. Écoles DOIVENT d'abord définir leurs niveaux dans Paramètres > Académique avant d'importer des classes.
- **AFFICHAGE IMMÉDIAT APRÈS IMPORT EXCEL**: Données importées apparaissent IMMÉDIATEMENT sans rafraîchissement manuel grâce à double invalidation + refetch explicite dans ExcelImportButton. Tous les modules concernés (Classes, Enseignants, Élèves, Emploi du temps, Salles) bénéficient du rafraîchissement automatique. Tout nouveau module utilisant ExcelImportButton DOIT passer les queryKeys appropriées dans la prop `invalidateQueries`.
- **ISOLATION MULTI-TENANT STRICTE (SCHOOL_ID)**: Correction systématique de l'utilisation de `user.schoolId` (valeur correcte) au lieu de `user.school_id` (toujours undefined) dans TOUTES les APIs Director. Les écoles voient maintenant LEURS propres données. TOUJOURS utiliser `user.schoolId` (avec majuscule I) pour isolation multi-tenant, JAMAIS `user.school_id`.
- **ARCHITECTURE DATABASE-ONLY**: TOUS les modules storage (StudentStorage, TimetableStorage, BulletinStorage, ClassStorage, etc.) utilisent UNIQUEMENT des requêtes database via Drizzle ORM. ZÉRO donnée hardcodée/mock dans le code storage. Les écoles sandbox (IDs 1-6, 15) reçoivent leurs données démo via pre-seeding dans la database réelle avec le script `server/scripts/seedSandboxData.ts` (idempotent, peut être réexécuté). Cette architecture garantit: code maintenable, comportement identique pour tous, et données démo persistantes dans la DB. NE JAMAIS ajouter de mock data arrays dans les storage modules - toujours utiliser database queries.
- **SYSTÈME MULTIROLE IMPLÉMENTÉ**: Impossible d'ajouter un utilisateur existant comme Teacher est résolu. Système multirole complet avec table `role_affiliations` et champs `secondaryRoles`, `activeRole`, `roleHistory`. Détection automatique des utilisateurs existants par email OU téléphone avant création. Ajout de rôle secondaire et affiliation si utilisateur existe. Toujours vérifier utilisateurs existants par email/phone AVANT création dans ANY API de création utilisateur.
- **SAUVEGARDE NOM D'ÉCOLE - PROFIL DIRECTOR**: Le nom d'école édité dans le profil Director se sauvegarde maintenant correctement. L'endpoint PUT `/api/director/settings` met à jour le champ `name` dans la table `schools` quand `schoolName` est modifié. Toute modification de données école (nom, adresse, etc.) dans le profil Director DOIT mettre à jour la table `schools`, pas seulement la table `users`.
- **FOND BLANC POUR TOUS LES DIALOGS D'ALERTE**: TOUS les dialogs d'alerte/confirmation (DeleteConfirmationDialog et autres AlertDialogContent) DOIVENT avoir un fond blanc permanent avec la classe `bg-white`. Ceci garantit une lisibilité optimale peu importe le thème actif. Le composant `DeleteConfirmationDialog` a été mis à jour avec `<AlertDialogContent className="bg-white">`. Tout nouveau dialog d'alerte DOIT suivre ce standard.
- **MOCK STUDENTS ONLY FOR SANDBOX**: L'endpoint `/api/director/students` a été corrigé pour retourner UNIQUEMENT les mock students pour les utilisateurs sandbox (email contenant @test.educafric.com, @educafric.demo, sandbox@, demo@, .sandbox@, .demo@, .test@). Les écoles réelles reçoivent UNIQUEMENT les étudiants de la base de données via une requête Drizzle. JAMAIS de mock data pour les écoles réelles.
- **EMPLOIS DU TEMPS DATABASE-ONLY**: L'endpoint `/api/student/timetable` a été converti de mock data vers architecture database-only. Il récupère maintenant la classe de l'étudiant depuis la table `students`, puis filtre les emplois du temps depuis la table `timetables` par `classId`, `schoolId`, et `isActive=true`. L'endpoint `/api/teacher/timetable` filtre correctement par `teacherId`. Tous les endpoints d'emplois du temps utilisent UNIQUEMENT des requêtes database, conformément au principe ARCHITECTURE DATABASE-ONLY.
- **SÉLECTION ET SUPPRESSION EN MASSE**: Fonctionnalité de sélection groupée et suppression en masse ajoutée pour les étudiants, enseignants ET PARENTS. Inclut : checkboxes individuelles avec état Set, checkbox "Tout sélectionner", bouton de suppression groupée conditionnel, et dialogs de confirmation bilingues (français/anglais). Tous les dialogs d'alerte suivent le standard fond blanc pour lisibilité optimale.
- **GESTION PARENTS DANS "DEMANDES PARENTS"**: Le module "Demandes Parents" utilise maintenant un système d'onglets avec 2 sections : 1) "Demandes" pour les requêtes des parents, 2) "Liste des Parents" pour la gestion des comptes parents. La liste des parents permet la sélection en masse et la suppression groupée via l'endpoint `/api/director/parents/bulk-delete`. Quand un parent est supprimé, il perd tous ses droits d'information et de communication avec l'école. L'endpoint `/api/director/parents` récupère la liste des parents avec isolation multi-tenant stricte (dual-filter par schoolId ET sandbox status).
- **MASTERSHEET DATABASE-ONLY**: Le module Fiche Scolaire (Mastersheet) dans Gestion Académique utilise maintenant UNIQUEMENT des données database via l'endpoint `/api/director/bulletins/list`. Cet endpoint interroge la table `bulletinComprehensive` avec isolation multi-tenant stricte (filtre par `schoolId`, `classId`, et `term`). L'affichage inclut : informations réelles de l'école depuis `/api/director/settings`, liste des bulletins créés avec noms d'élèves/moyennes/rangs/codes de vérification, et entête d'impression bilingue format ministère (RÉPUBLIQUE DU CAMEROUN / REPUBLIC OF CAMEROON) avec logo de l'école et délégations officielles. ZÉRO mock data, tout vient de la database.
- **OFFLINE PREMIUM SITE ADMIN TOGGLE**: Site Admin peut activer/désactiver Offline Premium pour chaque école individuellement via "Gestion des Écoles" → bouton CreditCard → modal "Offline Premium". Champ database: `schools.offline_premium_enabled` (boolean, default false). Endpoint API: PATCH `/api/siteadmin/schools/:id/offline-premium` avec body `{ enabled: boolean }`. Modal simplifié avec Switch toggle shadcn au lieu de plans payants complexes. Badge coloré dans la liste des écoles (purple=enabled, gray=disabled). Écoles ne paient PAS pour abonnements Educafric - Offline Premium est une option gratuite toggleable.
- ALWAYS consolidate ALL dashboards (Teacher, Student, Parent, Freelancer, Commercial, SiteAdmin) when making changes.
- NEVER make partial updates to only some dashboards.
- ALWAYS preserve button functionality when making changes - buttons must remain functional.
- **DOCUMENTS MUST APPEAR INSTANTLY:** User is frustrated that document creation takes hours - streamline to work immediately.
- **DOCUMENT DIRECTORY STANDARD:** ALL documents MUST be placed in `/public/documents/` directory with lowercase kebab-case naming.
- **DOCUMENT CREATION METHOD:** Use consolidated EDUCAFRIC system:
  1. Create specialized PDF generator method in `server/services/pdfGenerator.ts`.
  2. Add document to commercial docs list in `server/routes.ts` (both view and download routes).
  3. Create HTML version in `/public/documents/` for web viewing.
  4. Update alphabetical index in `00-index-documents-alphabetique.html`.
  5. Test via API routes `/api/commercial/documents/{id}/download` and direct HTML access.

## System Architecture

### Frontend
- **Web**: React (TypeScript), Wouter, TanStack Query, Radix UI + Shadcn/UI (Tailwind CSS). Custom African-themed, PWA, mobile-optimized.
- **Mobile**: React Native application (`educafric-mobile/`) for Android.

### Backend
- **API**: Express.js (RESTful).
- **ORM**: Drizzle ORM with PostgreSQL.
- **Authentication**: Session-based with `express-session` and `Passport.js`.
- **Security**: Role-based access control (8 roles), BCrypt, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).
- **CBA Support**: Competency-Based Approach bulletin generation.

### Database
- **Type**: PostgreSQL on Neon Serverless, multi-tenant.
- **Schema**: Comprehensive for users, schools, classes, grades, attendance, homework, payments, communication logs, geolocation, structured by academic year/term.

### Key Features and Design Choices
- **Offline-First**: Service Worker, IndexedDB, Background Sync.
  - **Offline Premium**: 14-day offline limit for Directors/Parents, unlimited for Teachers/Students. Progressive 3-tier warning system. CRUD for 5 modules, read-only for 7. Includes temp→real ID reconciliation and conflict-free sync.
- **Authentication & Authorization**: Local and Firebase Google OAuth, session management, granular permissions.
- **Educational Management**: Grade management (African-style), real-time attendance, homework, flexible timetables.
- **Communication**: Multi-channel notifications (WhatsApp, Hostinger SMTP Email), bilingual templates, automatic parent notifications.
- **Payment & Subscription**: Stripe, local African payment methods.
- **Geolocation**: GPS tracking, geofencing, safe zones, real-time monitoring, emergency alerts.
- **Document Management**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation.
- **Bidirectional Connection System**: Parent-child, student-parent, freelancer-student connections.
- **Bilingual Support**: Dynamic French/English localization.
- **Sandbox Environment**: Dedicated, fully unlocked with realistic African demo data, including an Offline Demo Mode.
- **Academic Calendar**: iCal/ICS export with Jitsi links.
- **Bulk Excel Imports**: Comprehensive service with bilingual templates and validation.
- **Consolidated Bulletin Generation**: `ComprehensiveBulletinGenerator` for report cards with advanced features, digital signatures, and PDF export. Supports Cameroon Ministry of Secondary Education CBA format with Competency Library, Letter Grading, Performance Bands, and 5-Section Technical Bulletins.
- **Online Classes with Jitsi Meet**: Paid module with time-window access, JWT-secured video conferencing, course creation, attendance tracking.
- **Teacher Hybrid Work Mode**: Supports `school`, `independent`, and `hybrid` teacher roles with subscription model.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth).
- **WhatsApp**: Click-to-Chat integration.
- **Hostinger**: SMTP services.
- **Jitsi Meet**: Video conferencing.

### Development Tools
- **Vite**: Development server and build tool.
- **Drizzle Kit**: Database migrations.
- **ESBuild**: Server-side TypeScript compilation.
- **Dexie.js**: IndexedDB wrapper for offline data storage.

### UI/UX Libraries
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Styling framework.
- **React Hook Form + Zod**: Form validation.
- **Lucide Icons**: Icon library.
- **jsPDF**: Client-side PDF generation.