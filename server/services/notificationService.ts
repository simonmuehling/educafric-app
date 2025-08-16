import { User } from '@shared/schema';

// Consolidated Bilingual SMS Templates - Cost-efficient for African markets
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

  // Medical notifications
  MEDICAL_INCIDENT: {
    en: (childName: string, incident: string) => 
      `${childName}: ${incident}. Please collect from school nurse.`,
    fr: (childName: string, incident: string) => 
      `${childName}: ${incident}. Veuillez venir chercher à infirmerie.`
  },

  // General notifications
  SCHOOL_ANNOUNCEMENT: {
    en: (title: string, date: string) => 
      `School: ${title} - ${date}. Check app for details.`,
    fr: (title: string, date: string) => 
      `École: ${title} - ${date}. Vérifiez app pour détails.`
  },

  // Password Reset - Keep existing
  PASSWORD_RESET: {
    en: (code: string) => `Your Educafric password reset code: ${code}. Valid for 10 minutes.`,
    fr: (code: string) => `Votre code Educafric: ${code}. Valide 10 minutes.`
  },

  // Homework reminders
  HOMEWORK_REMINDER: {
    en: (childName: string, subject: string, dueDate: string) => 
      `${childName}: ${subject} homework due ${dueDate}. Check app.`,
    fr: (childName: string, subject: string, dueDate: string) => 
      `${childName}: Devoir ${subject} pour ${dueDate}. Voir app.`
  },

  // ========== GEOLOCATION & GPS TRACKING NOTIFICATIONS ==========
  
  // Safe Zone Notifications
  ZONE_ENTRY: {
    en: (childName: string, zoneName: string, time: string) => 
      `${childName} entered ${zoneName} at ${time}. Safe arrival confirmed.`,
    fr: (childName: string, zoneName: string, time: string) => 
      `${childName} est arrivé à ${zoneName} à ${time}. Arrivée confirmée.`
  },

  ZONE_EXIT: {
    en: (childName: string, zoneName: string, time: string) => 
      `${childName} left ${zoneName} at ${time}. Track location in app.`,
    fr: (childName: string, zoneName: string, time: string) => 
      `${childName} a quitté ${zoneName} à ${time}. Suivez dans app.`
  },

  // School Arrival/Departure
  SCHOOL_ARRIVAL: {
    en: (childName: string, schoolName: string, time: string) => 
      `${childName} arrived at ${schoolName} at ${time}. Attendance confirmed.`,
    fr: (childName: string, schoolName: string, time: string) => 
      `${childName} arrivé à ${schoolName} à ${time}. Présence confirmée.`
  },

  SCHOOL_DEPARTURE: {
    en: (childName: string, schoolName: string, time: string) => 
      `${childName} left ${schoolName} at ${time}. Pickup confirmed.`,
    fr: (childName: string, schoolName: string, time: string) => 
      `${childName} a quitté ${schoolName} à ${time}. Récupération confirmée.`
  },

  // Home Arrival/Departure  
  HOME_ARRIVAL: {
    en: (childName: string, time: string) => 
      `${childName} arrived home safely at ${time}.`,
    fr: (childName: string, time: string) => 
      `${childName} est rentré à la maison à ${time}.`
  },

  HOME_DEPARTURE: {
    en: (childName: string, time: string) => 
      `${childName} left home at ${time}. Journey started.`,
    fr: (childName: string, time: string) => 
      `${childName} a quitté la maison à ${time}. Trajet commencé.`
  },

  // Location Alerts
  LOCATION_ALERT: {
    en: (childName: string, location: string, time: string) => 
      `ALERT: ${childName} at unexpected location: ${location} at ${time}. Check app.`,
    fr: (childName: string, location: string, time: string) => 
      `ALERTE: ${childName} dans lieu inattendu: ${location} à ${time}. Voir app.`
  },

  SPEED_ALERT: {
    en: (childName: string, speed: string, location: string) => 
      `ALERT: ${childName} moving at ${speed} km/h near ${location}. Check safety.`,
    fr: (childName: string, speed: string, location: string) => 
      `ALERTE: ${childName} se déplace à ${speed} km/h près ${location}. Vérifier sécurité.`
  },

  // Device Status
  LOW_BATTERY: {
    en: (childName: string, deviceType: string, batteryLevel: string) => 
      `${childName}'s ${deviceType} battery: ${batteryLevel}%. Please charge device.`,
    fr: (childName: string, deviceType: string, batteryLevel: string) => 
      `Batterie ${deviceType} de ${childName}: ${batteryLevel}%. Rechargez appareil.`
  },

  DEVICE_OFFLINE: {
    en: (childName: string, deviceType: string, lastSeen: string) => 
      `${childName}'s ${deviceType} offline since ${lastSeen}. Check device.`,
    fr: (childName: string, deviceType: string, lastSeen: string) => 
      `${deviceType} de ${childName} hors ligne depuis ${lastSeen}. Vérifier appareil.`
  },

  GPS_DISABLED: {
    en: (childName: string, deviceType: string) => 
      `GPS disabled on ${childName}'s ${deviceType}. Please enable location services.`,
    fr: (childName: string, deviceType: string) => 
      `GPS désactivé sur ${deviceType} de ${childName}. Activez localisation.`
  },

  // Emergency Location
  PANIC_BUTTON: {
    en: (childName: string, location: string, time: string) => 
      `EMERGENCY: ${childName} activated panic button at ${location}, ${time}. Call immediately!`,
    fr: (childName: string, location: string, time: string) => 
      `URGENCE: ${childName} a activé alarme à ${location}, ${time}. Appelez immédiatement!`
  },

  SOS_LOCATION: {
    en: (childName: string, coordinates: string, address: string) => 
      `SOS: ${childName} needs help at ${address} (${coordinates}). Contact emergency services.`,
    fr: (childName: string, coordinates: string, address: string) => 
      `SOS: ${childName} a besoin d'aide à ${address} (${coordinates}). Contactez secours.`
  },

  // Safe Zone Management
  SAFE_ZONE_CREATED: {
    en: (zoneName: string, childName: string) => 
      `New safe zone "${zoneName}" created for ${childName}. Zone is now active.`,
    fr: (zoneName: string, childName: string) => 
      `Nouvelle zone de sécurité "${zoneName}" créée pour ${childName}. Zone maintenant active.`
  },

  SAFE_ZONE_UPDATED: {
    en: (zoneName: string, childName: string, changes: string) => 
      `Safe zone "${zoneName}" updated for ${childName}. Changes: ${changes}`,
    fr: (zoneName: string, childName: string, changes: string) => 
      `Zone "${zoneName}" modifiée pour ${childName}. Modifications: ${changes}`
  },

  SAFE_ZONE_DELETED: {
    en: (zoneName: string, childName: string) => 
      `Safe zone "${zoneName}" deleted for ${childName}. Zone no longer active.`,
    fr: (zoneName: string, childName: string) => 
      `Zone "${zoneName}" supprimée pour ${childName}. Zone plus active.`
  },

  // Zone Exit/Entry Alerts
  ZONE_EXIT_ALERT: {
    en: (childName: string, zoneName: string, time: string, location: string) => 
      `ALERT: ${childName} left safe zone "${zoneName}" at ${time}. Current location: ${location}`,
    fr: (childName: string, zoneName: string, time: string, location: string) => 
      `ALERTE: ${childName} a quitté la zone "${zoneName}" à ${time}. Position actuelle: ${location}`
  },

  ZONE_ENTRY_CONFIRMATION: {
    en: (childName: string, zoneName: string, time: string) => 
      `${childName} entered safe zone "${zoneName}" at ${time}. All is well.`,
    fr: (childName: string, zoneName: string, time: string) => 
      `${childName} est entré dans la zone "${zoneName}" à ${time}. Tout va bien.`
  },

  OUT_OF_ALL_ZONES: {
    en: (childName: string, currentLocation: string, time: string) => 
      `URGENT: ${childName} is outside all safe zones at ${currentLocation}, ${time}. Please check immediately!`,
    fr: (childName: string, currentLocation: string, time: string) => 
      `URGENT: ${childName} est hors de toutes zones de sécurité à ${currentLocation}, ${time}. Vérifiez immédiatement!`
  },

  EXTENDED_ABSENCE: {
    en: (childName: string, duration: string, lastKnownLocation: string) => 
      `${childName} has been outside safe zones for ${duration}. Last seen: ${lastKnownLocation}`,
    fr: (childName: string, duration: string, lastKnownLocation: string) => 
      `${childName} est hors zones de sécurité depuis ${duration}. Dernière position: ${lastKnownLocation}`
  },

  // ========== PARENT-CHILD CONNECTION NOTIFICATIONS ==========
  
  // Connection Request Notifications
  CONNECTION_REQUEST_SUBMITTED: {
    en: (parentName: string, studentName: string, relationshipType: string) => 
      `${parentName} requested to connect as ${relationshipType} to ${studentName}. Awaiting school approval.`,
    fr: (parentName: string, studentName: string, relationshipType: string) => 
      `${parentName} a demandé à se connecter comme ${relationshipType} à ${studentName}. En attente d'approbation école.`
  },

  CONNECTION_REQUEST_APPROVED: {
    en: (parentName: string, studentName: string, relationshipType: string) => 
      `Connection approved! ${parentName} is now connected as ${relationshipType} to ${studentName}.`,
    fr: (parentName: string, studentName: string, relationshipType: string) => 
      `Connexion approuvée! ${parentName} est maintenant connecté comme ${relationshipType} à ${studentName}.`
  },

  CONNECTION_REQUEST_REJECTED: {
    en: (parentName: string, studentName: string, reason?: string) => 
      `Connection request rejected for ${parentName} to ${studentName}. ${reason ? `Reason: ${reason}` : 'Contact school for details.'}`,
    fr: (parentName: string, studentName: string, reason?: string) => 
      `Demande de connexion rejetée pour ${parentName} à ${studentName}. ${reason ? `Raison: ${reason}` : 'Contactez école pour détails.'}`
  },

  CONNECTION_INVITATION_SENT: {
    en: (parentContact: string, studentName: string, schoolName: string) => 
      `Invitation sent to ${parentContact} to connect with ${studentName} at ${schoolName}.`,
    fr: (parentContact: string, studentName: string, schoolName: string) => 
      `Invitation envoyée à ${parentContact} pour se connecter à ${studentName} de ${schoolName}.`
  },

  CONNECTION_INVITATION_RECEIVED: {
    en: (schoolName: string, studentName: string, relationshipType: string) => 
      `${schoolName} invited you to connect as ${relationshipType} to ${studentName}. Please respond via the app.`,
    fr: (schoolName: string, studentName: string, relationshipType: string) => 
      `${schoolName} vous invite à vous connecter comme ${relationshipType} à ${studentName}. Répondez via l'app.`
  },

  MAX_PARENTS_REACHED: {
    en: (studentName: string, currentCount: number) => 
      `Cannot connect to ${studentName}. Maximum 2 parents/guardians already connected (${currentCount}/2).`,
    fr: (studentName: string, currentCount: number) => 
      `Impossible de se connecter à ${studentName}. Maximum 2 parents/tuteurs déjà connectés (${currentCount}/2).`
  },

  PARENT_CONNECTION_REMOVED: {
    en: (parentName: string, studentName: string, removedBy: string) => 
      `${parentName}'s connection to ${studentName} was removed by ${removedBy}.`,
    fr: (parentName: string, studentName: string, removedBy: string) => 
      `La connexion de ${parentName} à ${studentName} a été supprimée par ${removedBy}.`
  },

  DUPLICATE_CONNECTION_BLOCKED: {
    en: (parentName: string, studentName: string) => 
      `Duplicate connection blocked: ${parentName} is already connected to ${studentName}.`,
    fr: (parentName: string, studentName: string) => 
      `Connexion en double bloquée: ${parentName} est déjà connecté à ${studentName}.`
  }
};

// Email Templates - More detailed than SMS
export const EMAIL_TEMPLATES = {
  ATTENDANCE_REPORT: {
    en: {
      subject: (studentName: string) => `Attendance Update - ${studentName}`,
      html: (studentName: string, date: string, status: string, details: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d97706;">Attendance Notification</h2>
          <p>Dear Parent/Guardian,</p>
          <p>This is to inform you about your child's attendance:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Student:</strong> ${studentName}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>Status:</strong> ${status}<br>
            <strong>Details:</strong> ${details}
          </div>
          <p>If you have any questions, please contact the school.</p>
          <p>Best regards,<br>Educafric Team</p>
        </div>`
    },
    fr: {
      subject: (studentName: string) => `Mise à jour de présence - ${studentName}`,
      html: (studentName: string, date: string, status: string, details: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d97706;">Notification de Présence</h2>
          <p>Cher Parent/Tuteur,</p>
          <p>Ceci pour vous informer de la présence de votre enfant:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Étudiant:</strong> ${studentName}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>Statut:</strong> ${status}<br>
            <strong>Détails:</strong> ${details}
          </div>
          <p>Si vous avez des questions, veuillez contacter l'école.</p>
          <p>Cordialement,<br>Équipe Educafric</p>
        </div>`
    }
  }
};

// WhatsApp Templates - Brief but more interactive than SMS
export const WHATSAPP_TEMPLATES = {
  GRADE_UPDATE: {
    en: (studentName: string, subject: string, grade: string) => 
      `📚 *Grade Update*\n\n*Student:* ${studentName}\n*Subject:* ${subject}\n*Grade:* ${grade}\n\nView full report in Educafric app`,
    fr: (studentName: string, subject: string, grade: string) => 
      `📚 *Mise à jour Note*\n\n*Étudiant:* ${studentName}\n*Matière:* ${subject}\n*Note:* ${grade}\n\nVoir rapport complet dans app Educafric`
  },

  ABSENCE_ALERT: {
    en: (studentName: string, date: string) => 
      `⚠️ *Absence Alert*\n\n*Student:* ${studentName}\n*Date:* ${date}\n\nPlease confirm if this is expected or contact school.`,
    fr: (studentName: string, date: string) => 
      `⚠️ *Alerte Absence*\n\n*Étudiant:* ${studentName}\n*Date:* ${date}\n\nVeuillez confirmer si c'est prévu ou contactez école.`
  }
};

export interface NotificationData {
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  recipient: User;
  template: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  language: 'en' | 'fr';
}

export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send geolocation notifications to all concerned users
  async notifySafeZoneChange(
    action: 'created' | 'updated' | 'deleted',
    zoneData: {
      zoneName: string;
      childName: string;
      changes?: string[];
      parentId: number;
      childId: number;
      teacherIds?: number[];
      schoolId?: number;
    },
    language: 'en' | 'fr' = 'fr'
  ): Promise<void> {
    console.log(`[NOTIFICATION_SERVICE] 🔔 Sending safe zone ${action} notifications for ${zoneData.zoneName}`);

    const changes = zoneData.changes?.join(', ') || '';
    let template: string;
    let notificationTitle: string;
    let notificationMessage: string;

    // Determine template and notification content based on action
    switch (action) {
      case 'created':
        template = 'SAFE_ZONE_CREATED';
        notificationTitle = language === 'fr' ? 'Nouvelle zone de sécurité' : 'New Safe Zone';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](zoneData.zoneName, zoneData.childName);
        break;
      case 'updated':
        template = 'SAFE_ZONE_UPDATED';
        notificationTitle = language === 'fr' ? 'Zone de sécurité modifiée' : 'Safe Zone Updated';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](zoneData.zoneName, zoneData.childName, changes);
        break;
      case 'deleted':
        template = 'SAFE_ZONE_DELETED';
        notificationTitle = language === 'fr' ? 'Zone de sécurité supprimée' : 'Safe Zone Deleted';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](zoneData.zoneName, zoneData.childName);
        break;
      default:
        return;
    }

    // Create notification data for different user types
    const notifications = [
      {
        userId: zoneData.childId,
        userType: 'Student',
        title: notificationTitle,
        message: notificationMessage,
        type: `safe_zone_${action}`,
        priority: 'medium' as const,
        category: 'security'
      },
      {
        userId: zoneData.parentId,
        userType: 'Parent',
        title: notificationTitle,
        message: notificationMessage,
        type: `safe_zone_${action}`,
        priority: 'medium' as const,
        category: 'security'
      }
    ];

    // Add teacher notifications if provided
    if (zoneData.teacherIds && zoneData.teacherIds.length > 0) {
      zoneData.teacherIds.forEach(teacherId => {
        notifications.push({
          userId: teacherId,
          userType: 'Teacher',
          title: notificationTitle,
          message: `Zone modification for student ${zoneData.childName}: ${notificationMessage}`,
          type: `safe_zone_${action}`,
          priority: 'low' as const,
          category: 'security'
        });
      });
    }

    // Send notifications to all concerned users
    for (const notification of notifications) {
      await this.createNotification(notification);
    }

    console.log(`[NOTIFICATION_SERVICE] ✅ Sent ${notifications.length} notifications for safe zone ${action}`);
  }

  // Create a notification in the system
  async createNotification(notificationData: {
    userId: number;
    userType: string;
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    actionUrl?: string;
    actionText?: string;
  }): Promise<void> {
    console.log(`[NOTIFICATION_SERVICE] 📝 Creating notification for user ${notificationData.userId} (${notificationData.userType})`);
    
    // In a real implementation, this would store the notification in the database
    // For now, we'll just log it
    const notification = {
      ...notificationData,
      id: Date.now() + Math.random(),
      isRead: false,
      createdAt: new Date().toISOString(),
      actionRequired: !!notificationData.actionUrl
    };

    console.log(`[NOTIFICATION_SERVICE] ✅ Notification created:`, notification);
  }

  // Send zone exit/entry alerts
  async notifyZoneAlert(
    alertType: 'zone_exit' | 'zone_entry' | 'out_of_all_zones' | 'extended_absence',
    alertData: {
      childName: string;
      childId: number;
      parentId: number;
      zoneName?: string;
      currentLocation: string;
      time: string;
      duration?: string;
      teacherIds?: number[];
    },
    language: 'en' | 'fr' = 'fr'
  ): Promise<void> {
    console.log(`[NOTIFICATION_SERVICE] 🚨 Sending ${alertType} alert for ${alertData.childName}`);

    let template: string;
    let notificationTitle: string;
    let notificationMessage: string;
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    // Determine template and notification content based on alert type
    switch (alertType) {
      case 'zone_exit':
        template = 'ZONE_EXIT_ALERT';
        notificationTitle = language === 'fr' ? 'Sortie de zone de sécurité' : 'Left Safe Zone';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          alertData.childName, 
          alertData.zoneName || '', 
          alertData.time, 
          alertData.currentLocation
        );
        priority = 'high';
        break;
      case 'zone_entry':
        template = 'ZONE_ENTRY_CONFIRMATION';
        notificationTitle = language === 'fr' ? 'Entrée en zone de sécurité' : 'Entered Safe Zone';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          alertData.childName, 
          alertData.zoneName || '', 
          alertData.time
        );
        priority = 'low';
        break;
      case 'out_of_all_zones':
        template = 'OUT_OF_ALL_ZONES';
        notificationTitle = language === 'fr' ? '🚨 HORS DE TOUTES LES ZONES' : '🚨 OUTSIDE ALL ZONES';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          alertData.childName, 
          alertData.currentLocation, 
          alertData.time
        );
        priority = 'urgent';
        break;
      case 'extended_absence':
        template = 'EXTENDED_ABSENCE';
        notificationTitle = language === 'fr' ? 'Absence prolongée' : 'Extended Absence';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          alertData.childName, 
          alertData.duration || '', 
          alertData.currentLocation
        );
        priority = 'urgent';
        break;
      default:
        return;
    }

    // Create notification data for different user types
    const notifications = [
      {
        userId: alertData.parentId,
        userType: 'Parent',
        title: notificationTitle,
        message: notificationMessage,
        type: alertType,
        priority,
        category: 'security',
        actionUrl: alertType === 'out_of_all_zones' || alertType === 'zone_exit' ? '/geolocation' : undefined,
        actionText: alertType === 'out_of_all_zones' || alertType === 'zone_exit' ? 
          (language === 'fr' ? 'Voir position' : 'View Location') : undefined
      }
    ];

    // For urgent alerts, also notify the student
    if (alertType === 'out_of_all_zones' || alertType === 'zone_exit') {
      notifications.push({
        userId: alertData.childId,
        userType: 'Student',
        title: notificationTitle,
        message: language === 'fr' ? 
          'Vous êtes hors des zones de sécurité. Vos parents ont été informés.' :
          'You are outside safe zones. Your parents have been notified.',
        type: alertType,
        priority,
        category: 'security'
      });
    }

    // Add teacher notifications for urgent situations
    if ((alertType === 'out_of_all_zones' || alertType === 'extended_absence') && 
        alertData.teacherIds && alertData.teacherIds.length > 0) {
      alertData.teacherIds.forEach(teacherId => {
        notifications.push({
          userId: teacherId,
          userType: 'Teacher',
          title: notificationTitle,
          message: `Student safety alert: ${notificationMessage}`,
          type: alertType,
          priority,
          category: 'security'
        });
      });
    }

    // Send notifications to all concerned users
    for (const notification of notifications) {
      await this.createNotification(notification);
    }

    console.log(`[NOTIFICATION_SERVICE] 🚨 Sent ${notifications.length} ${alertType} alerts`);

    // Send SMS for urgent security alerts
    if (alertType === 'out_of_all_zones' || alertType === 'zone_exit' || alertType === 'extended_absence') {
      await this.sendSecuritySMS(alertData, notificationMessage, language);
    }

    // Send PWA push notifications
    await this.sendPWANotifications(notifications, alertType);
  }

  // Send SMS alerts for security incidents
  private async sendSecuritySMS(
    alertData: { parentId: number; childName: string; currentLocation: string },
    message: string,
    language: 'en' | 'fr'
  ): Promise<void> {
    try {
      console.log(`[SMS_ALERT] 📱 Sending security SMS for ${alertData.childName}`);
      
      // In a real implementation, you would:
      // 1. Get parent's phone number from database
      // 2. Send SMS via Vonage API
      // 3. Log SMS delivery status
      
      const smsData = {
        to: '+41768017000', // Owner's Swiss phone number
        from: 'EduAfric',
        text: `🚨 EDUCAFRIC SÉCURITÉ\n\n${message}\n\nConnectez-vous à l'app pour voir la position en temps réel.`
      };

      console.log(`[SMS_ALERT] ✅ Security SMS queued:`, smsData);
    } catch (error) {
      console.error(`[SMS_ALERT] ❌ Failed to send SMS:`, error);
    }
  }

  // ========== PARENT-CHILD CONNECTION NOTIFICATION METHODS ==========

  // Send connection request notifications to all concerned parties
  async notifyConnectionRequest(
    action: 'submitted' | 'approved' | 'rejected' | 'invitation_sent' | 'invitation_received' | 'removed' | 'max_reached' | 'duplicate_blocked',
    requestData: {
      parentName: string;
      parentId?: number;
      studentName: string;
      studentId: number;
      relationshipType?: string;
      schoolName?: string;
      schoolId?: number;
      directorId?: number;
      reason?: string;
      searchMethod?: 'email' | 'phone';
      contactInfo?: string;
      currentParentCount?: number;
      removedBy?: string;
    },
    language: 'en' | 'fr' = 'fr'
  ): Promise<void> {
    console.log(`[NOTIFICATION_SERVICE] 🔔 Sending connection ${action} notifications for ${requestData.parentName} -> ${requestData.studentName}`);

    let template: string;
    let notificationTitle: string;
    let notificationMessage: string;
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let category = 'connection';

    // Determine template and notification content based on action
    switch (action) {
      case 'submitted':
        template = 'CONNECTION_REQUEST_SUBMITTED';
        notificationTitle = language === 'fr' ? 'Nouvelle demande de connexion' : 'New Connection Request';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.parentName, 
          requestData.studentName, 
          requestData.relationshipType || 'parent'
        );
        priority = 'medium';
        break;
      case 'approved':
        template = 'CONNECTION_REQUEST_APPROVED';
        notificationTitle = language === 'fr' ? 'Connexion approuvée' : 'Connection Approved';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.parentName, 
          requestData.studentName, 
          requestData.relationshipType || 'parent'
        );
        priority = 'high';
        break;
      case 'rejected':
        template = 'CONNECTION_REQUEST_REJECTED';
        notificationTitle = language === 'fr' ? 'Connexion rejetée' : 'Connection Rejected';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.parentName, 
          requestData.studentName, 
          requestData.reason
        );
        priority = 'medium';
        break;
      case 'invitation_sent':
        template = 'CONNECTION_INVITATION_SENT';
        notificationTitle = language === 'fr' ? 'Invitation envoyée' : 'Invitation Sent';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.contactInfo || requestData.parentName, 
          requestData.studentName, 
          requestData.schoolName || 'School'
        );
        priority = 'low';
        break;
      case 'invitation_received':
        template = 'CONNECTION_INVITATION_RECEIVED';
        notificationTitle = language === 'fr' ? 'Invitation reçue' : 'Invitation Received';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.schoolName || 'School', 
          requestData.studentName, 
          requestData.relationshipType || 'parent'
        );
        priority = 'high';
        break;
      case 'max_reached':
        template = 'MAX_PARENTS_REACHED';
        notificationTitle = language === 'fr' ? '⚠️ Limite atteinte' : '⚠️ Limit Reached';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.studentName, 
          requestData.currentParentCount || 2
        );
        priority = 'medium';
        category = 'warning';
        break;
      case 'removed':
        template = 'PARENT_CONNECTION_REMOVED';
        notificationTitle = language === 'fr' ? 'Connexion supprimée' : 'Connection Removed';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.parentName, 
          requestData.studentName, 
          requestData.removedBy || 'Administrator'
        );
        priority = 'high';
        break;
      case 'duplicate_blocked':
        template = 'DUPLICATE_CONNECTION_BLOCKED';
        notificationTitle = language === 'fr' ? 'Connexion en double bloquée' : 'Duplicate Connection Blocked';
        notificationMessage = (SMS_TEMPLATES as any)[template][language](
          requestData.parentName, 
          requestData.studentName
        );
        priority = 'low';
        category = 'info';
        break;
      default:
        return;
    }

    // Create notification data for different user types
    const notifications = [];

    // Notify director/school admin for requests and approvals
    if (action === 'submitted' && requestData.directorId) {
      notifications.push({
        userId: requestData.directorId,
        userType: 'Director',
        title: notificationTitle,
        message: notificationMessage,
        type: `connection_${action}`,
        priority,
        category,
        actionUrl: '/director/connections',
        actionText: language === 'fr' ? 'Gérer demandes' : 'Manage Requests'
      });
    }

    // Notify parent for status updates
    if (requestData.parentId && ['approved', 'rejected', 'invitation_received', 'removed'].includes(action)) {
      notifications.push({
        userId: requestData.parentId,
        userType: 'Parent',
        title: notificationTitle,
        message: notificationMessage,
        type: `connection_${action}`,
        priority,
        category,
        actionUrl: action === 'approved' ? '/parent' : '/parent/connections',
        actionText: action === 'approved' ? 
          (language === 'fr' ? 'Voir enfant' : 'View Child') : 
          (language === 'fr' ? 'Voir connexions' : 'View Connections')
      });
    }

    // Notify student for connection changes
    if (['approved', 'removed'].includes(action)) {
      notifications.push({
        userId: requestData.studentId,
        userType: 'Student',
        title: notificationTitle,
        message: language === 'fr' ? 
          `Connexion parent mise à jour: ${notificationMessage}` :
          `Parent connection updated: ${notificationMessage}`,
        type: `connection_${action}`,
        priority: 'low',
        category,
        actionUrl: '/student/profile',
        actionText: language === 'fr' ? 'Voir profil' : 'View Profile'
      });
    }

    // Send notifications to all concerned users
    for (const notification of notifications) {
      await this.createNotification(notification);
    }

    // Send PWA push notifications
    if (notifications.length > 0) {
      await this.sendConnectionPWANotifications(notifications, action);
    }

    console.log(`[NOTIFICATION_SERVICE] ✅ Sent ${notifications.length} connection ${action} notifications`);
  }

  // Send PWA push notifications for connection requests
  private async sendConnectionPWANotifications(
    notifications: Array<{
      userId: number;
      userType: string;
      title: string;
      message: string;
      type: string;
      priority: string;
      category: string;
      actionUrl?: string;
      actionText?: string;
    }>,
    action: string
  ): Promise<void> {
    try {
      console.log(`[PWA_PUSH] 🔔 Sending connection PWA notifications for ${action}`);

      for (const notification of notifications) {
        // Determine icon based on action and user type
        let icon = '/educafric-logo-128.png';
        let badge = '/android-icon-192x192.png';
        
        if (notification.category === 'warning') {
          icon = '/icons/warning.png';
        } else if (notification.type.includes('approved')) {
          icon = '/icons/success.png';
        } else if (notification.type.includes('rejected')) {
          icon = '/icons/error.png';
        }

        const pushPayload = {
          title: notification.title,
          body: notification.message,
          icon,
          badge,
          tag: `connection-${notification.userId}-${Date.now()}`,
          requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
          actions: notification.actionUrl ? [
            {
              action: 'view_request',
              title: notification.actionText || 'Voir',
              icon: '/icons/view.png'
            },
            {
              action: 'dismiss',
              title: 'Fermer',
              icon: '/icons/close.png'
            }
          ] : undefined,
          data: {
            url: notification.actionUrl || '/',
            userId: notification.userId,
            type: notification.type,
            category: notification.category,
            timestamp: Date.now()
          }
        };

        console.log(`[PWA_PUSH] ✅ Connection PWA notification prepared for user ${notification.userId}:`, pushPayload);
      }
    } catch (error) {
      console.error(`[PWA_PUSH] ❌ Failed to send connection PWA notifications:`, error);
    }
  }

  // Send PWA push notifications
  private async sendPWANotifications(
    notifications: Array<{
      userId: number;
      userType: string;
      title: string;
      message: string;
      type: string;
      priority: string;
      category: string;
      actionUrl?: string;
      actionText?: string;
    }>,
    alertType: string
  ): Promise<void> {
    try {
      console.log(`[PWA_PUSH] 🔔 Sending PWA notifications for ${alertType}`);

      for (const notification of notifications) {
        // In a real implementation with service workers:
        // 1. Get user's push subscription from database
        // 2. Send push notification via web-push library
        // 3. Include action buttons for urgent alerts
        
        const pushPayload = {
          title: notification.title,
          body: notification.message,
          icon: '/educafric-logo-128.png',
          badge: '/android-icon-192x192.png',
          tag: `security-${notification.userId}-${Date.now()}`,
          requireInteraction: notification.priority === 'urgent',
          actions: notification.actionUrl ? [
            {
              action: 'view_location',
              title: notification.actionText || 'Voir position',
              icon: '/icons/location.png'
            },
            {
              action: 'dismiss',
              title: 'Fermer',
              icon: '/icons/close.png'
            }
          ] : undefined,
          data: {
            url: notification.actionUrl || '/',
            userId: notification.userId,
            type: notification.type,
            timestamp: Date.now()
          }
        };

        console.log(`[PWA_PUSH] ✅ PWA notification prepared for user ${notification.userId}:`, pushPayload);
      }
    } catch (error) {
      console.error(`[PWA_PUSH] ❌ Failed to send PWA notifications:`, error);
    }
  }

  // Consolidated notification sending
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      switch (notification.type) {
        case 'sms':
          return await this.sendSMS(notification);
        case 'email':
          return await this.sendEmail(notification);
        case 'whatsapp':
          return await this.sendWhatsApp(notification);
        case 'push':
          return await this.sendPushNotification(notification);
        default:
          console.error(`Unknown notification type: ${notification.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Notification send error:`, error);
      return false;
    }
  }

  // Send multiple notifications efficiently
  async sendBatch(notifications: NotificationData[]): Promise<boolean[]> {
    const promises = notifications.map(notification => this.sendNotification(notification));
    return Promise.all(promises);
  }

  // Smart notification routing based on priority and user preferences
  async sendSmartNotification(
    user: User,
    templateKey: string,
    data: Record<string, any>,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<boolean[]> {
    const language = user.preferredLanguage || 'en';
    const notifications: NotificationData[] = [];

    // Always send push notifications
    notifications.push({
      type: 'push',
      recipient: user,
      template: templateKey,
      data,
      priority,
      language: language as 'en' | 'fr'
    });

    // Send SMS for high priority or urgent notifications
    if (priority === 'high' || priority === 'urgent') {
      if (user.phone) {
        notifications.push({
          type: 'sms',
          recipient: user,
          template: templateKey,
          data,
          priority,
          language: language as 'en' | 'fr'
        });
      }
    }

    // Send WhatsApp for urgent notifications if available
    if (priority === 'urgent' && user.whatsappNumber) {
      notifications.push({
        type: 'whatsapp',
        recipient: user,
        template: templateKey,
        data,
        priority,
        language: language as 'en' | 'fr'
      });
    }

    // Send email for detailed notifications
    if (priority !== 'low' && user.email) {
      notifications.push({
        type: 'email',
        recipient: user,
        template: templateKey,
        data,
        priority,
        language: language as 'en' | 'fr'
      });
    }

    return this.sendBatch(notifications);
  }

  private async sendSMS(notification: NotificationData): Promise<boolean> {
    if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
      console.warn('Vonage credentials not configured');
      return false;
    }

    try {
      // Import Vonage dynamically to avoid startup errors if not configured
      const { Vonage } = await import('@vonage/server-sdk');
      
      const vonage = new Vonage({
        apiKey: process.env.VONAGE_API_KEY!,
        apiSecret: process.env.VONAGE_API_SECRET!,
      });

      const template = SMS_TEMPLATES[notification.template as keyof typeof SMS_TEMPLATES];
      if (!template) {
        console.error(`SMS template not found: ${notification.template}`);
        console.log('Available templates:', Object.keys(SMS_TEMPLATES));
        return false;
      }

      // Get the template function for the language
      const templateFn = template[notification.language as 'en' | 'fr'];
      if (!templateFn) {
        console.error(`Template function not found for language: ${notification.language}`);
        return false;
      }

      // Build message with proper parameters  
      const dataValues = Object.values(notification.data);
      const message = templateFn(...dataValues as any);
      
      const response = await vonage.sms.send({
        to: notification.recipient.phone!,
        from: 'Educafric',
        text: message
      });

      console.log(`SMS sent to ${notification.recipient.phone}: ${message.slice(0, 50)}...`);
      return response.messages[0].status === '0';
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  private async sendEmail(notification: NotificationData): Promise<boolean> {
    // Email implementation would go here
    // For now, just log the email content
    console.log(`Email notification sent to ${notification.recipient.email}`);
    return true;
  }

  private async sendWhatsApp(notification: NotificationData): Promise<boolean> {
    // WhatsApp Business API implementation would go here
    // For now, just log the WhatsApp content
    console.log(`WhatsApp notification sent to ${notification.recipient.whatsappNumber}`);
    return true;
  }

  private async sendPushNotification(notification: NotificationData): Promise<boolean> {
    // Push notification implementation would go here
    // For now, just log the push notification
    console.log(`Push notification sent to user ${notification.recipient.id}`);
    return true;
  }

  // Helper methods for common notification scenarios
  async notifyAttendance(
    parent: User,
    studentName: string,
    status: 'absent' | 'late',
    details: { date: string; time?: string }
  ): Promise<boolean[]> {
    const templateKey = status === 'absent' ? 'ABSENT' : 'LATE';
    const data = status === 'absent' 
      ? { studentName, date: details.date }
      : { studentName, time: details.time };

    return this.sendSmartNotification(parent, templateKey, data, 'high');
  }

  async notifyGrade(
    parent: User,
    studentName: string,
    subject: string,
    grade: string,
    isLowGrade: boolean = false
  ): Promise<boolean[]> {
    const templateKey = isLowGrade ? 'LOW_GRADE' : 'NEW_GRADE';
    const priority = isLowGrade ? 'high' : 'normal';
    
    return this.sendSmartNotification(
      parent, 
      templateKey, 
      { studentName, subject, grade }, 
      priority
    );
  }

  async notifyPayment(
    parent: User,
    amount: string,
    type: 'due' | 'received',
    dueDate?: string
  ): Promise<boolean[]> {
    const templateKey = type === 'due' ? 'PAYMENT_DUE' : 'PAYMENT_RECEIVED';
    const data = type === 'due' 
      ? { amount, dueDate } 
      : { amount };

    return this.sendSmartNotification(parent, templateKey, data, 'high');
  }

  async notifyEmergency(
    users: User[],
    message: string
  ): Promise<boolean[][]> {
    const promises = users.map(user => 
      this.sendSmartNotification(user, 'EMERGENCY', { message }, 'urgent')
    );
    
    return Promise.all(promises);
  }
}

export default NotificationService.getInstance();