import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, type Language } from '@/lib/translations';

// 🌍 Centralized Bilingual Error Message System
// Following Educafric's comprehensive translation methodology with hierarchical structure
export const errorMessages = {
  // Authentication Errors
  invalidCredentials: {
    en: 'Invalid email or password',
    fr: 'Email ou mot de passe invalide'
  },
  emailRequired: {
    en: 'Email and password are required',
    fr: 'Email et mot de passe requis'
  },
  namesRequired: {
    en: 'First name and last name are required',
    fr: 'Prénom et nom requis'
  },
  authFailed: {
    en: 'Authentication failed',
    fr: 'Échec de l\'authentification'
  },
  accountExists: {
    en: 'An account with this email already exists',
    fr: 'Un compte avec cet email existe déjà'
  },
  
  // Password Errors
  passwordsDontMatch: {
    en: "Passwords don't match",
    fr: 'Les mots de passe ne correspondent pas'
  },
  passwordTooShort: {
    en: 'Password must be at least 8 characters',
    fr: 'Le mot de passe doit contenir au moins 8 caractères'
  },
  passwordTooWeak: {
    en: 'Password must contain uppercase, lowercase, number and special character',
    fr: 'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial'
  },
  
  // Form Validation Errors
  fillAllFields: {
    en: 'Please fill in all required fields',
    fr: 'Veuillez remplir tous les champs requis'
  },
  invalidEmail: {
    en: 'Please enter a valid email address',
    fr: 'Veuillez entrer une adresse email valide'
  },
  invalidPhone: {
    en: 'Please enter a valid phone number',
    fr: 'Veuillez entrer un numéro de téléphone valide'
  },
  
  // Network Errors
  networkError: {
    en: 'Network error. Please check your connection.',
    fr: 'Erreur réseau. Vérifiez votre connexion.'
  },
  serverError: {
    en: 'Server error. Please try again later.',
    fr: 'Erreur serveur. Réessayez plus tard.'
  },
  requestTimeout: {
    en: 'Request timeout. Please try again.',
    fr: 'Délai d\'attente dépassé. Réessayez.'
  },
  
  // Password Reset Errors
  failedToSendReset: {
    en: 'Failed to send reset email',
    fr: 'Échec de l\'envoi de l\'email de réinitialisation'
  },
  failedToResetPassword: {
    en: 'Failed to reset password',
    fr: 'Échec de la réinitialisation du mot de passe'
  },
  invalidResetToken: {
    en: 'Invalid or expired reset token',
    fr: 'Token de réinitialisation invalide ou expiré'
  },
  
  // File Upload Errors
  fileTooBig: {
    en: 'File size must be less than 5MB',
    fr: 'La taille du fichier doit être inférieure à 5MB'
  },
  invalidFileType: {
    en: 'Invalid file type. Only images are allowed.',
    fr: 'Type de fichier invalide. Seules les images sont autorisées.'
  },
  uploadFailed: {
    en: 'Failed to upload file',
    fr: 'Échec du téléchargement du fichier'
  },
  
  // Permission Errors
  accessDenied: {
    en: 'Access denied. You don\'t have permission to perform this action.',
    fr: 'Accès refusé. Vous n\'avez pas la permission d\'effectuer cette action.'
  },
  sessionExpired: {
    en: 'Your session has expired. Please login again.',
    fr: 'Votre session a expiré. Veuillez vous reconnecter.'
  },
  
  // Data Errors
  notFound: {
    en: 'The requested item was not found',
    fr: 'L\'élément demandé n\'a pas été trouvé'
  },
  saveError: {
    en: 'Failed to save changes',
    fr: 'Échec de la sauvegarde des modifications'
  },
  deleteError: {
    en: 'Failed to delete item',
    fr: 'Échec de la suppression de l\'élément'
  },
  
  // Success Messages
  accountCreated: {
    en: 'Account created successfully! Please login.',
    fr: 'Compte créé avec succès ! Veuillez vous connecter.'
  },
  passwordResetSent: {
    en: 'Password reset instructions sent to your email',
    fr: 'Instructions de réinitialisation envoyées à votre email'
  },
  passwordResetSuccess: {
    en: 'Password reset successful! You can now login.',
    fr: 'Réinitialisation réussie ! Vous pouvez maintenant vous connecter.'
  },
  profileUpdated: {
    en: 'Profile updated successfully',
    fr: 'Profil mis à jour avec succès'
  },
  changesSaved: {
    en: 'Changes saved successfully',
    fr: 'Modifications sauvegardées avec succès'
  },
  
  // Loading Messages
  loading: {
    en: 'Loading...',
    fr: 'Chargement...'
  },
  saving: {
    en: 'Saving...',
    fr: 'Sauvegarde...'
  },
  sending: {
    en: 'Sending...',
    fr: 'Envoi en cours...'
  },
  processing: {
    en: 'Processing...',
    fr: 'Traitement en cours...'
  }
};

// Hook to get localized error messages
export const useErrorMessages = () => {
  const { language } = useLanguage();
  
  const getErrorMessage = (key: keyof typeof errorMessages): string => {
    const message = errorMessages[key];
    if (!message) return key;
    return message[language as keyof typeof message] || message.en;
  };
  
  return { getErrorMessage };
};

// Helper function for toast error messages
export const getLocalizedErrorMessage = (key: keyof typeof errorMessages, language: 'en' | 'fr' = 'en'): string => {
  const message = errorMessages[key];
  if (!message) return key;
  return message[language] || message.en;
};