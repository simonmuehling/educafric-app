// ===== SMS TEMPLATES MODULE =====
// Extracted from huge notificationService.ts to prevent crashes

export const SMS_TEMPLATES = {
  // Attendance notifications - Include child name
  ABSENCE_ALERT: {
    en: (childName: string, date: string, className?: string) => 
      `${childName}${className ? ` (${className})` : ''} absent ${date}. Contact school if needed.`,
    fr: (childName: string, date: string, className?: string) => 
      `${childName}${className ? ` (${className})` : ''} absent ${date}. Contactez école si nécessaire.`
  },
  
  LATE_ARRIVAL: {
    en: (childName: string, time: string, className?: string) => 
      `${childName}${className ? ` (${className})` : ''} arrived late at ${time}.`,
    fr: (childName: string, time: string, className?: string) => 
      `${childName}${className ? ` (${className})` : ''} arrivé en retard à ${time}.`
  },

  // Grade notifications - Include child name and subject
  NEW_GRADE: {
    en: (childName: string, subject: string, grade: string) => 
      `${childName}: ${subject} grade ${grade}. Well done!`,
    fr: (childName: string, subject: string, grade: string) => 
      `${childName}: note ${subject} ${grade}. Bravo!`
  },

  LOW_GRADE_ALERT: {
    en: (childName: string, subject: string, grade: string) => 
      `${childName}: ${subject} ${grade}. Needs support. Contact teacher.`,
    fr: (childName: string, subject: string, grade: string) => 
      `${childName}: ${subject} ${grade}. Besoin aide. Contactez prof.`
  },

  // Payment notifications - Include child name for fees
  SCHOOL_FEES_DUE: {
    en: (childName: string, amount: string, dueDate: string) => 
      `${childName}: School fees ${amount} due ${dueDate}. Pay via app.`,
    fr: (childName: string, amount: string, dueDate: string) => 
      `${childName}: Frais ${amount} dus ${dueDate}. Payez via app.`
  },

  PAYMENT_CONFIRMED: {
    en: (childName: string, amount: string, reference: string) => 
      `${childName}: Payment ${amount} received. Ref: ${reference}. Thank you!`,
    fr: (childName: string, amount: string, reference: string) => 
      `${childName}: Paiement ${amount} reçu. Réf: ${reference}. Merci!`
  },

  // Emergency notifications - Include affected person
  EMERGENCY_ALERT: {
    en: (personName: string, situation: string) => 
      `URGENT: ${personName} - ${situation}. Contact school immediately.`,
    fr: (personName: string, situation: string) => 
      `URGENT: ${personName} - ${situation}. Contactez école immédiatement.`
  },

  // Bulletin notifications - New bulletin available
  BULLETIN_AVAILABLE: {
    en: (childName: string, period: string, average: string) => 
      `📋 ${childName}'s ${period} report card ready! Average: ${average}/20. Download in app with QR code.`,
    fr: (childName: string, period: string, average: string) => 
      `📋 Bulletin ${childName} ${period} disponible! Moyenne: ${average}/20. Téléchargez dans l'app avec QR code.`
  },

  BULLETIN_PUBLISHED: {
    en: (childName: string, period: string, className: string) => 
      `✅ ${childName} (${className}) - ${period} report card published. View & download now.`,
    fr: (childName: string, period: string, className: string) => 
      `✅ ${childName} (${className}) - Bulletin ${period} publié. Consultez et téléchargez maintenant.`
  },

  BULLETIN_EXCELLENT: {
    en: (childName: string, period: string, average: string, rank: string) => 
      `🏆 Excellent results! ${childName}: ${average}/20, Rank ${rank}. ${period} report card ready.`,
    fr: (childName: string, period: string, average: string, rank: string) => 
      `🏆 Excellents résultats! ${childName}: ${average}/20, Rang ${rank}. Bulletin ${period} prêt.`
  },

  BULLETIN_NEEDS_IMPROVEMENT: {
    en: (childName: string, period: string, average: string) => 
      `📚 ${childName} ${period}: Average ${average}/20. Support needed. Contact teacher. Report card ready.`,
    fr: (childName: string, period: string, average: string) => 
      `📚 ${childName} ${period}: Moyenne ${average}/20. Soutien nécessaire. Contactez prof. Bulletin prêt.`
  },

  // Online class notifications
  ONLINE_CLASS_SCHEDULED: {
    en: (childName: string, title: string, dateTime: string, teacher: string) => 
      `📹 ${childName}: Online class "${title}" scheduled for ${dateTime} with ${teacher}. Join via app.`,
    fr: (childName: string, title: string, dateTime: string, teacher: string) => 
      `📹 ${childName}: Cours en ligne "${title}" programmé pour ${dateTime} avec ${teacher}. Rejoignez via l'app.`
  },

  ONLINE_CLASS_STARTING: {
    en: (childName: string, title: string, teacher: string) => 
      `🔴 LIVE NOW: ${childName}'s online class "${title}" with ${teacher} has started! Join now via app.`,
    fr: (childName: string, title: string, teacher: string) => 
      `🔴 EN DIRECT: Cours "${title}" de ${childName} avec ${teacher} a commencé! Rejoignez via l'app.`
  },

  ONLINE_CLASS_STARTING_SOON: {
    en: (childName: string, title: string, minutes: string, teacher: string) => 
      `⏰ ${childName}: Online class "${title}" with ${teacher} starts in ${minutes} min. Get ready!`,
    fr: (childName: string, title: string, minutes: string, teacher: string) => 
      `⏰ ${childName}: Cours "${title}" avec ${teacher} commence dans ${minutes} min. Préparez-vous!`
  },

  ONLINE_CLASS_ENDED: {
    en: (childName: string, title: string, duration: string) => 
      `✅ ${childName}: Online class "${title}" completed (${duration}). Recording available if enabled.`,
    fr: (childName: string, title: string, duration: string) => 
      `✅ ${childName}: Cours "${title}" terminé (${duration}). Enregistrement disponible si activé.`
  }
};