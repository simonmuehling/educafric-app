import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, getTranslation, type Language, type TranslationKey } from '@/lib/translations';

// Backward compatibility type
type LegacyLanguage = Language;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 🌍 Legacy translations object for backward compatibility with existing components
const legacyTranslations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    grades: 'Grades',
    attendance: 'Attendance',
    homework: 'Homework',
    timetable: 'Timetable',
    parents: 'Parents',
    payments: 'Payments',
    reports: 'Reports',
    settings: 'Settings',
    admin: 'Site Admin',
    logout: 'Logout',
    
    // Dashboard
    dashboardOverview: 'Dashboard Overview',
    totalStudents: 'Total Students',
    activeTeachers: 'Active Teachers',
    totalClasses: 'Classes',
    attendanceRate: 'Attendance Rate',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    viewAll: 'View All',
    
    // Actions
    addNewStudent: 'Add New Student',
    markAttendance: 'Mark Attendance',
    createHomework: 'Create Homework',
    generateReports: 'Generate Reports',
    sendNotifications: 'Send Notifications',
    
    // Authentication & Errors
    login: 'Login',
    register: 'Register',
    success: 'Success',
    error: 'Error',
    invalidCredentials: 'Invalid email or password',
    emailRequired: 'Email and password are required',
    namesRequired: 'First name and last name are required',
    authFailed: 'Authentication failed',
    accountCreated: 'Account created successfully! Please login.',
    welcomeBack: 'Welcome to Educafric!',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    
    // Password Reset
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    passwordResetSent: 'Reset Email Sent',
    passwordResetSuccess: 'Password Reset Successful',
    enterNewPassword: 'Enter your new password below',
    enterEmailForReset: 'Enter your email to receive reset instructions',
    backToLogin: 'Back to Login',
    sendResetInstructions: 'Send Reset Instructions',
    sending: 'Sending...',
    resetting: 'Resetting...',
    resetPasswordButton: 'Reset Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    enterNewPasswordPlaceholder: 'Enter new password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    enterEmailPlaceholder: 'Enter your email',
    passwordsDontMatch: "Passwords don't match",
    passwordTooShort: 'Password must be at least 8 characters',
    fillAllFields: 'Please fill in all fields',
    passwordResetSuccessMessage: 'Your password has been updated. You can now login.',
    resetEmailSentMessage: "If an account exists with this email, you'll receive reset instructions.",
    failedToSendReset: 'Failed to send reset email',
    failedToResetPassword: 'Failed to reset password',
    createAccountPrompt: 'Create your account to get started',
    welcomeBackMessage: 'Welcome back to your educational platform',
    
    // Student Management
    studentManagement: 'Student Management',
    searchStudents: 'Search students...',
    addStudent: 'Add Student',
    student: 'Student',
    class: 'Class',
    averageGrade: 'Average Grade',
    parentContact: 'Parent Contact',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    remove: 'Remove',
    
    // Communication
    communicationCenter: 'Communication Center',
    smsSent: 'SMS Sent',
    whatsappSent: 'WhatsApp',
    emailsSent: 'Emails',
    sendBulkSMS: 'Send Bulk SMS',
    sendWhatsAppBroadcast: 'WhatsApp Broadcast',
    composeEmail: 'Compose Email',
    
    // Subscription
    paymentSubscriptions: 'Payment & Subscriptions',
    schoolPremiumPlan: 'School Premium Plan',
    annualSubscription: 'Annual subscription active',
    perYear: 'per year',
    renewal: 'Renewal',
    active: 'Active',
    parentSubscriptions: 'Parent Subscriptions',
    monthlyRevenue: 'Monthly Revenue',
    managePayments: 'Manage Payments',
    
    // Additional Common Terms
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    dismiss: 'Dismiss',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    students: 'Élèves',
    teachers: 'Enseignants',
    classes: 'Classes',
    grades: 'Notes',
    attendance: 'Présence',
    homework: 'Devoirs',
    timetable: 'Emploi du temps',
    parents: 'Parents',
    payments: 'Paiements',
    reports: 'Rapports',
    settings: 'Paramètres',
    admin: 'Admin Site',
    logout: 'Déconnexion',
    
    // Dashboard
    dashboardOverview: 'Aperçu du tableau de bord',
    totalStudents: 'Total des élèves',
    activeTeachers: 'Enseignants actifs',
    totalClasses: 'Classes',
    attendanceRate: 'Taux de présence',
    recentActivity: 'Activité récente',
    quickActions: 'Actions rapides',
    viewAll: 'Voir tout',
    
    // Actions
    addNewStudent: 'Ajouter un nouvel élève',
    markAttendance: 'Marquer la présence',
    createHomework: 'Créer des devoirs',
    generateReports: 'Générer des rapports',
    sendNotifications: 'Envoyer des notifications',
    
    // Authentication & Errors
    login: 'Connexion',
    register: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    role: 'Rôle',
    school: 'École',
    error: 'Erreur',
    success: 'Succès',
    invalidCredentials: 'Email ou mot de passe invalide',
    emailRequired: 'Email et mot de passe requis',
    namesRequired: 'Prénom et nom requis',
    authFailed: 'Échec de l\'authentification',
    accountCreated: 'Compte créé avec succès ! Veuillez vous connecter.',
    welcomeBack: 'Bienvenue sur Educafric !',
    
    // Password Reset
    forgotPassword: 'Mot de passe oublié',
    resetPassword: 'Réinitialiser le mot de passe',
    passwordResetSent: 'Email de réinitialisation envoyé',
    passwordResetSuccess: 'Mot de passe réinitialisé avec succès',
    enterNewPassword: 'Entrez votre nouveau mot de passe ci-dessous',
    enterEmailForReset: 'Entrez votre email pour recevoir les instructions',
    backToLogin: 'Retour à la connexion',
    sendResetInstructions: 'Envoyer les instructions',
    sending: 'Envoi en cours...',
    resetting: 'Réinitialisation...',
    resetPasswordButton: 'Réinitialiser le mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    enterNewPasswordPlaceholder: 'Entrez le nouveau mot de passe',
    confirmNewPasswordPlaceholder: 'Confirmez le nouveau mot de passe',
    enterEmailPlaceholder: 'Entrez votre email',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    fillAllFields: 'Veuillez remplir tous les champs',
    passwordResetSuccessMessage: 'Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.',
    resetEmailSentMessage: "Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.",
    failedToSendReset: 'Échec de l\'envoi de l\'email de réinitialisation',
    failedToResetPassword: 'Échec de la réinitialisation du mot de passe',
    createAccountPrompt: 'Créez votre compte pour commencer',
    welcomeBackMessage: 'Bienvenue sur votre plateforme éducative',
    
    // Student Management
    studentManagement: 'Gestion des élèves',
    searchStudents: 'Rechercher des élèves...',
    addStudent: 'Ajouter un élève',
    student: 'Élève',
    class: 'Classe',
    averageGrade: 'Note moyenne',
    parentContact: 'Contact parent',
    actions: 'Actions',
    view: 'Voir',
    edit: 'Modifier',
    remove: 'Supprimer',
    
    // Communication
    communicationCenter: 'Centre de communication',
    smsSent: 'SMS envoyés',
    whatsappSent: 'WhatsApp',
    emailsSent: 'Emails',
    sendBulkSMS: 'Envoyer SMS en masse',
    sendWhatsAppBroadcast: 'Diffusion WhatsApp',
    composeEmail: 'Rédiger un email',
    
    // Subscription
    paymentSubscriptions: 'Paiements et abonnements',
    schoolPremiumPlan: 'Plan Premium École',
    annualSubscription: 'Abonnement annuel actif',
    perYear: 'par an',
    renewal: 'Renouvellement',
    active: 'Actif',
    parentSubscriptions: 'Abonnements parents',
    monthlyRevenue: 'Revenus mensuels',
    managePayments: 'Gérer les paiements',
    
    // Additional Common Terms
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    close: 'Fermer',
    dismiss: 'Ignorer',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('educafric-language') as Language;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('educafric-language', lang);
  };

  // 🌍 Advanced dot-notation translation function with hierarchical support
  const t = useCallback((key: string): string => {
    // First try the new comprehensive translation system
    const comprehensiveTranslation = getTranslation(key, language);
    
    // Make sure we always return a string, never an object
    if (typeof comprehensiveTranslation === 'string' && comprehensiveTranslation !== key) {
      return comprehensiveTranslation;
    }
    
    // Fallback to legacy translations for backward compatibility
    const legacyResult = legacyTranslations[language][key as keyof typeof legacyTranslations['en']];
    if (typeof legacyResult === 'string') {
      return legacyResult;
    }
    
    // Always return the key as string if nothing else works
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
