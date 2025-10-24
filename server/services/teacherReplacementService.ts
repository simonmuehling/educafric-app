// ===== TEACHER REPLACEMENT SERVICE =====
// Gestion automatisée des remplacements de professeurs absents

import { db } from '../db';
import { 
  teacherAbsencesEnhanced, 
  teacherReplacements,
  users,
  classes,
  subjects
} from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import WhatsAppDirectNotificationService from './whatsappDirectNotificationService';
import nodemailer from 'nodemailer';

class TeacherReplacementService {
  private whatsappService: WhatsAppDirectNotificationService;
  private emailTransporter: any;

  constructor() {
    this.whatsappService = WhatsAppDirectNotificationService.getInstance();
    this.emailTransporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com',
        pass: process.env.HOSTINGER_PASSWORD || process.env.EMAIL_PASSWORD
      }
    });
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com',
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('[ReplacementService] Error sending email:', error);
    }
  }

  // ===== CREATE TEACHER ABSENCE =====
  async createAbsence(data: any) {
    try {
      const [absence] = await db.insert(teacherAbsencesEnhanced).values(data).returning();
      
      // Auto-create replacement requests for affected classes
      if (data.affectedClasses && Array.isArray(data.affectedClasses)) {
        await this.createReplacementRequests(absence.id, absence.schoolId, absence.teacherId, data.affectedClasses);
      }

      // Send notifications to school administration
      await this.notifyAbsence(absence);

      return absence;
    } catch (error) {
      console.error('[ReplacementService] Error creating absence:', error);
      throw new Error('Failed to create teacher absence');
    }
  }

  // ===== CREATE REPLACEMENT REQUESTS =====
  private async createReplacementRequests(
    absenceId: number,
    schoolId: number,
    originalTeacherId: number,
    affectedClasses: Array<{classId: number; className: string; subjectId: number; subjectName: string; sessions?: Array<{date: string; time: string}>}>
  ) {
    try {
      for (const classInfo of affectedClasses) {
        const sessions = classInfo.sessions || [{date: new Date().toISOString(), time: 'TBD'}];
        
        for (const session of sessions) {
          await db.insert(teacherReplacements).values({
            absenceId,
            schoolId,
            originalTeacherId,
            replacementTeacherId: null,
            classId: classInfo.classId,
            subjectId: classInfo.subjectId,
            sessionDate: new Date(session.date),
            sessionTime: session.time,
            status: 'pending',
            notes: `Remplacement pour ${classInfo.className} - ${classInfo.subjectName}`
          });
        }
      }
    } catch (error) {
      console.error('[ReplacementService] Error creating replacement requests:', error);
    }
  }

  // ===== ASSIGN REPLACEMENT TEACHER =====
  async assignReplacement(replacementId: number, replacementTeacherId: number, assignedBy: number) {
    try {
      const [updated] = await db.update(teacherReplacements)
        .set({
          replacementTeacherId,
          assignedBy,
          assignedAt: new Date(),
          status: 'assigned',
          updatedAt: new Date()
        })
        .where(eq(teacherReplacements.id, replacementId))
        .returning();

      // Send notification to replacement teacher
      await this.notifyReplacementAssignment(updated);

      return updated;
    } catch (error) {
      console.error('[ReplacementService] Error assigning replacement:', error);
      throw new Error('Failed to assign replacement teacher');
    }
  }

  // ===== CONFIRM REPLACEMENT =====
  async confirmReplacement(replacementId: number, confirmedBy: number) {
    try {
      const [updated] = await db.update(teacherReplacements)
        .set({
          confirmedBy,
          confirmedAt: new Date(),
          status: 'confirmed',
          updatedAt: new Date()
        })
        .where(eq(teacherReplacements.id, replacementId))
        .returning();

      await this.notifyReplacementConfirmation(updated);
      return updated;
    } catch (error) {
      console.error('[ReplacementService] Error confirming replacement:', error);
      throw new Error('Failed to confirm replacement');
    }
  }

  // ===== GET PENDING REPLACEMENTS =====
  async getPendingReplacements(schoolId: number) {
    try {
      const pending = await db.select()
        .from(teacherReplacements)
        .where(
          and(
            eq(teacherReplacements.schoolId, schoolId),
            eq(teacherReplacements.status, 'pending')
          )
        )
        .orderBy(teacherReplacements.sessionDate);

      return pending;
    } catch (error) {
      console.error('[ReplacementService] Error getting pending replacements:', error);
      return [];
    }
  }

  // ===== GET ABSENCES WITH REPLACEMENTS =====
  async getAbsencesWithReplacements(schoolId: number) {
    try {
      const absences = await db.select()
        .from(teacherAbsencesEnhanced)
        .where(eq(teacherAbsencesEnhanced.schoolId, schoolId))
        .orderBy(sql`${teacherAbsencesEnhanced.startDate} DESC`);

      const result = [];

      for (const absence of absences) {
        const replacements = await db.select()
          .from(teacherReplacements)
          .where(eq(teacherReplacements.absenceId, absence.id));

        result.push({
          absence,
          replacements,
          affectedClassesCount: (absence.affectedClasses as any[])?.length || 0
        });
      }

      return result;
    } catch (error) {
      console.error('[ReplacementService] Error getting absences with replacements:', error);
      return [];
    }
  }

  // ===== NOTIFICATIONS =====

  private async notifyAbsence(absence: any) {
    try {
      const directors = await db.select()
        .from(users)
        .where(
          and(
            eq(users.schoolId, absence.schoolId),
            sql`${users.role} IN ('Director', 'Admin')`
          )
        );

      const message = `🚨 Absence Professeur\n\n` +
        `Un professeur a déclaré une absence:\n` +
        `📅 Du ${new Date(absence.startDate).toLocaleDateString('fr-FR')} au ${new Date(absence.endDate).toLocaleDateString('fr-FR')}\n` +
        `📝 Motif: ${absence.reason}\n` +
        `📊 Classes affectées: ${(absence.affectedClasses as any[])?.length || 0}\n\n` +
        `Veuillez assigner des remplacements.\n\n` +
        `📞 Support: +237 656 200 472`;

      for (const director of directors) {
        if (director.whatsappE164) {
          await this.whatsappService.sendMessage({
            recipientPhone: director.whatsappE164,
            notificationType: 'message',
            data: { message }
          });
        }

        if (director.email) {
          await this.sendEmail(
            director.email,
            `🚨 Absence Professeur - Action Requise`,
            `
              <h2>Absence Professeur Déclarée</h2>
              <p>Un professeur a déclaré une absence qui nécessite des remplacements.</p>
              <p><strong>Période:</strong> Du ${new Date(absence.startDate).toLocaleDateString('fr-FR')} au ${new Date(absence.endDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Motif:</strong> ${absence.reason}</p>
              <p><strong>Classes affectées:</strong> ${(absence.affectedClasses as any[])?.length || 0}</p>
              <p>Veuillez vous connecter pour assigner les remplacements nécessaires.</p>
              <hr>
              <p><small>Support Educafric: +237 656 200 472</small></p>
            `
          );
        }
      }
    } catch (error) {
      console.error('[ReplacementService] Error notifying absence:', error);
    }
  }

  private async notifyReplacementAssignment(replacement: any) {
    try {
      if (!replacement.replacementTeacherId) return;

      const [teacher] = await db.select()
        .from(users)
        .where(eq(users.id, replacement.replacementTeacherId));

      if (!teacher) return;

      const [classInfo] = await db.select()
        .from(classes)
        .where(eq(classes.id, replacement.classId));

      const [subjectInfo] = await db.select()
        .from(subjects)
        .where(eq(subjects.id, replacement.subjectId));

      const message = `📚 Nouveau Remplacement\n\n` +
        `Vous avez été assigné pour un remplacement:\n` +
        `📖 Matière: ${subjectInfo?.nameFr || subjectInfo?.nameEn || 'N/A'}\n` +
        `👥 Classe: ${classInfo?.name || 'N/A'}\n` +
        `📅 Date: ${new Date(replacement.sessionDate).toLocaleDateString('fr-FR')}\n` +
        `🕐 Horaire: ${replacement.sessionTime}\n\n` +
        `Merci de confirmer votre disponibilité.\n\n` +
        `📞 Support: +237 656 200 472`;

      if (teacher.whatsappE164) {
        await this.whatsappService.sendMessage({
          recipientPhone: teacher.whatsappE164,
          notificationType: 'message',
          data: { message }
        });
      }

      if (teacher.email) {
        await this.sendEmail(
          teacher.email,
          `📚 Nouveau Remplacement Assigné`,
          `
            <h2>Remplacement Assigné</h2>
            <p>Bonjour ${teacher.firstName} ${teacher.lastName},</p>
            <p>Vous avez été assigné pour un remplacement:</p>
            <ul>
              <li><strong>Matière:</strong> ${subjectInfo?.nameFr || subjectInfo?.nameEn || 'N/A'}</li>
              <li><strong>Classe:</strong> ${classInfo?.name || 'N/A'}</li>
              <li><strong>Date:</strong> ${new Date(replacement.sessionDate).toLocaleDateString('fr-FR')}</li>
              <li><strong>Horaire:</strong> ${replacement.sessionTime}</li>
            </ul>
            <p>Veuillez vous connecter pour confirmer votre disponibilité.</p>
            <hr>
            <p><small>Support Educafric: +237 656 200 472</small></p>
          `
        );
      }

      await db.update(teacherReplacements)
        .set({ notificationsSent: true })
        .where(eq(teacherReplacements.id, replacement.id));

    } catch (error) {
      console.error('[ReplacementService] Error notifying replacement assignment:', error);
    }
  }

  private async notifyReplacementConfirmation(replacement: any) {
    try {
      const directors = await db.select()
        .from(users)
        .where(
          and(
            eq(users.schoolId, replacement.schoolId),
            sql`${users.role} IN ('Director', 'Admin')`
          )
        );

      const [teacher] = await db.select()
        .from(users)
        .where(eq(users.id, replacement.replacementTeacherId));

      const [classInfo] = await db.select()
        .from(classes)
        .where(eq(classes.id, replacement.classId));

      const [subjectInfo] = await db.select()
        .from(subjects)
        .where(eq(subjects.id, replacement.subjectId));

      const message = `✅ Remplacement Confirmé\n\n` +
        `Le professeur ${teacher?.firstName} ${teacher?.lastName} a confirmé le remplacement:\n` +
        `📖 ${subjectInfo?.nameFr || subjectInfo?.nameEn || 'N/A'} - ${classInfo?.name || 'N/A'}\n` +
        `📅 ${new Date(replacement.sessionDate).toLocaleDateString('fr-FR')} à ${replacement.sessionTime}\n\n` +
        `📞 Support: +237 656 200 472`;

      for (const director of directors) {
        if (director.whatsappE164) {
          await this.whatsappService.sendMessage({
            recipientPhone: director.whatsappE164,
            notificationType: 'message',
            data: { message }
          });
        }
      }
    } catch (error) {
      console.error('[ReplacementService] Error notifying replacement confirmation:', error);
    }
  }
}

export const teacherReplacementService = new TeacherReplacementService();
