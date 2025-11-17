# Overview
Educafric is a bilingual (French/English), mobile-first educational technology platform for the African market. It aims to digitalize education by integrating academic management, communication, and financial features, focusing on reducing costs, improving educational outcomes, and supporting high concurrent user loads. A key feature is the Offline Premium Mode, a two-tier PWA-based offline system ensuring functionality in areas with unreliable internet access. The platform aligns with UN Sustainable Development Goals.

# User Preferences
- **EXEMPTION PREMIUM PERMANENTE**: Comptes sandbox et @test.educafric.com sont définitivement exemptés de TOUTES restrictions premium. Patterns d'exemption incluent @test.educafric.com, sandbox@, demo@, test@, .sandbox@, .demo@, .test@. Exemptions couvrent : restrictions de fonctionnalités, limites freemium, vérifications d'abonnement. Logs automatiques : [PREMIUM_EXEMPT] et [LIMITS_EXEMPT] pour tracking.
- **PROTECTION ANTI-CONFLIT MODULES**: Système de mapping des modules réorganisé avec séparation stricte par dashboard. Validation automatique des mappings pour détecter les conflits et doublons. Le module 'students' DOIT pointer vers FunctionalDirectorStudentManagement. Structure organisée : Director → Commercial → Parent → Student → Teacher → Freelancer → Shared. NE JAMAIS mélanger les mappings de modules entre dashboards différents.
- **RÉSOLUTION CONFLITS ROUTES PARAMÈTRES**: Problème de conflits entre routes settings résolu par réorganisation de l'ordre d'enregistrement. Routes settings définies AVANT routers externes. Ordre prioritaire : Settings → API Modules → System Routes → Services. Toujours maintenir l'ordre d'enregistrement des routes.
- **NUMÉROS EDUCAFRIC AVEC AUTO-GÉNÉRATION**: Site Admins peuvent créer écoles SANS pré-créer numéros EDUCAFRIC, le système génère automatiquement un numéro EDU-CM-SC-### si non fourni. Format standardisé : EDU-CM-SC-### (SC = School, séquence incrémentielle). Directors DOIVENT utiliser numéro pré-assigné, Site Admins peuvent auto-générer.
- **EMAIL OPTIONNEL - TÉLÉPHONE PRIORITAIRE**: Email est maintenant OPTIONNEL, le numéro de téléphone est l'identifiant principal unique. La colonne `email` dans `users` est nullable. Validation Zod et Passport strategy adaptées pour accepter email optionnel et téléphone requis (min 10 caractères). Le numéro de téléphone DOIT être unique et valide (min 10 caractères).
- **NIVEAUX SCOLAIRES PERSONNALISABLES**: Écoles définissent leurs propres niveaux académiques via la table `school_levels` et l'API CRUD dédiée `/api/director/school-levels`. Une interface UI est disponible. L'import de classes valide les niveaux contre les niveaux définis par l'école avec normalisation robuste et messages d'erreur clairs. Écoles DOIVENT d'abord définir leurs niveaux dans Paramètres > Académique avant d'importer des classes.
- **AFFICHAGE IMMÉDIAT APRÈS IMPORT EXCEL**: Données importées apparaissent IMMÉDIATEMENT sans rafraîchissement manuel grâce à double invalidation + refetch explicite dans ExcelImportButton. Tous les modules concernés (Classes, Enseignants, Élèves, Emploi de temps, Salles) bénéficient du rafraîchissement automatique. Tout nouveau module utilisant ExcelImportButton DOIT passer les queryKeys appropriées dans la prop `invalidateQueries`.
- **ISOLATION MULTI-TENANT STRICTE (SCHOOL_ID)**: Correction systématique de l'utilisation de `user.schoolId` (valeur correcte) au lieu de `user.school_id` (toujours undefined) dans TOUTES les APIs Director. Les écoles voient maintenant LEURS propres données. TOUJOURS utiliser `user.schoolId` (avec majuscule I) pour isolation multi-tenant, JAMAIS `user.school_id`.
- **ARCHITECTURE DATABASE-ONLY**: TOUS les modules storage (StudentStorage, TimetableStorage, BulletinStorage, ClassStorage, etc.) utilisent UNIQUEMENT des requêtes database via Drizzle ORM. ZÉRO donnée hardcodée/mock dans le code storage. Les écoles sandbox (IDs 1-6, 15) reçoivent leurs données démo via pre-seeding dans la database réelle avec le script `server/scripts/seedSandboxData.ts` (idempotent, peut être réexécuté). Cette architecture garantit: code maintenable, comportement identique pour tous, et données démo persistantes dans la DB. NE JAMAIS ajouter de mock data arrays dans les storage modules - toujours utiliser database queries.
- **SYSTÈME MULTIROLE IMPLÉMENTÉ**: Impossible d'ajouter un utilisateur existant comme Teacher est résolu. Système multirole complet avec table `role_affiliations` et champs `secondaryRoles`, `activeRole`, `roleHistory`. Détection automatique des utilisateurs existants par email OU téléphone avant création. Ajout de rôle secondaire et affiliation si utilisateur existe. Toujours vérifier utilisateurs existants par email/phone AVANT création dans ANY API de création utilisateur.
- **SAUVEGARDE NOM D'ÉCOLE - PROFIL DIRECTOR**: Le nom d'école édité dans le profil Director se sauvegarde maintenant correctement. L'endpoint PUT `/api/director/settings` met à jour le champ `name` dans la table `schools` quand `schoolName` est modifié. Toute modification de données école (nom, adresse, etc.) dans le profil Director DOIT mettre à jour la table `schools`, pas seulement la table `users`.
- **FOND BLANC POUR TOUS LES DIALOGS D'ALERTE**: TOUS les dialogs d'alerte/confirmation (DeleteConfirmationDialog et autres AlertDialogContent) DOIVENT avoir un fond blanc permanent avec la classe `bg-white`. Ceci garantit une lisibilité optimale peu importe le thème actif. Le composant `DeleteConfirmationDialog` a été mis à jour avec `<AlertDialogContent className="bg-white">`. Tout nouveau dialog d'alerte DOIT suivre ce standard.
- **MOCK STUDENTS ONLY FOR SANDBOX**: L'endpoint `/api/director/students` a été corrigé pour retourner UNIQUEMENT les mock students pour les utilisateurs sandbox (email contenant @test.educafric.com, @educafric.demo, sandbox@, demo@, .sandbox@, .demo@, .test@). Les écoles réelles reçoivent UNIQUEMENT les étudiants de la base de données via une requête Drizzle. JAMAIS de mock data pour les écoles réelles.
- **EMPLOIS DU TEMPS DATABASE-ONLY**: L'endpoint `/api/student/timetable` a été converti de mock data vers architecture database-only. Il récupère maintenant la classe de l'étudiant depuis la table `students`, puis filtre les emplois du temps depuis la table `timetables` par `classId`, `schoolId`, et `isActive=true`. L'endpoint `/api/teacher/timetable` filtre correctement par `teacherId`. Tous les endpoints d'emplois du temps utilisent UNIQUEMENT des requêtes database, conformément au principe ARCHITECTURE DATABASE-ONLY.
- **SÉLECTION ET SUPPRESSION EN MASSE**: Fonctionnalité de sélection groupée et suppression en masse ajoutée pour les étudiants et enseignants. Inclut : checkboxes individuelles avec état Set, checkbox "Tout sélectionner", bouton de suppression groupée conditionnel, et dialogs de confirmation bilingues (français/anglais). Tous les dialogs d'alerte suivent le standard fond blanc pour lisibilité optimale.
- **MASTERSHEET DATABASE-ONLY**: Le module Fiche Scolaire (Mastersheet) dans Gestion Académique utilise maintenant UNIQUEMENT des données database via l'endpoint `/api/director/bulletins/list`. Cet endpoint interroge la table `bulletinComprehensive` avec isolation multi-tenant stricte (filtre par `schoolId`, `classId`, et `term`). L'affichage inclut : informations réelles de l'école depuis `/api/director/settings`, liste des bulletins créés avec noms d'élèves/moyennes/rangs/codes de vérification, et entête d'impression bilingue format ministère (RÉPUBLIQUE DU CAMEROUN / REPUBLIC OF CAMEROON) avec logo de l'école et délégations officielles. ZÉRO mock data, tout vient de la database.
- **OFFLINE PREMIUM BRANDING**: "Offline Premium" est le nom officiel pour le système hors ligne à deux niveaux (remplace "Mode Hors Ligne"). Modal "Gestion des abonnements" dans Site Admin simplifié pour afficher UNIQUEMENT le toggle Offline Premium - ZÉRO plans payants car écoles ne paient rien. FunctionalSiteAdminSchools et SchoolManagement utilisent "Offline Premium" dans tous les labels. Toggle accessible via cards écoles ET modal abonnements. Mutation `toggleOfflineModeMutation` gère activation/désactivation avec invalidation automatique du cache.
- **OFFLINE PREMIUM DOCUMENTATION**: Guide commercial complet bilingue (FR/EN) créé pour Site Admins, Commerciaux et Écoles : `/public/documents/guide-offline-premium-fr-en.html` (ID 40). Explique système à 3 niveaux (0-3j: vert, 3-7j: jaune, 7-14j: rouge, 14+j: bloqué), accès gratuit (enseignants/élèves/sandbox), tarifs (Parent Bronze 5000 XAF, Parent GPS 3000 XAF), processus d'achat en 5 étapes, activation par Site Admin, détails techniques PWA, FAQ complète. Contact: info@educafric.com, +237 656 200 472. Document indexé dans `/public/documents/00-index-documents-alphabetique.html` et routes commerciales.
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

# System Architecture

### Frontend
- **Web**: React with TypeScript, Wouter for routing, TanStack Query for state management, Radix UI + Shadcn/UI for components, Tailwind CSS for styling. Custom African-themed design, PWA, mobile optimized.
- **Mobile**: Separate React Native application (`educafric-mobile/`) for Android.

### Backend
- **API**: Express.js for RESTful APIs.
- **ORM**: Drizzle ORM with PostgreSQL.
- **Authentication**: Session-based with `express-session` and `Passport.js`.
- **Security**: Role-based access control, BCrypt for passwords, consolidated error handling, security hardening (helmet, cors, rate-limiting, 2FA, IDS).
- **CBA Support**: Competency-Based Approach bulletin generation with letter grading, performance bands, and competency tracking.

### Database
- **Type**: PostgreSQL, hosted on Neon Serverless, with multi-tenant support.
- **Schema**: Comprehensive, covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation, structured by academic year/term.

### Key Features and Design Choices
- **Offline-First Architecture**: Service Worker for caching, IndexedDB for local storage, Background Sync for data synchronization. Two-tier PWA Offline Premium Mode with configurable cache durations.
- **Authentication & Authorization**: Local and Firebase Google OAuth, session management, granular permissions.
- **Educational Management**: Grade management (African-style report cards, CBA bulletins), real-time attendance, homework, flexible timetable management.
- **Communication System**: Multi-channel notifications via WhatsApp Click-to-Chat and Hostinger SMTP Email, with bilingual templates.
- **Payment & Subscription**: Stripe integration for international and local African payment methods.
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access, standardized `/public/documents/` directory.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with verification.
- **Bilingual Support**: Dynamic French/English language switching, full localization.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data.
- **Academic Calendar**: iCal/ICS export for events with Jitsi links.
- **Bulk Excel Imports**: Comprehensive service for mass importing data with bilingual templates and validation.
- **Online Classes with Jitsi Meet**: Paid module with time-window access, JWT-secured video conferencing, course creation, attendance tracking, and integrated payments.
- **Teacher Hybrid Work Mode**: Supports `school`, `independent`, and `hybrid` teacher roles with a subscription model and integrated payment processing.

# External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Stripe**: Payment processing.
- **Firebase**: Authentication (Google OAuth).
- **WhatsApp**: Click-to-Chat integration via wa.me links.
- **Hostinger**: SMTP services for email communication.
- **Jitsi Meet**: Video conferencing for online classes.

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