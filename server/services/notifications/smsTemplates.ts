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
  }
};