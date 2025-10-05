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
  },
  
  // Password reset via WhatsApp
  password_reset: {
    fr: "🔐 Réinitialisation de mot de passe Educafric\n\nBonjour {user_name},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\n✅ Cliquez sur ce lien pour réinitialiser : {reset_link}\n\n⏰ Ce lien expire dans 1 heure.\n\n❌ Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.\n\n— Équipe Educafric",
    en: "🔐 Educafric Password Reset\n\nHello {user_name},\n\nYou requested a password reset.\n\n✅ Click this link to reset: {reset_link}\n\n⏰ This link expires in 1 hour.\n\n❌ If you didn't request this, ignore this message.\n\n— Educafric Team"
  },

  // ========== GEOLOCATION ALERTS ==========
  
  geolocation_zone_exit: {
    fr: "⚠️ ALERTE GÉOLOCALISATION\n\n{student_name} est sorti(e) de la zone de sécurité \"{zone_name}\" à {time}.\n\n📍 Position actuelle : {location_url}\n\n🔗 Voir sur Educafric : {portal_link}\n\n— Système de sécurité Educafric",
    en: "⚠️ GEOLOCATION ALERT\n\n{student_name} exited the safe zone \"{zone_name}\" at {time}.\n\n📍 Current position: {location_url}\n\n🔗 View on Educafric: {portal_link}\n\n— Educafric Security System"
  },

  geolocation_zone_entry: {
    fr: "✅ NOTIFICATION GÉOLOCALISATION\n\n{student_name} est entré(e) dans la zone \"{zone_name}\" à {time}.\n\n📍 Position : {location_url}\n\n🔗 Voir sur Educafric : {portal_link}\n\n— Système de sécurité Educafric",
    en: "✅ GEOLOCATION NOTIFICATION\n\n{student_name} entered zone \"{zone_name}\" at {time}.\n\n📍 Position: {location_url}\n\n🔗 View on Educafric: {portal_link}\n\n— Educafric Security System"
  },

  geolocation_emergency: {
    fr: "🚨 ALERTE URGENCE !\n\n{student_name} a activé le bouton d'urgence à {time}.\n\n📍 Position d'urgence : {location_url}\n\n🔗 Agir immédiatement : {portal_link}\n\n⚠️ CONTACTER LES AUTORITÉS SI NÉCESSAIRE\n\n— Système d'urgence Educafric",
    en: "🚨 EMERGENCY ALERT!\n\n{student_name} activated the emergency button at {time}.\n\n📍 Emergency position: {location_url}\n\n🔗 Take action immediately: {portal_link}\n\n⚠️ CONTACT AUTHORITIES IF NECESSARY\n\n— Educafric Emergency System"
  },

  geolocation_low_battery: {
    fr: "🔋 ALERTE BATTERIE FAIBLE\n\n{student_name} - Dispositif GPS : batterie à {battery_level}%.\n\n📍 Dernière position connue : {location_url}\n\n⚠️ Rechargez le dispositif rapidement.\n\n— Système de sécurité Educafric",
    en: "🔋 LOW BATTERY ALERT\n\n{student_name} - GPS Device: battery at {battery_level}%.\n\n📍 Last known position: {location_url}\n\n⚠️ Recharge the device quickly.\n\n— Educafric Security System"
  },

  geolocation_offline: {
    fr: "📡 ALERTE CONNEXION\n\n{student_name} - Dispositif GPS hors ligne depuis {duration}.\n\n📍 Dernière position : {location_url} ({last_update})\n\n🔗 Vérifier sur Educafric : {portal_link}\n\n— Système de sécurité Educafric",
    en: "📡 CONNECTION ALERT\n\n{student_name} - GPS Device offline for {duration}.\n\n📍 Last position: {location_url} ({last_update})\n\n🔗 Check on Educafric: {portal_link}\n\n— Educafric Security System"
  },

  // ========== MESSAGING NOTIFICATIONS ==========

  new_message: {
    fr: "💬 NOUVEAU MESSAGE\n\nVous avez reçu un message de {sender_name} ({sender_role}).\n\n📄 Aperçu : \"{message_preview}...\"\n\n🔗 Lire le message complet : {portal_link}\n\n— Messagerie Educafric",
    en: "💬 NEW MESSAGE\n\nYou received a message from {sender_name} ({sender_role}).\n\n📄 Preview: \"{message_preview}...\"\n\n🔗 Read full message: {portal_link}\n\n— Educafric Messaging"
  },

  urgent_message: {
    fr: "🚨 MESSAGE URGENT !\n\nMessage urgent de {sender_name} ({sender_role}).\n\n📄 \"{message_preview}...\"\n\n🔗 Répondre immédiatement : {portal_link}\n\n⚠️ Nécessite votre attention\n\n— Messagerie Educafric",
    en: "🚨 URGENT MESSAGE!\n\nUrgent message from {sender_name} ({sender_role}).\n\n📄 \"{message_preview}...\"\n\n🔗 Reply immediately: {portal_link}\n\n⚠️ Requires your attention\n\n— Educafric Messaging"
  },

  message_homework: {
    fr: "📚 DEVOIRS ASSIGNÉS\n\n{teacher_name} a envoyé des devoirs pour {subject}.\n\n📄 Détails : \"{message_preview}...\"\n📅 À rendre le : {due_date}\n\n🔗 Voir les devoirs : {portal_link}\n\n— Educafric",
    en: "📚 HOMEWORK ASSIGNED\n\n{teacher_name} sent homework for {subject}.\n\n📄 Details: \"{message_preview}...\"\n📅 Due date: {due_date}\n\n🔗 View homework: {portal_link}\n\n— Educafric"
  },

  message_with_attachment: {
    fr: "📎 NOUVEAU MESSAGE AVEC FICHIER\n\n{sender_name} ({sender_role}) vous a envoyé un message avec {attachment_count} fichier(s).\n\n📄 Message : \"{message_preview}...\"\n\n🔗 Ouvrir et télécharger : {portal_link}\n\n— Messagerie Educafric",
    en: "📎 NEW MESSAGE WITH FILE\n\n{sender_name} ({sender_role}) sent you a message with {attachment_count} file(s).\n\n📄 Message: \"{message_preview}...\"\n\n🔗 Open and download: {portal_link}\n\n— Educafric Messaging"
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
