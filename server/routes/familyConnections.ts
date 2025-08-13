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

// Schema de validation pour la création d'une connexion
const createConnectionSchema = z.object({
  childEmail: z.string().email('Email invalide')
});

// Schema de validation pour l'envoi de message
const sendMessageSchema = z.object({
  connectionId: z.number(),
  message: z.string().min(1, 'Message ne peut pas être vide').max(1000, 'Message trop long'),
  messageType: z.enum(['text', 'image', 'audio', 'location']).default('text')
});

// GET /api/family/connections - Récupérer les connexions familiales
router.get('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('[FAMILY_CONNECTIONS] Getting connections for user:', { userId, userRole });

    let connections = [];
    
    if (userRole === 'Parent') {
      connections = await storage.getFamilyConnections(userId);
    } else if (userRole === 'Student') {
      connections = await storage.checkChildConnectionRequest(userId);
    }

    res.json(connections);
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error getting connections:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des connexions' });
  }
});

// POST /api/family/connections - Créer une nouvelle connexion familiale
router.post('/connections', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Parent') {
      return res.status(403).json({ error: 'Seuls les parents peuvent créer des connexions' });
    }

    const validationResult = createConnectionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      });
    }

    const { childEmail } = validationResult.data;

    console.log('[FAMILY_CONNECTIONS] Creating connection:', { parentId: userId, childEmail });

    const connection = await storage.createFamilyConnection({
      parentId: userId,
      childEmail
    });

    res.status(201).json({
      message: 'Demande de connexion envoyée avec succès',
      connection
    });
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error creating connection:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Child not found')) {
        return res.status(404).json({ error: 'Aucun enfant trouvé avec cette adresse email' });
      }
      if (error.message.includes('not belong to a student')) {
        return res.status(400).json({ error: 'Cette adresse email n\'appartient pas à un étudiant' });
      }
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de la connexion' });
  }
});

// PUT /api/family/connections/:connectionId/approve - Approuver une connexion (côté enfant)
router.put('/connections/:connectionId/approve', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const connectionId = parseInt(req.params.connectionId);
    
    if (userRole !== 'Student') {
      return res.status(403).json({ error: 'Seuls les étudiants peuvent approuver des connexions' });
    }

    console.log('[FAMILY_CONNECTIONS] Approving connection:', { connectionId, childId: userId });

    const updatedConnection = await storage.approveFamilyConnection(connectionId, userId);

    res.json({
      message: 'Connexion approuvée avec succès',
      connection: updatedConnection
    });
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error approving connection:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de la connexion' });
  }
});

// GET /api/family/messages/:connectionId - Récupérer les messages d'une connexion
router.get('/messages/:connectionId', requireAuth, async (req: any, res: any) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    const userId = req.user.id;
    
    console.log('[FAMILY_CONNECTIONS] Getting messages for connection:', { connectionId, userId });

    const messages = await storage.getFamilyMessages(connectionId);

    res.json(messages);
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error getting messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// POST /api/family/messages - Envoyer un message
router.post('/messages', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const validationResult = sendMessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validationResult.error.errors 
      });
    }

    const { connectionId, message, messageType } = validationResult.data;

    console.log('[FAMILY_CONNECTIONS] Sending message:', { 
      senderId: userId, 
      connectionId, 
      messageType 
    });

    const sentMessage = await storage.sendFamilyMessage({
      connectionId,
      senderId: userId,
      message,
      messageType
    });

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: sentMessage
    });
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error sending message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT /api/family/messages/:messageId/read - Marquer un message comme lu
router.put('/messages/:messageId/read', requireAuth, async (req: any, res: any) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;
    
    console.log('[FAMILY_CONNECTIONS] Marking message as read:', { messageId, userId });

    await storage.markFamilyMessageAsRead(messageId);

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('[FAMILY_CONNECTIONS] Error marking message as read:', error);
    res.status(500).json({ error: 'Erreur lors du marquage du message' });
  }
});

export default router;