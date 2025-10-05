/**
 * WhatsApp Message Templates (Bilingual: French/English)
 * Used for Click-to-Chat prefilled messages
 */

export interface MessageTemplate {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const WA_TEMPLATES: MessageTemplate = {
  // Parent templates
  payment_due: {
    fr: "Bonjour {parent_name}, les frais scolaires de {student_name} ({term}) sont dus le {due_date}. Réf : {invoice_no}.",
    en: "Hello {parent_name}, your school fee for {student_name} ({term}) is due on {due_date}. Ref: {invoice_no}."
  },
  payment_reminder: {
    fr: "Rappel : Paiement en attente pour {student_name}. Montant : {amount} FCFA. Échéance : {due_date}.",
    en: "Reminder: Payment pending for {student_name}. Amount: {amount} FCFA. Due: {due_date}."
  },
  grade_available: {
    fr: "Les notes de {student_name} pour {subject} sont disponibles. Moyenne : {average}/20. Consultez le portail.",
    en: "{student_name}'s grades for {subject} are available. Average: {average}/20. Check portal."
  },
  bulletin_ready: {
    fr: "Le bulletin de {student_name} ({term}) est prêt. Téléchargez-le sur le portail Educafric.",
    en: "{student_name}'s report card ({term}) is ready. Download it from Educafric portal."
  },
  absence_alert: {
    fr: "Alerte : {student_name} était absent(e) le {date}. Motif : {reason}.",
    en: "Alert: {student_name} was absent on {date}. Reason: {reason}."
  },

  // Teacher templates
  class_reminder: {
    fr: "Rappel : {class_name} commence à {start_time}. Salle {room}.",
    en: "Reminder: {class_name} starts at {start_time}. Room {room}."
  },
  grade_submission_due: {
    fr: "Les notes pour {class_name} ({subject}) doivent être soumises avant le {due_date}.",
    en: "Grades for {class_name} ({subject}) are due by {due_date}."
  },
  student_performance: {
    fr: "{student_name} a obtenu {grade}/20 en {subject}. Commentaire : {comment}.",
    en: "{student_name} scored {grade}/20 in {subject}. Comment: {comment}."
  },

  // Student templates
  homework: {
    fr: "{student_name}, tes devoirs de {subject} sont à rendre le {due_date}. Détails sur le portail.",
    en: "{student_name}, your homework for {subject} is due {due_date}. Details in portal."
  },
  exam_reminder: {
    fr: "Rappel : Examen de {subject} le {exam_date} à {exam_time}. Salle {room}.",
    en: "Reminder: {subject} exam on {exam_date} at {exam_time}. Room {room}."
  },
  grade_notification: {
    fr: "Ta note en {subject} : {grade}/20. Moyenne de classe : {class_average}/20.",
    en: "Your {subject} grade: {grade}/20. Class average: {class_average}/20."
  },

  // School admin templates
  low_attendance: {
    fr: "Alerte : la présence est passée sous {threshold}% pour {class_name} cette semaine.",
    en: "Alert: Attendance dropped below {threshold}% for {class_name} this week."
  },
  teacher_absence: {
    fr: "{teacher_name} est absent(e) aujourd'hui. Classe {class_name} - Remplacement assigné.",
    en: "{teacher_name} is absent today. Class {class_name} - Substitute assigned."
  },
  school_announcement: {
    fr: "Annonce importante : {announcement_text}. Date : {date}.",
    en: "Important announcement: {announcement_text}. Date: {date}."
  },

  // General support
  contact_support: {
    fr: "Bonjour, j'ai besoin d'aide concernant {issue_type}. Merci.",
    en: "Hello, I need help with {issue_type}. Thank you."
  },
  portal_access: {
    fr: "Problème de connexion au portail Educafric. Email : {user_email}.",
    en: "Educafric portal login issue. Email: {user_email}."
  }
};

export function renderTemplate(templateId: string, lang: 'fr' | 'en', data: Record<string, any>): string {
  const template = WA_TEMPLATES[templateId]?.[lang];
  if (!template) {
    throw new Error(`Template not found: ${templateId} (${lang})`);
  }
  
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return data?.[key] ?? `{${key}}`;
  });
}
