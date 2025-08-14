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

// Schema de validation pour la création d'une connexion élève-parent
const createStudentParentConnectionSchema = z.object({
  parentEmail: z.string().email('Email invalide').optional(),
  parentPhone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  relationshipType: z.enum(['mother', 'father', 'guardian', 'sibling', 'grandparent', 'uncle', 'aunt', 'tutor']),
  connectionType: z.enum(['guardian', 'tutor', 'relative', 'emergency_contact']).default('guardian'),
  emergencyContactPriority: z.number().min(1).max(5).default(1),
  academicVisibilitySettings: z.object({
    grades: z.boolean().default(true),
    attendance: z.boolean().default(true),
    homework: z.boolean().default(true),
    behavior: z.boolean().default(true),
    schedule: z.boolean().default(true)
  }).optional()
}).refine(data => data.parentEmail || data.parentPhone, {
  message: 'Email ou numéro de téléphone du parent requis'
});

// Schema de validation pour l'envoi de message
const sendStudentParentMessageSchema = z.object({
  connectionId: z.number(),
  message: z.string().min(1, 'Message ne peut pas être vide').max(2000, 'Message trop long'),
  messageType: z.enum(['text', 'image', 'audio', 'location', 'file', 'academic_update', 'permission_request', 'emergency']).default('text'),
  teacherCcEnabled: z.boolean().default(false),
  geolocationShared: z.boolean().default(false),
  emergencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  academicContext: z.object({
    subject: z.string(),
    grade: z.number().optional(),
    comment: z.string().optional()
  }).optional(),
  permissionDetails: z.object({
    activity: z.string(),
    date: z.string(),
    location: z.string(),
    duration: z.string()
  }).optional()
});

// POST /api/student-parent/search-parents - Rechercher des parents par email/téléphone
router.post('/search-parents', requireAuth, async (req: any, res: any) => {
  try {
    const { searchValue, searchType } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Student') {
      return res.status(403).json({ error: 'Seuls les élèves peuvent rechercher des parents' });
    }
    
    if (!searchValue || !searchType) {
      return res.status(400).json({ error: 'Valeur de recherche et type requis' });
    }

    console.log('[STUDENT_PARENT_SEARCH] Searching parents:', { searchValue, searchType, userId });

    let users = [];

    if (searchType === 'phone' && searchValue.length >= 10) {
      users = await storage.searchUsersByPhone(searchValue);
    } else if (searchType === 'email' && searchValue.includes('@') && searchValue.includes('.') && searchValue.length > 5) {
      users = await storage.searchUsersByEmail(searchValue);
    }

    // Filtrer pour ne retourner que les parents et exclure l'utilisateur actuel
    const parents = users.filter((user: any) => 
      user.role === 'Parent' && 
      user.id !== userId
    );

    res.json({ users: parents });
  } catch (error) {
    console.error('[STUDENT_PARENT_SEARCH] Error searching parents:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// GET /api/student-parent/connections - Récupérer les connexions élève-parent
router.get('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('[STUDENT_PARENT_CONNECTIONS] Getting connections for user:', { userId, userRole });

    let connections = [];
    
    if (userRole === 'Student') {
      connections = await storage.getStudentParentConnections(userId, 'student');
    } else if (userRole === 'Parent') {
      connections = await storage.getStudentParentConnections(userId, 'parent');
    } else {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ success: true, data: connections });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error getting connections:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des connexions' });
  }
});

// POST /api/student-parent/connections - Créer une nouvelle connexion élève-parent
router.post('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Student') {
      return res.status(403).json({ error: 'Seuls les élèves peuvent créer des connexions avec des parents' });
    }

    const validationResult = createStudentParentConnectionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      });
    }

    const { 
      parentEmail, 
      parentPhone, 
      relationshipType, 
      connectionType, 
      emergencyContactPriority, 
      academicVisibilitySettings 
    } = validationResult.data;

    console.log('[STUDENT_PARENT_CONNECTIONS] Creating connection:', { 
      studentId: userId, 
      parentEmail, 
      parentPhone, 
      relationshipType,
      connectionType 
    });

    const connection = await storage.createStudentParentConnection({
      studentId: userId,
      parentEmail,
      parentPhone,
      relationshipType,
      connectionType,
      emergencyContactPriority,
      academicVisibilitySettings
    });

    res.status(201).json({
      message: 'Demande de connexion envoyée avec succès',
      connection
    });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error creating connection:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Parent not found')) {
        return res.status(404).json({ error: 'Aucun parent trouvé avec cette adresse email' });
      }
      if (error.message.includes('not belong to a parent')) {
        return res.status(400).json({ error: 'Cette adresse email n\'appartient pas à un parent' });
      }
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de la connexion' });
  }
});

// PUT /api/student-parent/connections/:connectionId/approve - Approuver une connexion (côté parent)
router.put('/connections/:connectionId/approve', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const connectionId = parseInt(req.params.connectionId);
    
    if (userRole !== 'Parent') {
      return res.status(403).json({ error: 'Seuls les parents peuvent approuver des connexions' });
    }

    console.log('[STUDENT_PARENT_CONNECTIONS] Approving connection:', { connectionId, parentId: userId });

    const updatedConnection = await storage.approveStudentParentConnection(connectionId, userId);

    res.json({
      message: 'Connexion approuvée avec succès',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error approving connection:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de la connexion' });
  }
});

// GET /api/student-parent/messages/:connectionId - Récupérer les messages d'une connexion
router.get('/messages/:connectionId', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    
    console.log('[STUDENT_PARENT_CONNECTIONS] Getting messages for connection:', { connectionId, userId });

    const messages = await storage.getStudentParentMessages(connectionId);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error getting messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// POST /api/student-parent/messages - Envoyer un message
router.post('/messages', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Student' && userRole !== 'Parent') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const validationResult = sendStudentParentMessageSchema.safeParse(req.body);
    
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
      teacherCcEnabled, 
      geolocationShared,
      emergencyLevel,
      academicContext, 
      permissionDetails 
    } = validationResult.data;

    console.log('[STUDENT_PARENT_CONNECTIONS] Sending message:', { 
      senderId: userId, 
      connectionId, 
      messageType,
      teacherCcEnabled,
      emergencyLevel 
    });

    const sentMessage = await storage.sendStudentParentMessage({
      connectionId,
      senderId: userId,
      senderType: userRole.toLowerCase(),
      message,
      messageType,
      teacherCcEnabled,
      geolocationShared,
      emergencyLevel,
      academicContext,
      permissionDetails
    });

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: sentMessage
    });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error sending message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT /api/student-parent/messages/:messageId/read - Marquer un message comme lu
router.put('/messages/:messageId/read', requireAuth, async (req: any, res: any) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;
    
    console.log('[STUDENT_PARENT_CONNECTIONS] Marking message as read:', { messageId, userId });

    await storage.markStudentParentMessageAsRead(messageId);

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error marking message as read:', error);
    res.status(500).json({ error: 'Erreur lors du marquage du message' });
  }
});

// PUT /api/student-parent/connections/:connectionId/settings - Mettre à jour les paramètres de connexion
router.put('/connections/:connectionId/settings', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { academicVisibilitySettings, privacySettings } = req.body;
    
    console.log('[STUDENT_PARENT_CONNECTIONS] Updating connection settings:', { 
      connectionId, 
      userId, 
      userRole 
    });

    await storage.updateStudentParentConnectionSettings(connectionId, userId, {
      academicVisibilitySettings,
      privacySettings
    });

    res.json({ message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error updating settings:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

// DELETE /api/student-parent/connections/:connectionId - Supprimer une connexion
router.delete('/connections/:connectionId', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('[STUDENT_PARENT_CONNECTIONS] Deleting connection:', { connectionId, userId, userRole });

    await storage.deleteStudentParentConnection(connectionId, userId);

    res.json({ message: 'Connexion supprimée avec succès' });
  } catch (error) {
    console.error('[STUDENT_PARENT_CONNECTIONS] Error deleting connection:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la connexion' });
  }
});

export default router;