import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Middleware pour vérifier l'authentification
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Schema de validation pour la création d'une connexion enseignant-élève
const createTeacherStudentConnectionSchema = z.object({
  studentEmail: z.string().email('Email invalide').optional(),
  studentPhone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  subjectArea: z.string().min(1, 'Matière requise'),
  classContext: z.string().optional(),
  connectionType: z.enum(['educational', 'tutoring', 'mentoring']).default('educational'),
  educationalGoals: z.array(z.string()).optional()
}).refine(data => data.studentEmail || data.studentPhone, {
  message: 'Email ou numéro de téléphone de l\'élève requis'
});

// Schema de validation pour l'envoi de message
const sendTeacherStudentMessageSchema = z.object({
  connectionId: z.number(),
  message: z.string().min(1, 'Message ne peut pas être vide').max(2000, 'Message trop long'),
  messageType: z.enum(['text', 'image', 'audio', 'location', 'file', 'homework', 'grade_feedback']).default('text'),
  parentCcEnabled: z.boolean().default(false),
  homeworkDetails: z.object({
    title: z.string(),
    description: z.string(),
    dueDate: z.string(),
    subject: z.string()
  }).optional(),
  gradeDetails: z.object({
    grade: z.number(),
    maxGrade: z.number(),
    subject: z.string(),
    feedback: z.string()
  }).optional()
});

// POST /api/teacher-student/search-students - Rechercher des élèves par email/téléphone
router.post('/search-students', requireAuth, async (req: any, res: any) => {
  try {
    const { searchValue, searchType } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Teacher' && userRole !== 'Freelancer') {
      return res.status(403).json({ error: 'Seuls les enseignants peuvent rechercher des élèves' });
    }
    
    if (!searchValue || !searchType) {
      return res.status(400).json({ error: 'Valeur de recherche et type requis' });
    }

    console.log('[TEACHER_STUDENT_SEARCH] Searching students:', { searchValue, searchType, userId });

    let users = [];

    if (searchType === 'phone' && searchValue.length >= 10) {
      users = await storage.searchUsersByPhone(searchValue);
    } else if (searchType === 'email' && searchValue.includes('@') && searchValue.includes('.') && searchValue.length > 5) {
      users = await storage.searchUsersByEmail(searchValue);
    }

    // Filtrer pour ne retourner que les étudiants et exclure l'utilisateur actuel
    const students = users.filter((user: any) => 
      user.role === 'Student' && 
      user.id !== userId
    );

    res.json({ users: students });
  } catch (error) {
    console.error('[TEACHER_STUDENT_SEARCH] Error searching students:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// GET /api/teacher-student/connections - Récupérer les connexions enseignant-élève
router.get('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('[TEACHER_STUDENT_CONNECTIONS] Getting connections for user:', { userId, userRole });

    let connections = [];
    
    if (userRole === 'Teacher' || userRole === 'Freelancer') {
      connections = await storage.getTeacherStudentConnections(userId, 'teacher');
    } else if (userRole === 'Student') {
      connections = await storage.getTeacherStudentConnections(userId, 'student');
    } else {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ success: true, data: connections });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error getting connections:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des connexions' });
  }
});

// POST /api/teacher-student/connections - Créer une nouvelle connexion enseignant-élève
router.post('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Teacher' && userRole !== 'Freelancer') {
      return res.status(403).json({ error: 'Seuls les enseignants peuvent créer des connexions' });
    }

    const validationResult = createTeacherStudentConnectionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      });
    }

    const { studentEmail, studentPhone, subjectArea, classContext, connectionType, educationalGoals } = validationResult.data;

    console.log('[TEACHER_STUDENT_CONNECTIONS] Creating connection:', { 
      teacherId: userId, 
      studentEmail, 
      studentPhone, 
      subjectArea,
      connectionType 
    });

    const connection = await storage.createTeacherStudentConnection({
      teacherId: userId,
      studentEmail,
      studentPhone,
      subjectArea,
      classContext,
      connectionType,
      educationalGoals
    });

    res.status(201).json({
      message: 'Demande de connexion envoyée avec succès',
      connection
    });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error creating connection:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Student not found')) {
        return res.status(404).json({ error: 'Aucun élève trouvé avec cette adresse email' });
      }
      if (error.message.includes('not belong to a student')) {
        return res.status(400).json({ error: 'Cette adresse email n\'appartient pas à un élève' });
      }
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de la connexion' });
  }
});

// PUT /api/teacher-student/connections/:connectionId/approve - Approuver une connexion (côté élève)
router.put('/connections/:connectionId/approve', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const connectionId = parseInt(req.params.connectionId);
    
    if (userRole !== 'Student') {
      return res.status(403).json({ error: 'Seuls les élèves peuvent approuver des connexions' });
    }

    console.log('[TEACHER_STUDENT_CONNECTIONS] Approving connection:', { connectionId, studentId: userId });

    const updatedConnection = await storage.approveTeacherStudentConnection(connectionId, userId);

    res.json({
      message: 'Connexion approuvée avec succès',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error approving connection:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de la connexion' });
  }
});

// GET /api/teacher-student/messages/:connectionId - Récupérer les messages d'une connexion
router.get('/messages/:connectionId', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    
    console.log('[TEACHER_STUDENT_CONNECTIONS] Getting messages for connection:', { connectionId, userId });

    const messages = await storage.getTeacherStudentMessages(connectionId);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error getting messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// POST /api/teacher-student/messages - Envoyer un message
router.post('/messages', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Teacher' && userRole !== 'Freelancer' && userRole !== 'Student') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const validationResult = sendTeacherStudentMessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      });
    }

    const { 
      connectionId, 
      message, 
      messageType, 
      parentCcEnabled, 
      homeworkDetails, 
      gradeDetails 
    } = validationResult.data;

    console.log('[TEACHER_STUDENT_CONNECTIONS] Sending message:', { 
      senderId: userId, 
      connectionId, 
      messageType,
      parentCcEnabled 
    });

    const sentMessage = await storage.sendTeacherStudentMessage({
      connectionId,
      senderId: userId,
      senderType: userRole.toLowerCase(),
      message,
      messageType,
      parentCcEnabled,
      homeworkDetails,
      gradeDetails
    });

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: sentMessage
    });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error sending message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT /api/teacher-student/messages/:messageId/read - Marquer un message comme lu
router.put('/messages/:messageId/read', requireAuth, async (req: any, res: any) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;
    
    console.log('[TEACHER_STUDENT_CONNECTIONS] Marking message as read:', { messageId, userId });

    await storage.markTeacherStudentMessageAsRead(messageId);

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error marking message as read:', error);
    res.status(500).json({ error: 'Erreur lors du marquage du message' });
  }
});

// DELETE /api/teacher-student/connections/:connectionId - Supprimer une connexion
router.delete('/connections/:connectionId', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('[TEACHER_STUDENT_CONNECTIONS] Deleting connection:', { connectionId, userId, userRole });

    await storage.deleteTeacherStudentConnection(connectionId, userId);

    res.json({ message: 'Connexion supprimée avec succès' });
  } catch (error) {
    console.error('[TEACHER_STUDENT_CONNECTIONS] Error deleting connection:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la connexion' });
  }
});

export default router;