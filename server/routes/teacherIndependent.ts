import { Router } from 'express';
import { db } from '../db';
import { 
  teacherIndependentActivations,
  teacherIndependentStudents,
  teacherIndependentSessions,
  teacherStudentInvitations,
  users
} from '../../shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { InvitationNotificationService } from '../services/invitationNotificationService';

const router = Router();

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Middleware to check teacher independent activation
async function requireIndependentActivation(req: any, res: any, next: any) {
  const user = req.user as any;
  
  if (user.role !== 'Teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher role required.'
    });
  }

  // Check if user has active independent activation
  const activation = await db
    .select()
    .from(teacherIndependentActivations)
    .where(
      and(
        eq(teacherIndependentActivations.teacherId, user.id),
        eq(teacherIndependentActivations.status, 'active'),
        gte(teacherIndependentActivations.endDate, new Date())
      )
    )
    .limit(1);

  if (activation.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Mode répétiteur indépendant non activé. Veuillez souscrire pour 25,000 CFA/an.',
      requiresActivation: true
    });
  }

  req.independentActivation = activation[0];
  next();
}

// Get teacher's independent activation status
router.get('/activation/status', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    const activation = await db
      .select()
      .from(teacherIndependentActivations)
      .where(eq(teacherIndependentActivations.teacherId, user.id))
      .orderBy(desc(teacherIndependentActivations.createdAt))
      .limit(1);

    if (activation.length === 0) {
      return res.json({
        success: true,
        hasActivation: false,
        message: 'Aucune activation répétiteur trouvée'
      });
    }

    const currentActivation = activation[0];
    const isActive = currentActivation.status === 'active' && new Date(currentActivation.endDate) > new Date();

    res.json({
      success: true,
      hasActivation: true,
      isActive,
      activation: {
        ...currentActivation,
        daysRemaining: Math.ceil((new Date(currentActivation.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching activation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'activation'
    });
  }
});

// Activate free trial (3 months)
router.post('/activation/free-trial', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle enseignant requis.'
      });
    }

    // Check if user already has an activation (free or paid)
    const existingActivation = await db
      .select()
      .from(teacherIndependentActivations)
      .where(eq(teacherIndependentActivations.teacherId, user.id))
      .limit(1);

    if (existingActivation.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà utilisé votre essai gratuit ou acheté une activation.'
      });
    }

    // Create 3-month free activation
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months from now

    const [activation] = await db.insert(teacherIndependentActivations).values({
      teacherId: user.id,
      durationType: 'trial',
      startDate,
      endDate,
      status: 'active',
      activatedBy: 'free_trial',
      paymentMethod: 'free',
      amountPaid: 0,
      notes: 'Essai gratuit de 3 mois'
    }).returning();

    // Update user's work_mode to hybrid
    if (user.workMode === 'school') {
      await db
        .update(users)
        .set({ workMode: 'hybrid' })
        .where(eq(users.id, user.id));
    }

    console.log(`[TEACHER_INDEPENDENT] ✅ Free trial activated for teacher ${user.id}`);

    res.json({
      success: true,
      message: 'Essai gratuit de 3 mois activé avec succès!',
      activation: {
        ...activation,
        daysRemaining: Math.ceil((new Date(activation.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error activating free trial:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'essai gratuit'
    });
  }
});

// Get teacher's independent students
router.get('/students', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    
    const students = await db
      .select({
        id: teacherIndependentStudents.id,
        studentId: teacherIndependentStudents.studentId,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
        subjects: teacherIndependentStudents.subjects,
        level: teacherIndependentStudents.level,
        objectives: teacherIndependentStudents.objectives,
        status: teacherIndependentStudents.status,
        connectionDate: teacherIndependentStudents.connectionDate,
        connectionMethod: teacherIndependentStudents.connectionMethod
      })
      .from(teacherIndependentStudents)
      .innerJoin(users, eq(teacherIndependentStudents.studentId, users.id))
      .where(
        and(
          eq(teacherIndependentStudents.teacherId, user.id),
          eq(teacherIndependentStudents.status, 'active')
        )
      );

    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants'
    });
  }
});

// Get teacher's independent sessions
router.get('/sessions', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    
    const sessions = await db
      .select({
        id: teacherIndependentSessions.id,
        title: teacherIndependentSessions.title,
        description: teacherIndependentSessions.description,
        subject: teacherIndependentSessions.subject,
        scheduledStart: teacherIndependentSessions.scheduledStart,
        scheduledEnd: teacherIndependentSessions.scheduledEnd,
        actualStart: teacherIndependentSessions.actualStart,
        actualEnd: teacherIndependentSessions.actualEnd,
        sessionType: teacherIndependentSessions.sessionType,
        location: teacherIndependentSessions.location,
        roomName: teacherIndependentSessions.roomName,
        meetingUrl: teacherIndependentSessions.meetingUrl,
        status: teacherIndependentSessions.status,
        teacherNotes: teacherIndependentSessions.teacherNotes,
        rating: teacherIndependentSessions.rating,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        createdAt: teacherIndependentSessions.createdAt
      })
      .from(teacherIndependentSessions)
      .innerJoin(users, eq(teacherIndependentSessions.studentId, users.id))
      .where(eq(teacherIndependentSessions.teacherId, user.id))
      .orderBy(teacherIndependentSessions.scheduledStart);

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions'
    });
  }
});

// Add a new independent student
router.post('/students', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    const { studentId, subjects, level, objectives } = req.body;

    if (!studentId || !subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and subjects are required'
      });
    }

    const [newStudent] = await db.insert(teacherIndependentStudents).values({
      teacherId: user.id,
      studentId,
      subjects,
      level,
      objectives,
      connectionMethod: 'teacher_invite',
      status: 'active'
    }).returning();

    res.json({
      success: true,
      student: newStudent
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'étudiant'
    });
  }
});

// Create a new independent session
router.post('/sessions', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    const {
      studentId,
      title,
      description,
      subject,
      scheduledStart,
      scheduledEnd,
      sessionType,
      location
    } = req.body;

    if (!studentId || !title || !subject || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const newSession = await db.insert(teacherIndependentSessions).values({
      teacherId: user.id,
      studentId,
      title,
      description,
      subject,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      sessionType: sessionType || 'online',
      location,
      status: 'scheduled'
    }).returning();

    res.json({
      success: true,
      session: newSession[0]
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session'
    });
  }
});

// Update session status
router.patch('/sessions/:id/status', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { status, actualStart, actualEnd, teacherNotes } = req.body;

    const updatedSession = await db
      .update(teacherIndependentSessions)
      .set({
        status,
        actualStart: actualStart ? new Date(actualStart) : undefined,
        actualEnd: actualEnd ? new Date(actualEnd) : undefined,
        teacherNotes,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(teacherIndependentSessions.id, parseInt(id)),
          eq(teacherIndependentSessions.teacherId, user.id)
        )
      )
      .returning();

    if (updatedSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    res.json({
      success: true,
      session: updatedSession[0]
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la session'
    });
  }
});

// Purchase activation - Create new activation for teacher
router.post('/purchase-activation', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { method, phoneNumber } = req.body;

    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent acheter une activation répétiteur'
      });
    }

    // Check if already has active activation
    const existingActivation = await db
      .select()
      .from(teacherIndependentActivations)
      .where(
        and(
          eq(teacherIndependentActivations.teacherId, user.id),
          eq(teacherIndependentActivations.status, 'active'),
          gte(teacherIndependentActivations.endDate, new Date())
        )
      )
      .limit(1);

    if (existingActivation.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une activation active'
      });
    }

    // Create activation (for now, simplified - payment will be integrated later)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now

    const newActivation = await db
      .insert(teacherIndependentActivations)
      .values({
        teacherId: user.id,
        durationType: 'yearly',
        startDate,
        endDate,
        status: 'active',
        activatedBy: 'self_purchase',
        paymentMethod: method,
        amountPaid: 25000,
        notes: `Achat via ${method === 'stripe' ? 'Stripe' : 'MTN Mobile Money'} ${phoneNumber ? `- Tel: ${phoneNumber}` : ''}`
      })
      .returning();

    // Update user's work_mode to independent if not already
    if (user.workMode === 'school') {
      await db
        .update(users)
        .set({ workMode: 'hybrid' })
        .where(eq(users.id, user.id));
    }

    res.json({
      success: true,
      activation: newActivation[0],
      message: 'Activation répétiteur réussie! Vous pouvez maintenant gérer vos cours privés.'
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error purchasing activation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'achat de l\'activation'
    });
  }
});

// ============= INVITATION ROUTES ============= 

// Create invitation (Teacher → Student/Parent)
router.post('/invitations', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;
    const { targetType, targetId, studentId, subjects, level, message, pricePerHour, pricePerSession } = req.body;

    // Validation
    if (!targetType || !targetId || !subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Type de cible, ID et matières requis'
      });
    }

    // Si targetType = parent, studentId est obligatoire
    if (targetType === 'parent' && !studentId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de l\'élève est requis pour une invitation parent'
      });
    }

    // Vérifier si invitation déjà existante et pending
    const existingInvitation = await db
      .select()
      .from(teacherStudentInvitations)
      .where(
        and(
          eq(teacherStudentInvitations.teacherId, user.id),
          eq(teacherStudentInvitations.targetId, targetId),
          eq(teacherStudentInvitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Une invitation est déjà en attente pour ce destinataire'
      });
    }

    // Créer l'invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours d'expiration

    const [invitation] = await db
      .insert(teacherStudentInvitations)
      .values({
        teacherId: user.id,
        targetType,
        targetId,
        studentId: targetType === 'parent' ? studentId : targetId,
        subjects,
        level,
        message,
        pricePerHour,
        pricePerSession,
        expiresAt
      })
      .returning();

    // Get recipient and student info for notification
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    let studentInfo = null;
    if (targetType === 'parent' && studentId) {
      const [student] = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId))
        .limit(1);
      studentInfo = student;
    }

    // Send notification
    if (recipient) {
      const notificationData = {
        teacherId: user.id,
        teacherName: `${user.firstName} ${user.lastName}`,
        teacherEmail: user.email,
        recipientId: recipient.id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientEmail: recipient.email,
        recipientPhone: recipient.whatsappE164,
        studentId: studentInfo?.id,
        studentName: studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : undefined,
        subjects,
        level,
        message,
        pricePerHour,
        pricePerSession,
        currency: 'XAF',
        language: recipient.preferredLanguage as 'fr' | 'en' || 'fr'
      };

      // Send notification asynchronously (don't wait for it)
      InvitationNotificationService.sendInvitationReceived(notificationData)
        .then(result => {
          console.log('[INVITATION] Notification sent:', result);
        })
        .catch(err => {
          console.error('[INVITATION] Notification failed:', err);
        });
    }

    res.json({
      success: true,
      invitation,
      message: 'Invitation envoyée avec succès'
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'invitation'
    });
  }
});

// Get teacher's sent invitations
router.get('/invitations', requireAuth, requireIndependentActivation, async (req, res) => {
  try {
    const user = req.user as any;

    const invitations = await db
      .select()
      .from(teacherStudentInvitations)
      .where(eq(teacherStudentInvitations.teacherId, user.id))
      .orderBy(desc(teacherStudentInvitations.createdAt));

    res.json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des invitations'
    });
  }
});

// Get invitations received by student/parent (with teacher and student names)
router.get('/invitations/received', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    const invitations = await db
      .select()
      .from(teacherStudentInvitations)
      .where(eq(teacherStudentInvitations.targetId, user.id))
      .orderBy(desc(teacherStudentInvitations.createdAt));

    // Enrich with teacher and student names
    const enrichedInvitations = await Promise.all(invitations.map(async (inv) => {
      const [teacher] = await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, inv.teacherId))
        .limit(1);

      let studentInfo = null;
      if (inv.studentId) {
        const [student] = await db
          .select({ firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, inv.studentId))
          .limit(1);
        studentInfo = student;
      }

      return {
        ...inv,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Inconnu',
        studentName: studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : null
      };
    }));

    res.json({
      success: true,
      invitations: enrichedInvitations
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching received invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des invitations reçues'
    });
  }
});

// Accept invitation (Student/Parent)
router.post('/invitations/:id/accept', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const invitationId = parseInt(req.params.id);
    const { responseMessage } = req.body;

    // Get invitation
    const [invitation] = await db
      .select()
      .from(teacherStudentInvitations)
      .where(eq(teacherStudentInvitations.id, invitationId))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation non trouvée'
      });
    }

    // Vérifier que c'est bien le destinataire
    if (invitation.targetId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accepter cette invitation'
      });
    }

    // Vérifier si invitation non expirée
    if (invitation.status !== 'pending' || (invitation.expiresAt && new Date(invitation.expiresAt) < new Date())) {
      return res.status(400).json({
        success: false,
        message: 'Cette invitation n\'est plus valide'
      });
    }

    // Update invitation status
    await db
      .update(teacherStudentInvitations)
      .set({
        status: 'accepted',
        responseMessage,
        respondedAt: new Date()
      })
      .where(eq(teacherStudentInvitations.id, invitationId));

    // Créer la connexion teacher-student
    await db
      .insert(teacherIndependentStudents)
      .values({
        teacherId: invitation.teacherId,
        studentId: invitation.studentId!,
        connectionMethod: invitation.targetType === 'parent' ? 'parent_accept' : 'student_accept',
        subjects: invitation.subjects,
        level: invitation.level,
        objectives: invitation.message || ''
      });

    // Get teacher info for notification
    const [teacher] = await db
      .select()
      .from(users)
      .where(eq(users.id, invitation.teacherId))
      .limit(1);

    // Send acceptance notification to teacher
    if (teacher) {
      const notificationData = {
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        recipientId: user.id,
        recipientName: `${user.firstName} ${user.lastName}`,
        recipientEmail: user.email,
        subjects: invitation.subjects || [],
        responseMessage,
        language: teacher.preferredLanguage as 'fr' | 'en' || 'fr'
      };

      // Send notification asynchronously
      InvitationNotificationService.sendInvitationAccepted(notificationData)
        .then(result => {
          console.log('[INVITATION] Acceptance notification sent:', result);
        })
        .catch(err => {
          console.error('[INVITATION] Acceptance notification failed:', err);
        });
    }

    res.json({
      success: true,
      message: 'Invitation acceptée avec succès'
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation de l\'invitation'
    });
  }
});

// Get sessions for parent's children (for Cours Privés de mes Enfants)
router.get('/parent/sessions', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    if (user.role !== 'Parent') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux parents'
      });
    }

    // Get parent's children
    const { parentStudentRelations, students } = await import('../../shared/schema');
    
    const childRelations = await db
      .select({
        studentId: parentStudentRelations.studentId
      })
      .from(parentStudentRelations)
      .where(eq(parentStudentRelations.parentId, user.id));

    const childIds = childRelations.map(r => r.studentId);

    if (childIds.length === 0) {
      return res.json({
        success: true,
        sessions: []
      });
    }

    // Get sessions for all children
    const { inArray } = await import('drizzle-orm');
    
    const sessions = await db
      .select({
        id: teacherIndependentSessions.id,
        title: teacherIndependentSessions.title,
        description: teacherIndependentSessions.description,
        subject: teacherIndependentSessions.subject,
        scheduledStart: teacherIndependentSessions.scheduledStart,
        scheduledEnd: teacherIndependentSessions.scheduledEnd,
        actualStart: teacherIndependentSessions.actualStart,
        actualEnd: teacherIndependentSessions.actualEnd,
        sessionType: teacherIndependentSessions.sessionType,
        location: teacherIndependentSessions.location,
        meetingUrl: teacherIndependentSessions.meetingUrl,
        status: teacherIndependentSessions.status,
        rating: teacherIndependentSessions.rating,
        studentId: teacherIndependentSessions.studentId,
        teacherId: teacherIndependentSessions.teacherId,
        createdAt: teacherIndependentSessions.createdAt
      })
      .from(teacherIndependentSessions)
      .where(inArray(teacherIndependentSessions.studentId, childIds))
      .orderBy(desc(teacherIndependentSessions.scheduledStart));

    // Get teacher and student names
    const enrichedSessions = await Promise.all(sessions.map(async (session) => {
      const [teacher] = await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, session.teacherId))
        .limit(1);

      const [student] = await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, session.studentId))
        .limit(1);

      return {
        ...session,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Inconnu',
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Inconnu'
      };
    }));

    res.json({
      success: true,
      sessions: enrichedSessions
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error fetching parent sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions'
    });
  }
});

// Reject invitation (Student/Parent)
router.post('/invitations/:id/reject', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const invitationId = parseInt(req.params.id);
    const { responseMessage } = req.body;

    // Get invitation
    const [invitation] = await db
      .select()
      .from(teacherStudentInvitations)
      .where(eq(teacherStudentInvitations.id, invitationId))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation non trouvée'
      });
    }

    // Vérifier que c'est bien le destinataire
    if (invitation.targetId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à rejeter cette invitation'
      });
    }

    // Update invitation status
    await db
      .update(teacherStudentInvitations)
      .set({
        status: 'rejected',
        responseMessage,
        respondedAt: new Date()
      })
      .where(eq(teacherStudentInvitations.id, invitationId));

    // Get teacher info for notification
    const [teacher] = await db
      .select()
      .from(users)
      .where(eq(users.id, invitation.teacherId))
      .limit(1);

    // Send rejection notification to teacher
    if (teacher) {
      const notificationData = {
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        recipientId: user.id,
        recipientName: `${user.firstName} ${user.lastName}`,
        recipientEmail: user.email,
        subjects: invitation.subjects || [],
        responseMessage,
        language: teacher.preferredLanguage as 'fr' | 'en' || 'fr'
      };

      // Send notification asynchronously
      InvitationNotificationService.sendInvitationRejected(notificationData)
        .then(result => {
          console.log('[INVITATION] Rejection notification sent:', result);
        })
        .catch(err => {
          console.error('[INVITATION] Rejection notification failed:', err);
        });
    }

    res.json({
      success: true,
      message: 'Invitation rejetée'
    });
  } catch (error) {
    console.error('[TEACHER_INDEPENDENT] Error rejecting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de l\'invitation'
    });
  }
});

export default router;
