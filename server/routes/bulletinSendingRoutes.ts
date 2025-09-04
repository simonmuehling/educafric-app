import express from 'express';
import { requireAuth } from '../auth';
import { db } from '../db';
import { bulletinSendings, signatures, users, students, parents } from '../../shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { NotificationService } from '../services/notificationService';

const router = express.Router();

// Envoyer des bulletins signés
router.post('/send-signed', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { userRole } = req.body;

    console.log(`[BULLETIN_SENDING] Starting signed bulletin sending for ${user.email} (${userRole})`);

    // Vérifier que l'utilisateur a une signature
    const [userSignature] = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.userId, user.id),
        eq(signatures.userRole, userRole),
        eq(signatures.isActive, true)
      ))
      .limit(1);

    if (!userSignature) {
      return res.status(400).json({
        success: false,
        message: 'No signature found. Please create a signature first.'
      });
    }

    // Récupérer tous les élèves de l'école
    const studentsData = await db.select({
      studentId: students.id,
      studentName: students.firstName,
      studentLastName: students.lastName,
      studentEmail: students.email,
      className: students.className,
      parentId: students.parentId
    })
    .from(students)
    .where(eq(students.schoolId, user.schoolId || 1));

    let sentCount = 0;
    const failedSendings = [];

    // Préparer le service de notification
    const notificationService = new NotificationService();

    for (const student of studentsData) {
      try {
        // Générer le bulletin signé (placeholder - intégration avec le générateur PDF)
        const bulletinData = {
          studentId: student.studentId,
          studentName: `${student.studentName} ${student.studentLastName}`,
          className: student.className,
          signatures: {
            [userRole]: userSignature.signatureData
          },
          generatedAt: new Date(),
          verificationCode: `EDU2024-${student.studentId}-${Date.now()}`
        };

        // Enregistrer l'envoi en base
        const [bulletinSending] = await db.insert(bulletinSendings)
          .values({
            studentId: student.studentId,
            signedByUserId: user.id,
            signatureRole: userRole,
            bulletinData: JSON.stringify(bulletinData),
            sentAt: new Date(),
            sentToStudent: !!student.studentEmail,
            sentToParent: !!student.parentId,
            verificationCode: bulletinData.verificationCode
          })
          .returning();

        // Envoyer par email/SMS à l'élève si email disponible
        if (student.studentEmail) {
          try {
            await notificationService.sendBulletinNotification({
              recipientEmail: student.studentEmail,
              recipientType: 'student',
              studentName: bulletinData.studentName,
              className: student.className,
              bulletinUrl: `/bulletins/view/${bulletinSending.id}`,
              verificationCode: bulletinData.verificationCode,
              language: 'fr'
            });
            console.log(`[BULLETIN_SENDING] ✅ Sent to student: ${student.studentEmail}`);
          } catch (emailError) {
            console.error(`[BULLETIN_SENDING] Failed to send to student ${student.studentEmail}:`, emailError);
          }
        }

        // Envoyer notification au parent si disponible
        if (student.parentId) {
          try {
            const [parent] = await db.select()
              .from(users)
              .where(eq(users.id, student.parentId))
              .limit(1);

            if (parent?.email) {
              await notificationService.sendBulletinNotification({
                recipientEmail: parent.email,
                recipientType: 'parent',
                studentName: bulletinData.studentName,
                className: student.className,
                bulletinUrl: `/bulletins/view/${bulletinSending.id}`,
                verificationCode: bulletinData.verificationCode,
                language: 'fr'
              });
              console.log(`[BULLETIN_SENDING] ✅ Sent to parent: ${parent.email}`);
            }
          } catch (parentError) {
            console.error(`[BULLETIN_SENDING] Failed to send to parent for student ${student.studentId}:`, parentError);
          }
        }

        sentCount++;

      } catch (error) {
        console.error(`[BULLETIN_SENDING] Failed to process student ${student.studentId}:`, error);
        failedSendings.push({
          studentId: student.studentId,
          studentName: `${student.studentName} ${student.studentLastName}`,
          error: error.message
        });
      }
    }

    console.log(`[BULLETIN_SENDING] ✅ Completed: ${sentCount} bulletins sent`);

    res.json({
      success: true,
      message: 'Bulletins sent successfully',
      sentCount,
      totalStudents: studentsData.length,
      failedSendings: failedSendings.length > 0 ? failedSendings : undefined
    });

  } catch (error) {
    console.error('[BULLETIN_SENDING] Error sending signed bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulletins'
    });
  }
});

// Récupérer l'historique des envois
router.get('/history', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    const sendings = await db.select({
      id: bulletinSendings.id,
      studentId: bulletinSendings.studentId,
      signatureRole: bulletinSendings.signatureRole,
      sentAt: bulletinSendings.sentAt,
      sentToStudent: bulletinSendings.sentToStudent,
      sentToParent: bulletinSendings.sentToParent,
      verificationCode: bulletinSendings.verificationCode
    })
    .from(bulletinSendings)
    .where(eq(bulletinSendings.signedByUserId, user.id))
    .orderBy(bulletinSendings.sentAt);

    res.json({
      success: true,
      sendings
    });

  } catch (error) {
    console.error('[BULLETIN_SENDING] Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sending history'
    });
  }
});

// Récupérer un bulletin spécifique pour affichage
router.get('/view/:sendingId', async (req, res) => {
  try {
    const { sendingId } = req.params;

    const [sending] = await db.select()
      .from(bulletinSendings)
      .where(eq(bulletinSendings.id, parseInt(sendingId)))
      .limit(1);

    if (!sending) {
      return res.status(404).json({
        success: false,
        message: 'Bulletin not found'
      });
    }

    res.json({
      success: true,
      bulletin: {
        id: sending.id,
        bulletinData: JSON.parse(sending.bulletinData),
        sentAt: sending.sentAt,
        verificationCode: sending.verificationCode
      }
    });

  } catch (error) {
    console.error('[BULLETIN_SENDING] Error fetching bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulletin'
    });
  }
});

export default router;