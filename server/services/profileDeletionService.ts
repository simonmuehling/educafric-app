import { db } from '../db';
import { users, notifications, profileDeletionRequests, deletionEmailsLog } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { hostingerEmailService } from './hostingerMailService';
import { notificationService } from './notificationService';

interface ProfileDeletionResult {
  success: boolean;
  message: string;
  requestId?: number;
  error?: string;
}

class ProfileDeletionService {
  /**
   * Student requests profile deletion
   */
  async requestProfileDeletion(studentId: number, reason?: string): Promise<ProfileDeletionResult> {
    try {
      // Get student and parent info
      const student = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
      if (!student.length || student[0].role !== 'Student') {
        return { success: false, message: 'Étudiant non trouvé' };
      }

      // Find parent (assuming parent is linked via parent_children relationship)
      const parentConnections = await db.query.parentChildren.findMany({
        where: (parentChildren, { eq }) => eq(parentChildren.childId, studentId),
        with: { parent: true }
      });

      if (!parentConnections.length) {
        return { success: false, message: 'Parent non trouvé pour cet étudiant' };
      }

      const parentId = parentConnections[0].parentId;

      // Check if there's already a pending request
      const existingRequest = await db.select()
        .from(profileDeletionRequests)
        .where(and(
          eq(profileDeletionRequests.studentId, studentId),
          eq(profileDeletionRequests.status, 'pending')
        ))
        .limit(1);

      if (existingRequest.length > 0) {
        return { success: false, message: 'Une demande de suppression est déjà en cours' };
      }

      // Create deletion request
      const [deletionRequest] = await db.insert(profileDeletionRequests).values({
        studentId,
        parentId,
        reason: reason || 'Demande de suppression de profil',
        status: 'pending'
      }).returning();

      // Send notifications to parent
      await notificationService.createNotification({
        userId: parentId,
        userType: 'Parent',
        title: 'Demande de suppression de profil',
        message: `${student[0].firstName} ${student[0].lastName} souhaite supprimer son profil. Votre validation est requise.`,
        type: 'profile_deletion',
        priority: 'high',
        category: 'account',
        actionUrl: `/student/profile-deletion/${deletionRequest.id}`,
        actionText: 'Examiner la demande',
        actionRequired: true
      });

      // Send notification to student confirming request
      await notificationService.createNotification({
        userId: studentId,
        userType: 'Student',
        title: 'Demande de suppression envoyée',
        message: 'Votre demande de suppression de profil a été envoyée à vos parents pour validation.',
        type: 'profile_deletion',
        priority: 'medium',
        category: 'account'
      });

      // Send email to parent
      await this.sendDeletionRequestEmail(deletionRequest.id, parentId, student[0]);

      // Mark request as having notifications sent
      await db.update(profileDeletionRequests)
        .set({ notificationsSent: true })
        .where(eq(profileDeletionRequests.id, deletionRequest.id));

      return {
        success: true,
        message: 'Demande de suppression envoyée avec succès',
        requestId: deletionRequest.id
      };

    } catch (error) {
      console.error('[PROFILE_DELETION] Error requesting deletion:', error);
      return { success: false, message: 'Erreur lors de la demande de suppression', error: error.message };
    }
  }

  /**
   * Parent approves or rejects deletion request
   */
  async handleParentResponse(requestId: number, parentId: number, approved: boolean, rejectionReason?: string): Promise<ProfileDeletionResult> {
    try {
      const [request] = await db.select()
        .from(profileDeletionRequests)
        .where(and(
          eq(profileDeletionRequests.id, requestId),
          eq(profileDeletionRequests.parentId, parentId),
          eq(profileDeletionRequests.status, 'pending')
        ))
        .limit(1);

      if (!request) {
        return { success: false, message: 'Demande non trouvée ou déjà traitée' };
      }

      const student = await db.select().from(users).where(eq(users.id, request.studentId)).limit(1);
      const parent = await db.select().from(users).where(eq(users.id, parentId)).limit(1);

      if (approved) {
        // Approve deletion
        await db.update(profileDeletionRequests)
          .set({
            status: 'approved',
            approvedAt: new Date()
          })
          .where(eq(profileDeletionRequests.id, requestId));

        // Send approval notifications
        await notificationService.createNotification({
          userId: request.studentId,
          userType: 'Student',
          title: 'Suppression de profil approuvée',
          message: 'Vos parents ont approuvé la suppression de votre profil. Le processus sera finalisé sous peu.',
          type: 'profile_deletion',
          priority: 'high',
          category: 'account'
        });

        await notificationService.createNotification({
          userId: parentId,
          userType: 'Parent',
          title: 'Suppression de profil approuvée',
          message: `Vous avez approuvé la suppression du profil de ${student[0].firstName} ${student[0].lastName}.`,
          type: 'profile_deletion',
          priority: 'medium',
          category: 'account'
        });

        // Execute deletion
        await this.executeProfileDeletion(requestId);

        return { success: true, message: 'Suppression de profil approuvée et exécutée' };

      } else {
        // Reject deletion
        await db.update(profileDeletionRequests)
          .set({
            status: 'rejected',
            rejectedAt: new Date(),
            rejectionReason
          })
          .where(eq(profileDeletionRequests.id, requestId));

        // Send rejection notifications
        await notificationService.createNotification({
          userId: request.studentId,
          userType: 'Student',
          title: 'Demande de suppression refusée',
          message: `Vos parents ont refusé la suppression de votre profil. ${rejectionReason || ''}`,
          type: 'profile_deletion',
          priority: 'medium',
          category: 'account'
        });

        return { success: true, message: 'Demande de suppression refusée' };
      }

    } catch (error) {
      console.error('[PROFILE_DELETION] Error handling parent response:', error);
      return { success: false, message: 'Erreur lors du traitement de la réponse', error: error.message };
    }
  }

  /**
   * Execute the actual profile deletion
   */
  private async executeProfileDeletion(requestId: number): Promise<void> {
    try {
      const [request] = await db.select()
        .from(profileDeletionRequests)
        .where(eq(profileDeletionRequests.id, requestId))
        .limit(1);

      if (!request || request.status !== 'approved') {
        throw new Error('Demande non approuvée');
      }

      const student = await db.select().from(users).where(eq(users.id, request.studentId)).limit(1);
      const parent = await db.select().from(users).where(eq(users.id, request.parentId)).limit(1);

      // Send goodbye emails
      await this.sendGoodbyeEmails(requestId, student[0], parent[0]);

      // Mark user for deletion (soft delete for data integrity)
      await db.update(users)
        .set({
          deletionRequested: true,
          deletionRequestedAt: new Date(),
          deletionApprovedBy: request.parentId,
          deletionApprovedAt: new Date(),
          email: `deleted_${Date.now()}_${student[0].email}`, // Anonymize email
          password: 'DELETED_ACCOUNT', // Prevent login
          firstName: 'Compte',
          lastName: 'Supprimé'
        })
        .where(eq(users.id, request.studentId));

      // Update deletion request status
      await db.update(profileDeletionRequests)
        .set({
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(profileDeletionRequests.id, requestId));

      // Final notifications
      await notificationService.createNotification({
        userId: request.parentId,
        userType: 'Parent',
        title: 'Suppression de profil finalisée',
        message: `Le profil de ${student[0].firstName} ${student[0].lastName} a été supprimé avec succès.`,
        type: 'profile_deletion',
        priority: 'low',
        category: 'account'
      });

      console.log(`[PROFILE_DELETION] ✅ Profile deleted for student ${request.studentId}`);

    } catch (error) {
      console.error('[PROFILE_DELETION] Error executing deletion:', error);
      throw error;
    }
  }

  /**
   * Send deletion request email to parent
   */
  private async sendDeletionRequestEmail(requestId: number, parentId: number, student: any): Promise<void> {
    try {
      const subject = `🚨 Demande de suppression de profil - ${student.firstName} ${student.lastName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ DEMANDE DE SUPPRESSION</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50;">Demande de suppression de profil</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              <strong>${student.firstName} ${student.lastName}</strong> a demandé la suppression de son profil EDUCAFRIC.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Action requise</h3>
              <p style="margin-bottom: 0; color: #856404;">
                En tant que parent, votre validation est nécessaire pour finaliser cette suppression.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || 'https://educafric.com'}/student/profile-deletion/${requestId}" 
                 style="background: #0079f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Examiner la demande
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d;">
              Si vous n'avez pas demandé cette action, contactez-nous immédiatement.
            </p>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2025 EDUCAFRIC - Plateforme Éducative Africaine</p>
          </div>
        </div>
      `;

      await hostingerEmailService.sendEmail({
        to: await this.getParentEmail(parentId),
        subject,
        html
      });

      // Log email
      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: parentId,
        recipientType: 'parent',
        emailType: 'request',
        emailSent: true,
        sentAt: new Date()
      });

    } catch (error) {
      console.error('[PROFILE_DELETION] Error sending request email:', error);
      
      // Log failed email
      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: parentId,
        recipientType: 'parent',
        emailType: 'request',
        emailSent: false,
        errorMessage: error.message
      });
    }
  }

  /**
   * Send goodbye emails to both student and parent
   */
  private async sendGoodbyeEmails(requestId: number, student: any, parent: any): Promise<void> {
    // Send to student
    try {
      const studentSubject = `👋 Au revoir ${student.firstName} - EDUCAFRIC`;
      const studentHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #74b9ff, #0984e3); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">👋 Au revoir ${student.firstName}</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50;">Votre profil a été supprimé</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Nous confirmons la suppression de votre profil EDUCAFRIC suite à votre demande validée par vos parents.
            </p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">📝 Récapitulatif</h3>
              <ul style="color: #0c5460; margin-bottom: 0;">
                <li>Profil supprimé le: ${new Date().toLocaleDateString('fr-FR')}</li>
                <li>Validé par: Vos parents</li>
                <li>Toutes vos données ont été anonymisées</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Merci d'avoir fait partie de la communauté EDUCAFRIC. Nous espérons vous revoir bientôt !
            </p>
            
            <p style="font-size: 14px; color: #6c757d;">
              Pour toute question, contactez notre support à support@educafric.com
            </p>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2025 EDUCAFRIC - Plateforme Éducative Africaine</p>
          </div>
        </div>
      `;

      await hostingerEmailService.sendEmail({
        to: student.email,
        subject: studentSubject,
        html: studentHtml
      });

      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: student.id,
        recipientType: 'student',
        emailType: 'goodbye',
        emailSent: true,
        sentAt: new Date()
      });

    } catch (error) {
      console.error('[PROFILE_DELETION] Error sending student goodbye email:', error);
      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: student.id,
        recipientType: 'student',
        emailType: 'goodbye',
        emailSent: false,
        errorMessage: error.message
      });
    }

    // Send to parent
    try {
      const parentSubject = `✅ Suppression confirmée - ${student.firstName} ${student.lastName}`;
      const parentHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00b894, #00a085); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Suppression Confirmée</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50;">Profil supprimé avec succès</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Le profil de <strong>${student.firstName} ${student.lastName}</strong> a été supprimé avec succès de la plateforme EDUCAFRIC.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">📋 Détails de la suppression</h3>
              <ul style="color: #155724; margin-bottom: 0;">
                <li>Date de suppression: ${new Date().toLocaleDateString('fr-FR')}</li>
                <li>Demandé par: ${student.firstName} ${student.lastName}</li>
                <li>Validé par: Vous (parent)</li>
                <li>Statut: Suppression finalisée</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Toutes les données de l'étudiant ont été anonymisées conformément à nos politiques de confidentialité.
            </p>
            
            <p style="font-size: 14px; color: #6c757d;">
              Si vous souhaitez recréer un compte à l'avenir, n'hésitez pas à nous contacter.
            </p>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2025 EDUCAFRIC - Plateforme Éducative Africaine</p>
          </div>
        </div>
      `;

      const parentEmail = await this.getParentEmail(parent.id);
      await hostingerEmailService.sendEmail({
        to: parentEmail,
        subject: parentSubject,
        html: parentHtml
      });

      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: parent.id,
        recipientType: 'parent',
        emailType: 'goodbye',
        emailSent: true,
        sentAt: new Date()
      });

    } catch (error) {
      console.error('[PROFILE_DELETION] Error sending parent goodbye email:', error);
      await db.insert(deletionEmailsLog).values({
        deletionRequestId: requestId,
        recipientId: parent.id,
        recipientType: 'parent',
        emailType: 'goodbye',
        emailSent: false,
        errorMessage: error.message
      });
    }
  }

  /**
   * Get parent email
   */
  private async getParentEmail(parentId: number): Promise<string> {
    const [parent] = await db.select().from(users).where(eq(users.id, parentId)).limit(1);
    return parent?.email || '';
  }

  /**
   * Get all deletion requests for a parent
   */
  async getParentDeletionRequests(parentId: number) {
    return await db.query.profileDeletionRequests.findMany({
      where: (requests, { eq }) => eq(requests.parentId, parentId),
      with: {
        student: true
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)]
    });
  }

  /**
   * Get deletion request by ID
   */
  async getDeletionRequest(requestId: number) {
    return await db.query.profileDeletionRequests.findFirst({
      where: (requests, { eq }) => eq(requests.id, requestId),
      with: {
        student: true,
        parent: true
      }
    });
  }
}

export const profileDeletionService = new ProfileDeletionService();