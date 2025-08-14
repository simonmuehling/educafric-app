# Educafric - African Educational Technology Platform

## Overview
Educafric is a comprehensive African educational technology platform providing a complete digital learning ecosystem for schools, teachers, parents, and students. It offers a robust, bilingual (French/English), mobile-first solution with integrated academic management, communication tools, and financial features tailored for the African market, such as SMS/WhatsApp communication and localized payment options. The project aims to offer significant cost savings for schools, high ROI for all stakeholders, and improved educational outcomes, aligning with UN Sustainable Development Goals for education.

## User Preferences
Preferred communication style: Simple, everyday language.

**Enterprise Scale Optimization (August 14, 2025):** Preparing for 3500 concurrent users next month:
- ✓ Fixed React lazy loading crash that was blocking app startup
- ✓ Reduced performance monitoring to enterprise silent mode (only log >10s requests)
- ✓ Disabled session debugging and minimized auth logging
- ✓ Extended cache times to 15min (stale) and 30min (garbage collection)
- ✓ Optimized memory cleanup for enterprise scale
- ✓ Simplified loading components for faster rendering
- ✓ Reduced TypeScript diagnostics from 355 to 285 in server/routes.ts
- ✓ Created database optimization guide for 3500+ users
- ✓ Implemented systematic alphabetical sorting across all user lists and documents
- ✓ Transformed all 19 markdown documents to professional HTML with PDF conversion
- ✓ Created CSV template system for bulk data import (students, teachers, parents, grades, attendance)
- ✓ Removed enterprise modules from school dashboard (saved for v2.0 in future-modules/enterprise/)
- → Next: Load testing and infrastructure scaling for 3500 users

**CRITICAL USER PREFERENCES:**
- ALWAYS consolidate ALL dashboards (Teacher, Student, Parent, Freelancer, Commercial, SiteAdmin) when making changes
- NEVER make partial updates to only some dashboards
- ALWAYS preserve button functionality when making changes - buttons must remain functional
- User does not want to repeat instructions about button functionality preservation
- **DOCUMENT DIRECTORY STANDARD:** ALL documents MUST be placed in `/public/documents/` directory with lowercase kebab-case naming (never create documents in other locations)
- **PRICING STRUCTURE CLARIFIED (August 2025)**:
  - Schools: Annual plans only, no student limitations
  - École Publique: 250,000 CFA/year
  - École Privée: 750,000 CFA/year  
  - École Entreprise: 150,000 CFA/year (training centers with bilingual dashboard)
  - Freelancers: Only Professional plan (12,000 CFA/month or 120,000 CFA/year)
  - Contact: Always use +237 657 004 011 / admin@educafric.com

## System Architecture

### Frontend Architecture
- **React** with TypeScript for type-safe component development.
- **Tailwind CSS** for responsive, mobile-first styling with a custom African-themed color palette, emphasizing a modern, vibrant, and 3D-inspired visual redesign.
- **Wouter** for lightweight client-side routing.
- **TanStack Query** for server state management and caching.
- **Radix UI + Shadcn/UI** for accessible, production-ready component primitives.
- **Progressive Web App (PWA)** capabilities for mobile optimization.
- **Unified UI/UX**: All dashboards utilize a consistent modern design system with colorful gradients, rounded cards, animated interactions, and the Nunito font.
- **Component Standardization**: Standardized reusable components like `ModuleContainer`, `StatCard`, `ModernCard`, `ModernDashboardLayout`, and `ModernTabNavigation` are used across the platform.
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
- **Educational Management System**: Features include robust grade management with African-style report cards, real-time attendance tracking, homework assignment and submission, and flexible timetable management with African cultural adaptations.
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