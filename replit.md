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

**NIVEAUX SCOLAIRES PERSONNALISABLES**:
- ✅ **Système flexible** : Écoles définissent leurs propres niveaux académiques (Form 1, 6ème, etc.) au lieu d'une liste fixe
- ✅ **Table `school_levels`** : Stocke les niveaux par école avec name, nameFr, nameEn, order, isActive
- ✅ **API CRUD complète** : Routes `/api/director/school-levels` pour GET, POST, PUT, DELETE avec isolation multi-tenant
- ✅ **Interface UI** : Composant SchoolLevelsManager intégré dans Paramètres > Académique pour gérer les niveaux
- ✅ **Validation Excel Import** : Import de classes valide les niveaux contre les niveaux définis par l'école
- ✅ **Normalisation robuste** : Gère strings, nombres, espaces blancs, casse mixte avant comparaison
- ✅ **Messages d'erreur clairs** : Guide l'utilisateur avec la liste des niveaux valides et instructions pour créer de nouveaux niveaux
- ⚠️ **RÈGLE CRITIQUE** : Écoles DOIVENT d'abord définir leurs niveaux dans Paramètres > Académique avant d'importer des classes

**AFFICHAGE IMMÉDIAT APRÈS IMPORT EXCEL**:
- ✅ **Problème résolu** : Les données importées apparaissent maintenant IMMÉDIATEMENT sans nécessiter de rafraîchissement manuel
- ✅ **Solution implémentée** : Double invalidation + refetch explicite dans ExcelImportButton
- ✅ **Mécanisme** : `invalidateQueries()` avec `refetchType: 'active'` suivi de `refetchQueries()` avec `type: 'active'`
- ✅ **Modules concernés** : Classes, Enseignants, Élèves, Emploi du temps, Salles - tous bénéficient du rafraîchissement automatique
- ✅ **Architecture** : Tous les modules utilisent ExcelImportButton avec prop `invalidateQueries` correctement configurée
- ⚠️ **RÈGLE CRITIQUE** : Tout nouveau module utilisant ExcelImportButton DOIT passer les queryKeys appropriées dans la prop `invalidateQueries`

**ISOLATION MULTI-TENANT STRICTE (SCHOOL_ID)**:
- ✅ **Bug critique résolu** : Toutes les APIs Director utilisaient `user.school_id` (toujours undefined) au lieu de `user.schoolId` (valeur correcte)
- ✅ **Pattern de correction systématique** : Remplacer `user.school_id || 1` par `user.schoolId || user.school_id || 1` dans TOUTES les APIs
- ✅ **8 APIs corrigées** : Classes (1), Subjects (2), Students (1), Teachers (2), Grades (2) - toutes filtraient sur school_id = 1 par défaut
- ✅ **Impact résolu** : Les écoles voient maintenant LEURS propres données au lieu des données de l'école 1
- ✅ **Routes d'import Excel** : `/api/bulk-import/` pour templates, validation et import de Classes, Teachers, Students, Timetables, Rooms
- ⚠️ **RÈGLE CRITIQUE** : TOUJOURS utiliser `user.schoolId` (avec majuscule I) pour isolation multi-tenant, JAMAIS `user.school_id`

**SÉPARATION DONNÉES SANDBOX/PRODUCTION**:
- ✅ **Problème résolu** : Données hardcodées (Marie Kouam, Jean Mbida) apparaissaient dans toutes les écoles y compris production
- ✅ **Solution implémentée** : Détection intelligente sandbox dans `server/storage/studentStorage.ts`
- ✅ **Écoles sandbox (IDs 1-6, 15)** : Gardent les données démo pour testing/onboarding
- ✅ **Écoles production (IDs 10+)** : Reçoivent tableau vide au lieu de données hardcodées
- ✅ **Logging amélioré** : `[STUDENT_STORAGE]` logs distinguent sandbox vs production, erreurs DB visibles
- ✅ **Identification** : Sandbox = school_id ≤ 6 ou school_id = 15, Production = school_id ≥ 10 avec numéro EDUCAFRIC
- ⚠️ **RÈGLE CRITIQUE** : Ne JAMAIS retourner de données hardcodées pour les écoles production - toujours vérifier school_id

**SYSTÈME MULTIROLE IMPLÉMENTÉ**:
- ✅ **Problème résolu** : Impossible d'ajouter un utilisateur existant (ex: Director) comme Teacher - violation contrainte unique email/phone
- ✅ **Solution implémentée** : Système multirole complet avec table `role_affiliations` et champs `secondaryRoles`, `activeRole`, `roleHistory`
- ✅ **Table role_affiliations** : Stocke les affiliations de rôles multiples (userId, role, schoolId, description, status, metadata)
- ✅ **Détection automatique** : APIs Teacher/Student détectent utilisateurs existants par email OU téléphone avant création
- ✅ **Ajout de rôle** : Si utilisateur existe, ajoute rôle secondaire + crée affiliation au lieu de créer doublon
- ✅ **Messages clairs** : "Le rôle d'enseignant a été ajouté au compte existant de [Nom]" au lieu d'erreur contrainte
- ✅ **Storage methods** : createRoleAffiliation, getUserRoleAffiliations, updateUserSecondaryRoles, updateUserActiveRole
- ✅ **Use cases supportés** : Director + Teacher, Parent + Teacher, Teacher multi-écoles, etc.
- ⚠️ **RÈGLE CRITIQUE** : Toujours vérifier utilisateurs existants par email/phone AVANT création dans ANY API de création utilisateur

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
- **Offline-First Architecture**: Comprehensive offline support including Service Worker for caching, IndexedDB for local storage, and Background Sync for data synchronization.
- **Authentication & Authorization**: Secure local and Firebase Google OAuth, comprehensive session management, granular permissions.
- **Educational Management**: Grade management (African-style report cards), real-time attendance, homework assignment, flexible timetable management.
- **Communication System**: Multi-channel notifications via WhatsApp Click-to-Chat and Hostinger SMTP Email, with bilingual, contextual templates and automatic parent notifications.
- **Payment & Subscription**: Stripe integration for international payments, local African payment methods.
- **Geolocation Services**: GPS tracking, geofencing, safe zone management, real-time monitoring, emergency alerts.
- **Document Management**: Centralized system for commercial, administrative, legal documents; digital signatures, PDF generation, controlled access.
- **Bidirectional Connection System**: Facilitates parent-child, student-parent, and freelancer-student connections with verification.
- **Bilingual Support**: Dynamic French/English language switching, full localization.
- **Sandbox Environment**: Dedicated, fully unlocked environment with realistic African demo data, including an **Offline Demo Mode**.
- **Academic Calendar**: iCal/ICS export for events with Jitsi links.
- **Bulk Excel Imports**: Comprehensive service for mass importing data with bilingual templates and validation.
- **Consolidated Bulletin Generation**: `ComprehensiveBulletinGenerator` for end-to-end report card workflow with advanced features, digital signatures, and PDF export.
- **CBA (Competency-Based Approach) Bulletins**: Full support for Cameroon Ministry of Secondary Education CBA format for technical schools, including Competency Library, Letter Grading System (A-F), Performance Bands, subject min-max ranges, teacher remarks, and enhanced discipline tracking.
- **5-Section Technical Bulletins**: Technical school bulletins support 5 distinct subject sections (General, Literary, Scientific, Technical, Other) that appear conditionally based on content, each with its own subtotal.
- **Online Classes with Jitsi Meet**: Paid module for schools and independent teachers, featuring time-window access, JWT-secured video conferencing, course creation, attendance tracking, and integrated payments.
- **Teacher Hybrid Work Mode**: Extends teacher roles to support `school`, `independent`, and `hybrid` modes, with a subscription model and integrated payment processing.

## External Dependencies

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