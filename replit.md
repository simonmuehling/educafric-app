# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive African educational technology platform providing a complete digital learning ecosystem for schools, teachers, parents, and students. It offers a robust, bilingual (French/English), mobile-first solution with integrated academic management, communication tools, and financial features tailored for the African market, such as SMS/WhatsApp communication and localized payment options. The project aims to offer significant cost savings for schools, high ROI for all stakeholders, and improved educational outcomes, aligning with UN Sustainable Development Goals for education. Educafric is preparing for a production deployment and 3500+ concurrent user rollout with a revolutionary payment model where Educafric pays schools.

## User Preferences
Preferred communication style: Simple, everyday language.

**EXEMPTION PREMIUM PERMANENTE** :
- ✅ Comptes sandbox et @test.educafric.com sont définitivement exemptés de TOUTES restrictions premium
- ✅ Patterns d'exemption : @test.educafric.com, sandbox@, demo@, test@, .sandbox@, .demo@, .test@
- ✅ Exemptions appliquées dans middleware subscriptionMiddleware.ts et service subscriptionService.ts
- ✅ Exemptions couvrent : restrictions de fonctionnalités, limites freemium, vérifications d'abonnement
- ✅ Logs automatiques : [PREMIUM_EXEMPT] et [LIMITS_EXEMPT] pour tracking

**PROTECTION ANTI-CONFLIT MODULES** :
- ✅ Système de mapping des modules réorganisé avec séparation stricte par dashboard
- ✅ Validation automatique des mappings pour détecter les conflits et doublons
- ✅ Protection spéciale pour le module 'students' : DOIT pointer vers FunctionalDirectorStudentManagement
- ✅ Structure organisée : Director → Commercial → Parent → Student → Teacher → Freelancer → Shared
- ✅ Commentaires de protection et alertes intégrés dans fastModuleLoader.ts
- ⚠️ RÈGLE CRITIQUE : NE JAMAIS mélanger les mappings de modules entre dashboards différents

**RESTAURATION ROUTES POST-REFACTOR** :
- ✅ **11 routes critiques restaurées** après problèmes causés par le refactor majeur
- ✅ Routes API manquantes : `/api/classes`, `/api/grades`, `/api/currency`, `/api/stripe`, `/api/uploads`, `/api/bulletins`, `/api/tracking`, `/api/tutorials`
- ✅ **Corrections schéma DB** : Mapping `trackedDevices` → `trackingDevices`, suppression colonnes inexistantes
- ✅ **Erreurs TypeScript résolues** : `notificationRoutes.ts` aligné avec schéma réel (suppression `readAt`, `recipientId`, `recipientRole`)
- ✅ **Imports manquants ajoutés** dans `server/routes.ts` avec 13 nouvelles importations
- ✅ **Interface Directeur fonctionnelle** : Création enseignants/élèves/classes maintenant opérationnelle
- ✅ **Services restaurés** : PWA, notifications, géolocalisation, paiements Stripe, upload fichiers
- ✅ Serveur stable avec logs: `[TRACKING] ✅`, `[NOTIFICATIONS] ✅`, `All routes configured ✅`

**RÉSOLUTION CONFLITS ROUTES PARAMÈTRES** :
- ✅ **Problème résolu** : Conflits entre routes settings définies dans routes.ts principal ET routers externes
- ✅ **Solution implémentée** : Réorganisation ordre d'enregistrement - routes settings définies AVANT routers externes
- ✅ **Routes Settings fonctionnelles** : `/api/director/settings`, `/api/teacher/settings`, `/api/student/settings`, `/api/parent/settings`, `/api/freelancer/settings`, `/api/school/settings`
- ✅ **Serveur stabilisé** : Plus d'erreurs de syntaxe, démarrage réussi avec "All routes configured ✅"
- ✅ **Modules Settings opérationnels** : teacher-settings, student-settings, parent-settings, freelancer-settings accessibles via FastModuleLoader
- ✅ **Architecture optimisée** : Ordre prioritaire - Settings → API Modules → System Routes → Services
- ⚠️ **RÈGLE CRITIQUE** : Toujours maintenir l'ordre d'enregistrement des routes pour éviter conflits futurs

**ROUTES API INTERFACES UTILISATEURS COMPLÈTES** :
- ✅ **Routes Teacher** : `/api/teacher/schools`, `/api/teacher/classes`, `/api/teacher/students`
- ✅ **Routes Student** : `/api/student/grades`, `/api/student/timetable`, `/api/student/request-account-deletion`
- ✅ **Routes Parent** : `/api/parent/children`, `/api/parent/safe-zones`, `/api/parent/children/:childId/location`, `/api/parent/children/:childId/alerts`, `/api/parent/approve-account-deletion`
- ✅ **Routes Freelancer** : `/api/freelancer/students`, `/api/freelancer/sessions`, `/api/freelancer/schedule`, `/api/freelancer/profile`, `/api/freelancer/payments`, `/api/freelancer/resources`
- ✅ **Routes Connexions Éducatives** : `/api/teacher-student/connections`, `/api/teacher-student/messages`, `/api/student-parent/connections`, `/api/student-parent/messages`
- ✅ **Routes École-Hiérarchie** : `/api/school/teachers`, `/api/school/students`, `/api/school/parent-child-connections`
- ✅ **Routes Générales** : `/api/students`, `/api/teachers`, `/api/parent-requests-test`
- ✅ **Toutes routes retournent JSON** au lieu d'erreurs HTML 404
- ✅ **Hiérarchie complète fonctionnelle** : École → Directeur → Enseignant → Élèves → Parents → Freelancers
- ⚠️ **CRITIQUE** : NE PAS supprimer ces routes lors de futurs refactors - elles sont essentielles pour tous les dashboards

Website URL Standard: All "Contacts Utiles" information must use https://www.educafric.com (not https://educafric.com) across all documents, guides, and system files.

Console Error Prevention: 
- ✅ RÉSOLU: Toutes erreurs PWA/MIME type JavaScript complètement éliminées
- Console filtering activé en production et développement pour éliminer spam
- Interception globale des erreurs MIME avec preventDefault() 
- Validation PWA automatique avec `./scripts/validate-pwa.sh`
- Fichier .htaccess créé pour production avec MIME types corrects

Fast Module Optimization System:
- ✅ FastModuleLoader: Système de préchargement instantané pour tous dashboards
- ✅ 14 modules critiques préchargés automatiquement au démarrage (Director, Parent, Commercial)
- ✅ Cache intelligent avec gestion mémoire optimisée
- ✅ Préchargement au survol des icônes pour UX instantanée
- ✅ OptimizedModuleWrapper pour éviter re-renders inutiles
- ✅ Performance monitoring intégré avec métriques temps réel
- ✅ Support complet modules existants réels (plus de modules inexistants)
- Backup complet: `BACKUP_FAST_MODULE_OPTIMIZATION_2025-08-18.md`

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
- **React** with TypeScript.
- **Tailwind CSS** for responsive, mobile-first styling with a custom African-themed color palette, emphasizing a modern, vibrant, and 3D-inspired visual redesign.
- **Wouter** for lightweight client-side routing.
- **TanStack Query** for server state management and caching.
- **Radix UI + Shadcn/UI** for accessible, production-ready component primitives.
- **Progressive Web App (PWA)** capabilities.
- **Unified UI/UX**: All dashboards utilize a consistent modern design system with colorful gradients, rounded cards, animated interactions, and the Nunito font.
- **Component Standardization**: Standardized reusable components like `ModuleContainer`, `StatCard`, `ModernCard`, `ModernDashboardLayout`, and `ModernTabNavigation`.
- **Mobile Optimization**: Features like `MobileActionsOverlay`, compact mobile navigation, and intelligent superposition elements are designed for an optimal smartphone experience.
- **React Native**: Separate mobile application (`educafric-mobile/`) for Android with shared backend infrastructure.

### Backend Architecture
- **Express.js** server with RESTful API design.
- **Drizzle ORM** with PostgreSQL for type-safe database operations.
- **Session-based authentication** using `express-session` and `Passport.js`.
- **Role-based access control** supporting 8 distinct user roles.
- **BCrypt** for secure password hashing.
- **Consolidated Error Handling**: Unified error recognition and automated repair system.
- **Security Hardening**: Includes `helmet`, `cors`, `express-rate-limit`, `Two-Factor Authentication (2FA)`, and an `Intrusion Detection System (IDS)`.

### Database Design
- **PostgreSQL** as the primary database, hosted on **Neon Serverless**.
- **Multi-tenant architecture** supporting multiple schools.
- **Comprehensive schema** covering users, schools, classes, grades, attendance, homework, payments, communication logs, and geolocation data.
- **Academic year/term structure** for proper educational data organization.

### Key Features and System Design Choices
- **Authentication & Authorization**: Secure local and Firebase Google OAuth authentication with comprehensive session management and granular permissions for 8 user roles, including intelligent multi-role detection.
- **Educational Management System**: Robust grade management with African-style report cards, real-time attendance tracking, homework assignment and submission, and flexible timetable management with African cultural adaptations.
- **Communication System**: Integrated multi-channel notification system (SMS via Vonage, WhatsApp Business API, Email via Hostinger SMTP, and PWA push notifications) with bilingual, contextual templates.
- **Payment & Subscription Management**: Stripe integration for international payments, alongside local African payment methods (Orange Money, Express Union, Afriland First Bank). Supports multiple subscription tiers and role-based access to premium modules.
- **Geolocation Services**: Comprehensive GPS tracking for tablets, smartwatches, and phones, featuring geofencing, safe zone management, real-time device monitoring, and emergency alerts with route optimization and attendance automation.
- **Document Management System**: Centralized system for managing commercial, administrative, and legal documents with digital signatures, PDF generation, controlled access, and permission management.
- **Bidirectional Connection System**: Allows parents to connect with children, students with parents, and freelancers with students, with smart duplicate detection and school verification for activation.
- **Phone Number Validation**: Comprehensive phone number uniqueness validation system with owner exception handling, format validation for Cameroon numbers, and WhatsApp number support.
- **Bilingual Support**: Dynamic French/English language switching with complete localization of UI, educational content, and documentation, including context-aware translations specific to African educational terminology.
- **Sandbox Environment**: A dedicated, fully unlocked sandbox environment with realistic African demo data and comprehensive developer tools.
- **Tutorial System**: Backend-driven tutorial system with progress tracking and analytics.
- **Mobile School Configuration Guide**: Optimized for smartphone with responsive interface and integration into the unified dashboard system.

### Pricing Structure
- **Schools**: Annual plans only, no student limitations.
- **Freelancers**: Professional plan.
- **Parent Quarterly Subscriptions**.

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