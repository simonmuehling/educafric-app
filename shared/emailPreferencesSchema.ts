import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Email Preferences Table - Enhanced for comprehensive email management
export const emailPreferences = pgTable("email_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // One preference set per user
  
  // Welcome & Onboarding Emails
  welcomeEmails: boolean("welcome_emails").default(true),
  onboardingTips: boolean("onboarding_tips").default(true),
  
  // Academic & Educational Emails
  weeklyProgressReports: boolean("weekly_progress_reports").default(true),
  assignmentNotifications: boolean("assignment_notifications").default(true),
  gradeNotifications: boolean("grade_notifications").default(true),
  attendanceAlerts: boolean("attendance_alerts").default(true),
  examSchedules: boolean("exam_schedules").default(true),
  
  // Safety & Security Emails
  geolocationAlerts: boolean("geolocation_alerts").default(true),
  emergencyNotifications: boolean("emergency_notifications").default(true),
  securityUpdates: boolean("security_updates").default(true),
  
  // Communication & Social Emails
  parentTeacherMessages: boolean("parent_teacher_messages").default(true),
  schoolAnnouncements: boolean("school_announcements").default(true),
  eventInvitations: boolean("event_invitations").default(true),
  newsletters: boolean("newsletters").default(true),
  
  // Financial & Subscription Emails
  paymentConfirmations: boolean("payment_confirmations").default(true),
  subscriptionReminders: boolean("subscription_reminders").default(true),
  invoiceDelivery: boolean("invoice_delivery").default(true),
  paymentFailures: boolean("payment_failures").default(true),
  
  // Platform & Technical Emails
  systemMaintenance: boolean("system_maintenance").default(true),
  featureUpdates: boolean("feature_updates").default(false),
  platformNews: boolean("platform_news").default(false),
  
  // Account & Profile Emails
  passwordResetEmails: boolean("password_reset_emails").default(true), // Cannot be disabled for security
  loginAttempts: boolean("login_attempts").default(true),
  profileChanges: boolean("profile_changes").default(true),
  accountDeletionEmails: boolean("account_deletion_emails").default(true), // Cannot be disabled for security
  
  // Marketing & Promotional Emails (opt-in only)
  promotionalEmails: boolean("promotional_emails").default(false),
  partnerOffers: boolean("partner_offers").default(false),
  surveyRequests: boolean("survey_requests").default(false),
  
  // Email Frequency Preferences
  emailFrequency: text("email_frequency").default("immediate"), // immediate, daily_digest, weekly_digest
  digestTime: text("digest_time").default("08:00"), // Preferred time for digest emails (HH:MM format)
  
  // Language and Formatting Preferences
  emailLanguage: text("email_language").default("fr"), // fr, en
  htmlEmails: boolean("html_emails").default(true), // HTML vs plain text preference
  
  // Global Email Control
  allEmailsEnabled: boolean("all_emails_enabled").default(true), // Master switch (except security emails)
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email preference categories for better organization
export const EMAIL_CATEGORIES = {
  ESSENTIAL: {
    name: { fr: "Emails Essentiels", en: "Essential Emails" },
    description: { 
      fr: "Emails critiques pour la sécurité et le fonctionnement du compte (ne peuvent pas être désactivés)",
      en: "Critical emails for security and account functionality (cannot be disabled)"
    },
    fields: ["passwordResetEmails", "accountDeletionEmails", "emergencyNotifications"]
  },
  ACADEMIC: {
    name: { fr: "Communications Académiques", en: "Academic Communications" },
    description: { 
      fr: "Notifications liées aux progrès scolaires, devoirs et évaluations",
      en: "Notifications related to academic progress, assignments and evaluations"
    },
    fields: ["weeklyProgressReports", "assignmentNotifications", "gradeNotifications", "attendanceAlerts", "examSchedules"]
  },
  SAFETY: {
    name: { fr: "Sécurité et Géolocalisation", en: "Safety and Geolocation" },
    description: { 
      fr: "Alertes de sécurité et notifications de géolocalisation",
      en: "Safety alerts and geolocation notifications"
    },
    fields: ["geolocationAlerts", "securityUpdates"]
  },
  COMMUNICATION: {
    name: { fr: "Communication École-Famille", en: "School-Family Communication" },
    description: { 
      fr: "Messages entre parents, enseignants et administration",
      en: "Messages between parents, teachers and administration"
    },
    fields: ["parentTeacherMessages", "schoolAnnouncements", "eventInvitations", "newsletters"]
  },
  FINANCIAL: {
    name: { fr: "Finances et Abonnements", en: "Finance and Subscriptions" },
    description: { 
      fr: "Confirmations de paiement, factures et rappels d'abonnement",
      en: "Payment confirmations, invoices and subscription reminders"
    },
    fields: ["paymentConfirmations", "subscriptionReminders", "invoiceDelivery", "paymentFailures"]
  },
  PLATFORM: {
    name: { fr: "Plateforme et Mises à Jour", en: "Platform and Updates" },
    description: { 
      fr: "Informations sur les nouvelles fonctionnalités et maintenance",
      en: "Information about new features and maintenance"
    },
    fields: ["systemMaintenance", "featureUpdates", "platformNews"]
  },
  ACCOUNT: {
    name: { fr: "Compte et Profil", en: "Account and Profile" },
    description: { 
      fr: "Notifications liées à votre compte utilisateur",
      en: "Notifications related to your user account"
    },
    fields: ["loginAttempts", "profileChanges"]
  },
  WELCOME: {
    name: { fr: "Bienvenue et Aide", en: "Welcome and Help" },
    description: { 
      fr: "Emails d'accueil et conseils d'utilisation",
      en: "Welcome emails and usage tips"
    },
    fields: ["welcomeEmails", "onboardingTips"]
  },
  MARKETING: {
    name: { fr: "Marketing (Optionnel)", en: "Marketing (Optional)" },
    description: { 
      fr: "Offres promotionnelles et enquêtes (désactivé par défaut)",
      en: "Promotional offers and surveys (disabled by default)"
    },
    fields: ["promotionalEmails", "partnerOffers", "surveyRequests"]
  }
} as const;

// Email frequency options
export const EMAIL_FREQUENCY_OPTIONS = [
  { value: "immediate", label: { fr: "Immédiat", en: "Immediate" } },
  { value: "daily_digest", label: { fr: "Résumé quotidien", en: "Daily digest" } },
  { value: "weekly_digest", label: { fr: "Résumé hebdomadaire", en: "Weekly digest" } }
] as const;

// Zod schemas
export const insertEmailPreferencesSchema = createInsertSchema(emailPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmailPreferencesSchema = insertEmailPreferencesSchema.partial();

export type InsertEmailPreferences = z.infer<typeof insertEmailPreferencesSchema>;
export type UpdateEmailPreferences = z.infer<typeof updateEmailPreferencesSchema>;
export type EmailPreferences = typeof emailPreferences.$inferSelect;

// Helper function to get default preferences based on user role
export function getDefaultEmailPreferences(userRole: string): Partial<InsertEmailPreferences> {
  const baseDefaults: Partial<InsertEmailPreferences> = {
    allEmailsEnabled: true,
    emailLanguage: "fr",
    emailFrequency: "immediate",
    htmlEmails: true,
    
    // Essential (always enabled)
    passwordResetEmails: true,
    accountDeletionEmails: true,
    emergencyNotifications: true,
    
    // Security
    geolocationAlerts: true,
    securityUpdates: true,
    loginAttempts: true,
    profileChanges: true,
    
    // Financial
    paymentConfirmations: true,
    subscriptionReminders: true,
    invoiceDelivery: true,
    paymentFailures: true,
    
    // Welcome
    welcomeEmails: true,
    onboardingTips: true,
    
    // Marketing (opt-in only)
    promotionalEmails: false,
    partnerOffers: false,
    surveyRequests: false,
  };

  // Role-specific defaults
  switch (userRole) {
    case "Parent":
      return {
        ...baseDefaults,
        weeklyProgressReports: true,
        assignmentNotifications: true,
        gradeNotifications: true,
        attendanceAlerts: true,
        examSchedules: true,
        parentTeacherMessages: true,
        schoolAnnouncements: true,
        eventInvitations: true,
        newsletters: true,
        systemMaintenance: false,
        featureUpdates: false,
        platformNews: false,
      };
      
    case "Teacher":
      return {
        ...baseDefaults,
        weeklyProgressReports: false, // Teachers generate these
        assignmentNotifications: false, // Teachers create these
        gradeNotifications: false,
        attendanceAlerts: false,
        examSchedules: true,
        parentTeacherMessages: true,
        schoolAnnouncements: true,
        eventInvitations: true,
        newsletters: true,
        systemMaintenance: true,
        featureUpdates: true,
        platformNews: false,
      };
      
    case "Student":
      return {
        ...baseDefaults,
        weeklyProgressReports: false, // Students see this in dashboard
        assignmentNotifications: true,
        gradeNotifications: true,
        attendanceAlerts: false, // Parents get these
        examSchedules: true,
        parentTeacherMessages: false, // Students don't participate directly
        schoolAnnouncements: true,
        eventInvitations: true,
        newsletters: false,
        systemMaintenance: false,
        featureUpdates: false,
        platformNews: false,
      };
      
    case "Admin":
    case "Director":
      return {
        ...baseDefaults,
        weeklyProgressReports: false,
        assignmentNotifications: false,
        gradeNotifications: false,
        attendanceAlerts: false,
        examSchedules: true,
        parentTeacherMessages: true,
        schoolAnnouncements: true,
        eventInvitations: true,
        newsletters: true,
        systemMaintenance: true,
        featureUpdates: true,
        platformNews: true,
      };
      
    case "Commercial":
    case "Freelancer":
      return {
        ...baseDefaults,
        weeklyProgressReports: false,
        assignmentNotifications: false,
        gradeNotifications: false,
        attendanceAlerts: false,
        examSchedules: false,
        parentTeacherMessages: false,
        schoolAnnouncements: false,
        eventInvitations: false,
        newsletters: false,
        systemMaintenance: true,
        featureUpdates: true,
        platformNews: true,
        promotionalEmails: true, // Commercial roles might want these
      };
      
    case "SiteAdmin":
      return {
        ...baseDefaults,
        weeklyProgressReports: false,
        assignmentNotifications: false,
        gradeNotifications: false,
        attendanceAlerts: false,
        examSchedules: false,
        parentTeacherMessages: false,
        schoolAnnouncements: false,
        eventInvitations: false,
        newsletters: false,
        systemMaintenance: true,
        featureUpdates: true,
        platformNews: true,
      };
      
    default:
      return baseDefaults;
  }
}