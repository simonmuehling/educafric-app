# Educafric - African Educational Technology Platform

## Overview

Educafric is a comprehensive African educational technology platform designed to provide a complete digital learning ecosystem for schools, teachers, parents, and students. It aims to address critical educational needs in Africa by offering a robust, bilingual (French/English), mobile-first solution. Key capabilities include integrated academic management, communication tools, and financial features tailored for the African market, such as SMS/WhatsApp communication and localized payment options. The project envisions significant market potential by offering substantial cost savings for schools, high ROI for all stakeholders, and improved educational outcomes, aligning with UN Sustainable Development Goals for education.

## User Preferences

Preferred communication style: Simple, everyday language.

**CRITICAL USER PREFERENCES:**
- ALWAYS consolidate ALL dashboards (Teacher, Student, Parent, Freelancer, Commercial, SiteAdmin) when making changes
- NEVER make partial updates to only some dashboards
- ALWAYS preserve button functionality when making changes - buttons must remain functional
- User does not want to repeat instructions about button functionality preservation

## System Architecture

### Frontend Architecture
- **React** with TypeScript for type-safe component development.
- **Tailwind CSS** for responsive, mobile-first styling with a custom African-themed color palette, emphasizing a modern, vibrant, and 3D-inspired visual redesign.
- **Wouter** for lightweight client-side routing.
- **TanStack Query** for server state management and caching.
- **Radix UI + Shadcn/UI** for accessible, production-ready component primitives.
- **Progressive Web App (PWA)** capabilities for mobile optimization, including offline functionality.
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
- **Authentication & Authorization**: Secure local and Firebase Google OAuth authentication with comprehensive session management and granular permissions for 8 user roles. Includes an intelligent multi-role detection system.
- **Educational Management System**: Features include robust grade management with African-style report cards, real-time attendance tracking, homework assignment and submission, and flexible timetable management with African cultural adaptations.
- **Communication System**: Integrated multi-channel notification system (SMS via Vonage, WhatsApp Business API, Email via Hostinger SMTP, and PWA push notifications) with bilingual, contextual templates.
- **Payment & Subscription Management**: Stripe integration for international payments, alongside local African payment methods (Orange Money, MTN Mobile Money, Afriland First Bank). Supports multiple subscription tiers.
- **Geolocation Services**: Comprehensive GPS tracking for tablets, smartwatches, and phones, featuring geofencing, safe zone management, real-time device monitoring, and emergency alerts.
- **Document Management System**: Centralized system for managing commercial, administrative, and legal documents with digital signatures, PDF generation, and controlled access.
- **Bilingual Support**: Dynamic French/English language switching with complete localization of UI, educational content, and documentation, including context-aware translations specific to African educational terminology.
- **Sandbox Environment**: A dedicated, fully unlocked sandbox environment with realistic African demo data and comprehensive developer tools.
- **Tutorial System**: Backend-driven tutorial system with progress tracking and analytics.

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