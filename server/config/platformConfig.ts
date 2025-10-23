/**
 * Centralized Platform Configuration for EDUCAFRIC
 * All platform-wide constants and contact information
 */

export const PLATFORM_CONFIG = {
  // Contact Information
  contacts: {
    // Primary African contact number (displayed to users)
    supportPhoneAfrican: '+237 656 200 472',
    supportPhoneAfricanE164: '+237656200472',
    
    // Technical WhatsApp Business API number (backend use only)
    whatsappBusinessNumber: '+41 78 255 01 46',
    whatsappBusinessNumberE164: '+41782550146',
    
    // Email addresses
    supportEmail: 'support@educafric.com',
    infoEmail: 'info@educafric.com',
    noReplyEmail: 'no-reply@educafric.com',
    
    // Owner/Admin contacts
    ownerEmail: 'simonpmuehling@gmail.com',
    ownerPhones: ['+237657004011', '+41768017000']
  },
  
  // Platform URLs
  urls: {
    website: 'https://www.educafric.com',
    websiteDev: 'http://localhost:5000',
    supportUrl: 'https://www.educafric.com/support'
  },
  
  // Notification Settings
  notifications: {
    // Auto-send notifications for these events
    autoNotify: {
      attendance: true,        // Absences, retards, présences
      grades: true,           // Notes, bulletins
      payments: true,         // Paiements, abonnements
      geolocation: true,      // Alertes de géolocalisation
      onlineClasses: true,    // Classes en ligne
      subscriptions: true     // Expiration d'abonnement
    },
    
    // Channels to use for auto-notifications
    channels: {
      email: true,
      whatsapp: true,
      pwa: true,
      sms: false  // Disabled - use WhatsApp instead
    },
    
    // Default language for Cameroon
    defaultLanguage: 'fr' as 'fr' | 'en',
    
    // Timezone
    timezone: 'Africa/Douala'
  },
  
  // WhatsApp Configuration
  whatsapp: {
    // Display this number to users for support
    displayNumber: '+237 656 200 472',
    
    // Use this for wa.me links
    clickToChat: '+237656200472',
    
    // Business API configuration (from env vars)
    apiPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    apiAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || ''
  },
  
  // Branding
  branding: {
    name: 'EDUCAFRIC',
    tagline: 'Plateforme Éducative Africaine',
    logo: '🎓'
  }
} as const;

// Helper functions
export function getSupportPhone(): string {
  return PLATFORM_CONFIG.contacts.supportPhoneAfrican;
}

export function getSupportEmail(): string {
  return PLATFORM_CONFIG.contacts.supportEmail;
}

export function getWhatsAppDisplayNumber(): string {
  return PLATFORM_CONFIG.whatsapp.displayNumber;
}

export function getWhatsAppClickToChatNumber(): string {
  return PLATFORM_CONFIG.whatsapp.clickToChat;
}

export function shouldAutoNotify(eventType: keyof typeof PLATFORM_CONFIG.notifications.autoNotify): boolean {
  return PLATFORM_CONFIG.notifications.autoNotify[eventType] || false;
}

export function isNotificationChannelEnabled(channel: keyof typeof PLATFORM_CONFIG.notifications.channels): boolean {
  return PLATFORM_CONFIG.notifications.channels[channel] || false;
}
