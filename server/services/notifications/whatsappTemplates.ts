// ===== WHATSAPP TEMPLATES MODULE =====
// Extracted from huge notificationService.ts to prevent crashes

export const WHATSAPP_TEMPLATES = {
  QUICK_UPDATES: {
    en: {
      ABSENT: (childName: string) => `🚨 ${childName} marked absent today`,
      LATE: (childName: string, time: string) => `⏰ ${childName} arrived late at ${time}`,
      GOOD_GRADE: (childName: string, subject: string, grade: string) => 
        `🎉 ${childName} scored ${grade} in ${subject}!`,
      FEES_DUE: (childName: string, amount: string) => 
        `💰 School fees due: ${amount} for ${childName}`
    },
    fr: {
      ABSENT: (childName: string) => `🚨 ${childName} marqué absent aujourd'hui`,
      LATE: (childName: string, time: string) => `⏰ ${childName} arrivé en retard à ${time}`,
      GOOD_GRADE: (childName: string, subject: string, grade: string) => 
        `🎉 ${childName} a obtenu ${grade} en ${subject}!`,
      FEES_DUE: (childName: string, amount: string) => 
        `💰 Frais scolaires dus: ${amount} pour ${childName}`
    }
  },

  EMERGENCY_ALERTS: {
    en: {
      SCHOOL_CLOSURE: (reason: string) => `🚨 URGENT: School closed - ${reason}`,
      WEATHER_ALERT: (warning: string) => `⛈️ Weather Alert: ${warning}`,
      PICKUP_URGENT: (childName: string) => `🚗 Urgent pickup needed for ${childName}`
    },
    fr: {
      SCHOOL_CLOSURE: (reason: string) => `🚨 URGENT: École fermée - ${reason}`,
      WEATHER_ALERT: (warning: string) => `⛈️ Alerte Météo: ${warning}`,
      PICKUP_URGENT: (childName: string) => `🚗 Récupération urgente nécessaire pour ${childName}`
    }
  }
};