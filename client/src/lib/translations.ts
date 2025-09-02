// 🌍 EDUCAFRIC COMPREHENSIVE BILINGUAL TRANSLATION SYSTEM
// Following the perfect bilingual methodology with hierarchical structure

export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // 🏠 Navigation & Common UI
    nav: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      students: "Élèves",
      teachers: "Enseignants",
      classes: "Classes",
      grades: "Notes",
      attendance: "Assiduité",
      homework: "Devoirs",
      timetable: "Emploi du temps",
      parents: "Parents",
      payments: "Paiements",
      reports: "Rapports",
      settings: "Paramètres",
      admin: "Admin Site",
      logout: "Déconnexion",
      schools: "Écoles",
      freelancer: "Répétiteur"
    },

    // 🔐 Authentication System
    auth: {
      login: {
        title: "Connexion",
        subtitle: "Accédez à votre plateforme éducative",
        button: "Se connecter",
        googleButton: "Continuer avec Google",
        separatorText: "Ou continuez avec"
      },
      register: {
        title: "Créer votre compte",
        subtitle: "Créez votre compte pour commencer",
        button: "S'inscrire",
        switchPrompt: "Vous avez déjà un compte ? Connectez-vous"
      },
      fields: {
        email: "Email",
        password: "Mot de passe",
        firstName: "Prénom",
        lastName: "Nom",
        role: "Rôle",
        school: "École",
        confirmPassword: "Confirmer le mot de passe"
      },
      placeholders: {
        email: "vous@exemple.com",
        firstName: "Jean",
        lastName: "Dupond",
        password: "Votre mot de passe",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe"
      },
      forgot: {
        title: "Mot de passe oublié",
        subtitle: "Entrez votre email pour recevoir les instructions",
        button: "Envoyer les instructions",
        backToLogin: "Retour à la connexion"
      },
      reset: {
        title: "Réinitialiser le mot de passe",
        subtitle: "Entrez votre nouveau mot de passe ci-dessous",
        button: "Réinitialiser le mot de passe",
        newPassword: "Nouveau mot de passe",
        confirmNewPassword: "Confirmer le nouveau mot de passe"
      }
    },

    // ⚠️ Error Messages - Comprehensive Coverage
    errors: {
      // Authentication Errors
      auth: {
        invalidCredentials: "Email ou mot de passe invalide",
        accountExists: "Un compte avec cet email existe déjà",
        authFailed: "Échec de l'authentification",
        sessionExpired: "Votre session a expiré. Veuillez vous reconnecter",
        accessDenied: "Accès refusé. Vous n'avez pas la permission d'effectuer cette action"
      },
      // Validation Errors
      validation: {
        emailRequired: "Email et mot de passe requis",
        namesRequired: "Prénom et nom requis",
        fillAllFields: "Veuillez remplir tous les champs requis",
        invalidEmail: "Veuillez entrer une adresse email valide",
        invalidPhone: "Veuillez entrer un numéro de téléphone valide",
        passwordsDontMatch: "Les mots de passe ne correspondent pas",
        passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
        passwordTooWeak: "Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial"
      },
      // Network & Server Errors
      network: {
        networkError: "Erreur réseau. Vérifiez votre connexion",
        serverError: "Erreur serveur. Réessayez plus tard",
        requestTimeout: "Délai d'attente dépassé. Réessayez",
        connectionLost: "Connexion perdue. Reconnexion en cours..."
      },
      // Password Reset Errors
      password: {
        failedToSendReset: "Échec de l'envoi de l'email de réinitialisation",
        failedToResetPassword: "Échec de la réinitialisation du mot de passe",
        invalidResetToken: "Token de réinitialisation invalide ou expiré"
      },
      // File & Upload Errors
      file: {
        fileTooBig: "La taille du fichier doit être inférieure à 5MB",
        invalidFileType: "Type de fichier invalide. Seules les images sont autorisées",
        uploadFailed: "Échec du téléchargement du fichier"
      },
      // Data Errors
      data: {
        notFound: "L'élément demandé n'a pas été trouvé",
        saveError: "Échec de la sauvegarde des modifications",
        deleteError: "Échec de la suppression de l'élément",
        loadError: "Échec du chargement des données"
      }
    },

    // ✅ Success Messages
    success: {
      auth: {
        accountCreated: "Compte créé avec succès ! Veuillez vous connecter",
        loginSuccess: "Connexion réussie ! Bienvenue sur Educafric",
        passwordResetSent: "Instructions de réinitialisation envoyées à votre email",
        passwordResetSuccess: "Réinitialisation réussie ! Vous pouvez maintenant vous connecter"
      },
      general: {
        profileUpdated: "Profil mis à jour avec succès",
        changesSaved: "Modifications sauvegardées avec succès",
        itemDeleted: "Élément supprimé avec succès",
        operationComplete: "Opération terminée avec succès"
      }
    },

    // 🔄 Loading States
    loading: {
      general: "Chargement...",
      saving: "Sauvegarde...",
      sending: "Envoi en cours...",
      processing: "Traitement en cours...",
      connecting: "Connexion...",
      authenticating: "Authentification...",
      resetting: "Réinitialisation...",
      uploading: "Téléchargement..."
    },

    // 🎯 Common Actions
    actions: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      add: "Ajouter",
      remove: "Supprimer",
      confirm: "Confirmer",
      close: "Fermer",
      dismiss: "Ignorer",
      retry: "Réessayer",
      refresh: "Actualiser",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      export: "Exporter",
      import: "Importer",
      send: "Envoyer",
      submit: "Soumettre"
    },

    // 👥 User Roles - African Educational Context
    roles: {
      student: "Élève",
      parent: "Parent",
      teacher: "Enseignant",
      admin: "Administrateur",
      director: "Directeur",
      siteAdmin: "Admin Site",
      freelancer: "Professeur Indépendant",
      commercial: "Commercial"
    },
    multiRole: {
      detectedRoles: "Rôles Détectés",
      phoneDetected: "Numéro détecté",
      detectionExplanation: "Nous avons trouvé ce numéro de téléphone associé à plusieurs rôles. Sélectionnez tous les rôles qui vous concernent.",
      suggestedRoles: "Rôles suggérés",
      school: "École",
      note: "Note",
      multiRoleExplanation: "Vous pouvez avoir plusieurs rôles simultanément (ex: Directeur + Enseignant + Parent). Vous pourrez basculer entre vos rôles après connexion.",
      noRolesDetected: "Aucun rôle détecté pour ce numéro",
      skipDetection: "Ignorer la détection",
      confirmRoles: "Confirmer les rôles",
      highConfidence: "Confiance élevée",
      mediumConfidence: "Confiance moyenne",
      lowConfidence: "Confiance faible",
      activeSchool: "École active",
      selectSchool: "Sélectionner une école",
      switchSchool: "Changer",
      schoolSwitched: "École changée",
      nowActiveAt: "Maintenant actif à",
      switchSchoolError: "Erreur lors du changement d'école",
      schoolsAvailable: "écoles disponibles"
    },

    // 🏫 Educational Terminology - African Context
    education: {
      school: "École",
      class: "Classe",
      grade: "Note",
      subject: "Matière",
      lesson: "Cours",
      homework: "Devoir",
      exam: "Examen",
      semester: "Semestre",
      year: "Année scolaire",
      attendance: "Assiduité",
      timetable: "Emploi du temps",
      curriculum: "Programme scolaire"
    },

    // 💰 Payment & African Financial Context
    payment: {
      currency: "FCFA",
      methods: {
        bankTransfer: "Virement bancaire",
        orangeMoney: "Orange Money",
        mtnMoney: "MTN Money",
        creditCard: "Carte bancaire",
        cash: "Espèces"
      },
      subscription: {
        monthly: "Mensuel",
        annual: "Annuel",
        active: "Actif",
        expired: "Expiré",
        pending: "En attente",
        // Subscribe page translations
        title: "Finaliser votre abonnement",
        backToPlans: "Retour aux plans",
        activeTitle: "Abonnement Actif !",
        activeSubtitle: "est actuellement actif",
        orderSummary: "Récapitulatif de votre commande",
        preparingPayment: "Préparation du paiement...",
        confirmPayment: "Confirmer le paiement de",
        processingPayment: "Traitement en cours...",
        securedBy: "Paiement sécurisé par Stripe",
        backToPaymentMethods: "Choisir une autre méthode",
        loadingPayment: "Chargement du système de paiement...",
        goDashboard: "Accéder à mon tableau de bord",
        expiresOn: "Expire le :",
        welcome: "Bienvenue dans EDUCAFRIC Premium !",
        enjoyFeatures: "Votre abonnement est maintenant actif. Profitez de toutes nos fonctionnalités !",
        // Error messages
        paymentError: "Erreur de paiement",
        cannotCreateIntent: "Impossible de créer l'intention de paiement",
        sessionExpired: "Session expirée",
        reconnectPrompt: "Veuillez vous reconnecter pour continuer",
        connectionError: "Erreur de connexion",
        cannotConnect: "Impossible de se connecter au service de paiement",
        paymentFailed: "Le paiement a échoué",
        unexpectedError: "Erreur inattendue",
        paymentProcessingError: "Une erreur s'est produite lors du traitement du paiement",
        loadingError: "Erreur de chargement",
        cannotLoadPayment: "Impossible de charger le système de paiement",
        // Success messages
        paymentSuccess: "Paiement réussi !",
        subscriptionActive: "est maintenant actif",
        sandboxMode: "Mode Sandbox",
        sandboxTest: "Test en cours avec compte sandbox - paiement simulé",
        // Intervals
        perMonth: "mois",
        perYear: "an",
        perSemester: "semestre"
      }
    },

    // 📱 Mobile & Responsive
    mobile: {
      menu: "Menu",
      close: "Fermer",
      toggleMenu: "Basculer le menu",
      backToTop: "Retour en haut",
      swipeHint: "Glissez pour plus d'options"
    },

    // 📍 Géolocalisation et Sécurité des Enfants
    geolocation: {
      title: "Suivi de Localisation des Enfants",
      subtitle: "Surveillance en temps réel et gestion de sécurité",
      overview: "Aperçu",
      children: "Enfants", 
      safeZones: "Zones de Sécurité",
      alerts: "Alertes",
      realTimeTracking: "Suivi Temps Réel",
      activeDevices: "Appareils Actifs",
      safeZonesCount: "Zones de Sécurité",
      todayAlerts: "Alertes d'Aujourd'hui",
      status: "Statut",
      batteryLevel: "Niveau de Batterie",
      lastSeen: "Dernière Vue",
      viewMap: "Voir sur la Carte",
      configureTracking: "Configurer Suivi",
      addSafeZone: "Ajouter Zone Sécurisée",
      modifySafeZone: "Modifier Zone",
      resolveAlert: "Résoudre",
      recentAlerts: "Alertes Récentes",
      noAlerts: "Aucune alerte trouvée",
      safe: "En Sécurité",
      at_school: "À l'École",
      in_transit: "En Transit",
      unknown: "Inconnu",
      home: "Maison",
      school: "École",
      relative: "Membre de la Famille",
      activity: "Centre d'Activités",
      emergency: "Urgence",
      zone_exit: "Sortie de Zone",
      zone_enter: "Entrée de Zone",
      low_battery: "Batterie Faible"
    },

    // 🔔 Notifications - Multi-channel
    notifications: {
      settings: "Paramètres de Notifications",
      sms: "Notifications SMS",
      email: "Notifications Email",
      push: "Notifications Push",
      language: "Langue des Notifications",
      languageDescription: "Cette langue sera utilisée pour tous vos SMS, emails et notifications push",
      frequency: "Fréquence",
      channels: "Canaux de notification"
    }
  },

  en: {
    // 🏠 Navigation & Common UI
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      students: "Students",
      teachers: "Teachers",
      classes: "Classes",
      grades: "Grades",
      attendance: "Attendance",
      homework: "Homework",
      timetable: "Timetable",
      parents: "Parents",
      payments: "Payments",
      reports: "Reports",
      settings: "Settings",
      admin: "Site Admin",
      logout: "Logout",
      schools: "Schools",
      freelancer: "Freelancer"
    },

    // 🔧 General UI Components
    general: {
      search: 'Search',
      filter: 'Filter',
      actions: 'Actions',
      noDataFound: 'No data found',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      results: 'results',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      confirm: 'Confirm',
      back: 'Back',
      continue: 'Continue',
      finish: 'Finish',
      required: 'Required',
      optional: 'Optional',
      selectAll: 'Select All',
      selectNone: 'Select None',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      reset: 'Reset',
      clear: 'Clear',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
      help: 'Help',
      about: 'About',
      settings: 'Settings',
      preferences: 'Preferences',
      language: 'Language',
      theme: 'Theme',
      profile: 'Profile',
      account: 'Account',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      progress: 'Progress'
    },

    // 🔐 Authentication System
    auth: {
      login: {
        title: "Login",
        subtitle: "Welcome back to your educational platform",
        button: "Login",
        googleButton: "Continue with Google",
        separatorText: "Or continue with"
      },
      register: {
        title: "Create Account",
        subtitle: "Create your account to get started",
        button: "Register",
        switchPrompt: "Already have an account? Sign in"
      },
      fields: {
        email: "Email",
        password: "Password",
        firstName: "First Name",
        lastName: "Last Name",
        role: "Role",
        school: "School",
        confirmPassword: "Confirm Password"
      },
      placeholders: {
        email: "you@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Your password",
        newPassword: "New password",
        confirmPassword: "Confirm new password"
      },
      forgot: {
        title: "Forgot Password",
        subtitle: "Enter your email to receive reset instructions",
        button: "Send Reset Instructions",
        backToLogin: "Back to Login"
      },
      reset: {
        title: "Reset Password",
        subtitle: "Enter your new password below",
        button: "Reset Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password"
      }
    },

    // ⚠️ Error Messages - Comprehensive Coverage
    errors: {
      // Authentication Errors
      auth: {
        invalidCredentials: "Invalid email or password",
        accountExists: "An account with this email already exists",
        authFailed: "Authentication failed",
        sessionExpired: "Your session has expired. Please login again",
        accessDenied: "Access denied. You don't have permission to perform this action"
      },
      // Validation Errors
      validation: {
        emailRequired: "Email and password are required",
        namesRequired: "First name and last name are required",
        fillAllFields: "Please fill in all required fields",
        invalidEmail: "Please enter a valid email address",
        invalidPhone: "Please enter a valid phone number",
        passwordsDontMatch: "Passwords don't match",
        passwordTooShort: "Password must be at least 8 characters",
        passwordTooWeak: "Password must contain uppercase, lowercase, number and special character"
      },
      // Network & Server Errors
      network: {
        networkError: "Network error. Please check your connection",
        serverError: "Server error. Please try again later",
        requestTimeout: "Request timeout. Please try again",
        connectionLost: "Connection lost. Reconnecting..."
      },
      // Password Reset Errors
      password: {
        failedToSendReset: "Failed to send reset email",
        failedToResetPassword: "Failed to reset password",
        invalidResetToken: "Invalid or expired reset token"
      },
      // File & Upload Errors
      file: {
        fileTooBig: "File size must be less than 5MB",
        invalidFileType: "Invalid file type. Only images are allowed",
        uploadFailed: "Failed to upload file"
      },
      // Data Errors
      data: {
        notFound: "The requested item was not found",
        saveError: "Failed to save changes",
        deleteError: "Failed to delete item",
        loadError: "Failed to load data"
      }
    },

    // ✅ Success Messages
    success: {
      auth: {
        accountCreated: "Account created successfully! Please login",
        loginSuccess: "Login successful! Welcome to Educafric",
        passwordResetSent: "Password reset instructions sent to your email",
        passwordResetSuccess: "Password reset successful! You can now login"
      },
      general: {
        profileUpdated: "Profile updated successfully",
        changesSaved: "Changes saved successfully",
        itemDeleted: "Item deleted successfully",
        operationComplete: "Operation completed successfully"
      }
    },

    // 🔄 Loading States
    loading: {
      general: "Loading...",
      saving: "Saving...",
      sending: "Sending...",
      processing: "Processing...",
      connecting: "Connecting...",
      authenticating: "Authenticating...",
      resetting: "Resetting...",
      uploading: "Uploading..."
    },

    // 🎯 Common Actions
    actions: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      add: "Add",
      remove: "Remove",
      confirm: "Confirm",
      close: "Close",
      dismiss: "Dismiss",
      retry: "Retry",
      refresh: "Refresh",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      export: "Export",
      import: "Import",
      send: "Send",
      submit: "Submit"
    },

    // 👥 User Roles - African Educational Context
    roles: {
      student: "Student",
      parent: "Parent",
      teacher: "Teacher",
      admin: "Administrator",
      director: "Director",
      siteAdmin: "Site Admin",
      freelancer: "Independent Teacher",
      commercial: "Sales Representative"
    },
    multiRole: {
      detectedRoles: "Detected Roles",
      phoneDetected: "Detected phone",
      detectionExplanation: "We found this phone number associated with multiple roles. Select all roles that apply to you.",
      suggestedRoles: "Suggested roles",
      school: "School",
      note: "Note",
      multiRoleExplanation: "You can have multiple roles simultaneously (e.g. Director + Teacher + Parent). You can switch between your roles after login.",
      noRolesDetected: "No roles detected for this number",
      skipDetection: "Skip detection",
      confirmRoles: "Confirm roles",
      highConfidence: "High confidence",
      mediumConfidence: "Medium confidence",
      lowConfidence: "Low confidence",
      activeSchool: "Active school",
      selectSchool: "Select a school",
      switchSchool: "Switch",
      schoolSwitched: "School switched",
      nowActiveAt: "Now active at",
      switchSchoolError: "Error switching school",
      schoolsAvailable: "schools available"
    },

    // 🏫 Educational Terminology - African Context
    education: {
      school: "School",
      class: "Class",
      grade: "Grade",
      subject: "Subject",
      lesson: "Lesson",
      homework: "Homework",
      exam: "Exam",
      semester: "Semester",
      year: "Academic Year",
      attendance: "Attendance",
      timetable: "Timetable",
      curriculum: "Curriculum"
    },

    // 💰 Payment & African Financial Context
    payment: {
      currency: "CFA",
      methods: {
        bankTransfer: "Bank Transfer",
        orangeMoney: "Orange Money",
        mtnMoney: "MTN Money",
        creditCard: "Credit Card",
        cash: "Cash"
      },
      subscription: {
        monthly: "Monthly",
        annual: "Annual",
        active: "Active",
        expired: "Expired",
        pending: "Pending",
        // Subscribe page translations
        title: "Complete your subscription",
        backToPlans: "Back to plans",
        activeTitle: "Active Subscription!",
        activeSubtitle: "is currently active",
        orderSummary: "Order summary",
        preparingPayment: "Preparing payment...",
        confirmPayment: "Confirm payment of",
        processingPayment: "Processing...",
        securedBy: "Secured payment by Stripe",
        backToPaymentMethods: "Choose another method",
        loadingPayment: "Loading payment system...",
        goDashboard: "Go to my dashboard",
        expiresOn: "Expires on:",
        welcome: "Welcome to EDUCAFRIC Premium!",
        enjoyFeatures: "Your subscription is now active. Enjoy all our features!",
        // Error messages
        paymentError: "Payment error",
        cannotCreateIntent: "Unable to create payment intent",
        sessionExpired: "Session expired",
        reconnectPrompt: "Please log in again to continue",
        connectionError: "Connection error",
        cannotConnect: "Unable to connect to payment service",
        paymentFailed: "Payment failed",
        unexpectedError: "Unexpected error",
        paymentProcessingError: "An error occurred while processing payment",
        loadingError: "Loading error",
        cannotLoadPayment: "Unable to load payment system",
        // Success messages
        paymentSuccess: "Payment successful!",
        subscriptionActive: "is now active",
        sandboxMode: "Sandbox Mode",
        sandboxTest: "Testing with sandbox account - simulated payment",
        // Intervals
        perMonth: "month",
        perYear: "year",
        perSemester: "semester"
      }
    },

    // 📱 Mobile & Responsive
    mobile: {
      menu: "Menu",
      close: "Close",
      toggleMenu: "Toggle Menu",
      backToTop: "Back to Top",
      swipeHint: "Swipe for more options"
    },

    // 📊 Dashboard Views
    dashboard: {
      consolidatedView: "Consolidated View",
      legacyView: "Legacy View",
      overview: "Overview",
      analytics: "Analytics", 
      users: "Users",
      schools: "Schools",
      performance: "Performance",
      settings: "Settings",
      totalStudents: "Total Students",
      totalTeachers: "Total Teachers", 
      totalSchools: "Total Schools",
      revenue: "Revenue",
      systemHealth: "System Health",
      healthy: "Healthy",
      attendance: "Attendance",
      activeUsers: "Active Users",
      newRegistrations: "New Registrations",
      recentActivity: "Recent Activity",
      today: "Today",
      systemUpdate: "System Updated",
      paymentProcessed: "Payment Processed",
      quickActions: "Quick Actions",
      manageUsers: "Manage Users",
      viewSchools: "View Schools",
      sendNotification: "Send Notification",
      searchPlaceholder: "Search anything...",
      performanceOverview: "Performance Overview",
      thisMonth: "This Month",
      chartPlaceholder: "Chart data will be displayed here"
    },

    // 📍 Geolocation & Child Safety
    geolocation: {
      title: "Child Location Tracking",
      subtitle: "Real-time monitoring and safety management",
      overview: "Overview",
      children: "Children",
      safeZones: "Safe Zones", 
      alerts: "Alerts",
      realTimeTracking: "Real-time Tracking",
      activeDevices: "Active Devices",
      safeZonesCount: "Safe Zones",
      todayAlerts: "Today's Alerts",
      status: "Status",
      batteryLevel: "Battery Level",
      lastSeen: "Last Seen",
      viewMap: "View on Map",
      configureTracking: "Configure Tracking",
      addSafeZone: "Add Safe Zone",
      modifySafeZone: "Modify Zone",
      resolveAlert: "Resolve",
      recentAlerts: "Recent Alerts",
      noAlerts: "No alerts found",
      safe: "Safe",
      at_school: "At School", 
      in_transit: "In Transit",
      unknown: "Unknown",
      home: "Home",
      school: "School",
      relative: "Family Member",
      activity: "Activity Center",
      emergency: "Emergency",
      zone_exit: "Zone Exit",
      zone_enter: "Zone Entry",
      low_battery: "Low Battery"
    },

    // 🔔 Notifications - Multi-channel
    notifications: {
      settings: "Notification Settings",
      sms: "SMS Notifications",
      email: "Email Notifications",
      push: "Push Notifications",
      language: "Notification Language",
      languageDescription: "This language will be used for all your SMS, email and push notifications",
      frequency: "Frequency",
      channels: "Notification Channels"
    }
  }
};

// 🔧 Translation Key Types for TypeScript Safety - Fixed to remove optional chaining
export type TranslationKey = 
  | `nav.${keyof typeof translations.fr.nav}`
  | `auth.${keyof typeof translations.fr.auth}.${string}`
  | `errors.${keyof typeof translations.fr.errors}.${string}`
  | `success.${keyof typeof translations.fr.success}.${string}`
  | `loading.${keyof typeof translations.fr.loading}`
  | `actions.${keyof typeof translations.fr.actions}`
  | `roles.${keyof typeof translations.fr.roles}`
  | `education.${keyof typeof translations.fr.education}`
  | `payment.${keyof typeof translations.fr.payment}.${string}`
  | `mobile.${keyof typeof translations.fr.mobile}`
  | `notifications.${keyof typeof translations.fr.notifications}`;

// 🌍 Translation Helper Function with Dot Notation Support
export const getTranslation = (key: string, language: Language = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language] || translations['en'];
  
  // Navigate nested translation structure
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  // Fallback to English if French translation missing
  if (value === undefined && language === 'fr') {
    let fallbackValue: any = translations['en'];
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
      if (fallbackValue === undefined) break;
    }
    value = fallbackValue;
  }
  
  // Ensure we always return a string, never an object
  if (typeof value === 'string') {
    return value;
  }
  
  return key; // Return key if no translation found or if result is not a string
};