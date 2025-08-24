/**
 * DONNÉES SANDBOX POUR SYSTÈME DE MESSAGERIE UNIFIÉ
 * Fournit des données de test pour le nouveau système consolidé
 */

import { Router } from 'express';

const router = Router();

// Middleware d'authentification sandbox
const requireSandboxAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization?.includes('sandbox') || 
      req.headers.authorization?.includes('demo') ||
      req.user?.email?.includes('test.educafric.com')) {
    req.user = req.user || { id: 1, role: 'Admin', email: 'sandbox@test.educafric.com' };
    return next();
  }
  res.status(401).json({ message: 'Sandbox access required' });
};

// ===== DONNÉES DE CONNEXIONS UNIFIÉES =====
router.get('/connections/:connectionType', requireSandboxAuth, (req, res) => {
  const { connectionType } = req.params;
  
  const connectionsByType = {
    'student-parent': [
      {
        id: 1,
        connectionType: 'student-parent',
        initiatorId: 1001, // ID étudiant
        targetId: 2001,    // ID parent
        status: 'approved',
        connectionData: {
          studentName: 'Marie Kamga',
          parentName: 'Paul Kamga',
          relationship: 'père',
          emergencyContact: true
        },
        createdAt: new Date('2025-01-10').toISOString(),
        approvedAt: new Date('2025-01-10').toISOString(),
        approvedBy: 2001
      },
      {
        id: 2,
        connectionType: 'student-parent',
        initiatorId: 1002,
        targetId: 2002,
        status: 'approved',
        connectionData: {
          studentName: 'Jean Mvondo',
          parentName: 'Claire Mvondo',
          relationship: 'mère',
          emergencyContact: true
        },
        createdAt: new Date('2025-01-08').toISOString(),
        approvedAt: new Date('2025-01-08').toISOString(),
        approvedBy: 2002
      }
    ],
    'teacher-student': [
      {
        id: 3,
        connectionType: 'teacher-student',
        initiatorId: 3001, // ID enseignant
        targetId: 1001,    // ID étudiant
        status: 'approved',
        connectionData: {
          teacherName: 'Prof. Atangana',
          studentName: 'Marie Kamga',
          subject: 'Mathématiques',
          classContext: '3ème A'
        },
        createdAt: new Date('2025-01-12').toISOString(),
        approvedAt: new Date('2025-01-12').toISOString(),
        approvedBy: 1001
      }
    ],
    'family': [
      {
        id: 4,
        connectionType: 'family',
        initiatorId: 2001, // ID parent
        targetId: 1001,    // ID enfant
        status: 'approved',
        connectionData: {
          parentName: 'Paul Kamga',
          childName: 'Marie Kamga',
          familyRole: 'père',
          guardianship: true
        },
        createdAt: new Date('2025-01-05').toISOString(),
        approvedAt: new Date('2025-01-05').toISOString(),
        approvedBy: 1001
      }
    ],
    'partnership': [
      {
        id: 5,
        connectionType: 'partnership',
        initiatorId: 4001, // ID commercial
        targetId: 5001,    // ID école
        status: 'approved',
        connectionData: {
          commercialName: 'Sophie Tchouta',
          schoolName: 'École Internationale Yaoundé',
          partnershipType: 'commercial',
          contractValid: true
        },
        createdAt: new Date('2025-01-01').toISOString(),
        approvedAt: new Date('2025-01-02').toISOString(),
        approvedBy: 5001
      }
    ]
  };
  
  const connections = connectionsByType[connectionType as keyof typeof connectionsByType] || [];
  
  console.log(`🔗 [UNIFIED_CONNECTIONS] Récupération des connexions ${connectionType}: ${connections.length} trouvées`);
  res.json({ success: true, data: connections, connectionType });
});

// ===== MESSAGES UNIFIÉS PAR CONNEXION =====
router.get('/messages/:connectionType/:connectionId', requireSandboxAuth, (req, res) => {
  const { connectionType, connectionId } = req.params;
  
  const sampleMessages = [
    {
      id: 1,
      connectionId: parseInt(connectionId),
      connectionType,
      senderId: 1001,
      message: `Message de test pour connexion ${connectionType} n°${connectionId}`,
      messageType: 'text',
      isRead: false,
      readAt: null,
      priority: 'normal',
      parentCcEnabled: false,
      teacherCcEnabled: false,
      geolocationShared: false,
      messageData: {
        demoMessage: true,
        connectionDetails: { type: connectionType, id: connectionId }
      },
      sentAt: new Date().toISOString()
    },
    {
      id: 2,
      connectionId: parseInt(connectionId),
      connectionType,
      senderId: 2001,
      message: `Réponse au message sur connexion ${connectionType}`,
      messageType: 'text',
      isRead: true,
      readAt: new Date(Date.now() - 3600000).toISOString(),
      priority: 'normal',
      parentCcEnabled: false,
      teacherCcEnabled: false,
      geolocationShared: false,
      messageData: {
        responseMessage: true,
        originalConnectionType: connectionType
      },
      sentAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  console.log(`💬 [UNIFIED_MESSAGES] Messages pour ${connectionType} connexion ${connectionId}: ${sampleMessages.length}`);
  res.json({ success: true, data: sampleMessages, connectionType, connectionId: parseInt(connectionId) });
});

// ===== ENVOI DE MESSAGE UNIFIÉ =====
router.post('/messages/:connectionType', requireSandboxAuth, (req, res) => {
  const { connectionType } = req.params;
  const { connectionId, message, messageType, priority, parentCcEnabled, teacherCcEnabled, geolocationShared, messageData } = req.body;
  
  const unifiedMessage = {
    id: Math.floor(Math.random() * 10000) + 1000,
    connectionId: connectionId,
    connectionType,
    senderId: req.user?.id || 1,
    message,
    messageType: messageType || 'text',
    priority: priority || 'normal',
    isRead: false,
    readAt: null,
    parentCcEnabled: parentCcEnabled || false,
    teacherCcEnabled: teacherCcEnabled || false,
    geolocationShared: geolocationShared || false,
    messageData: messageData || { sandboxDemo: true },
    sentAt: new Date().toISOString()
  };
  
  console.log(`📤 [UNIFIED_SEND] Message envoyé via ${connectionType}: "${message}"`);
  res.json({ success: true, data: unifiedMessage, message: 'Message envoyé avec succès' });
});

// ===== MARQUER MESSAGE COMME LU =====
router.put('/messages/:connectionType/:messageId/read', requireSandboxAuth, (req, res) => {
  const { connectionType, messageId } = req.params;
  
  console.log(`👁️ [UNIFIED_READ] Message ${messageId} marqué comme lu (${connectionType})`);
  res.json({ 
    success: true, 
    message: 'Message marqué comme lu',
    messageId: parseInt(messageId),
    connectionType,
    readAt: new Date().toISOString()
  });
});

// ===== STATISTIQUES SYSTÈME UNIFIÉ =====
router.get('/unified-stats', requireSandboxAuth, (req, res) => {
  const stats = {
    systemType: 'unified-messaging',
    version: '2.0.0',
    consolidationStats: {
      linesOfCodeRemoved: 913,
      filesConsolidated: 3,
      duplicatesEliminated: '78%'
    },
    connectionTypes: {
      'student-parent': 15,
      'teacher-student': 23,
      'family': 12,
      'partnership': 8
    },
    totalMessages: 1247,
    messagesThisWeek: 89,
    averageResponseTime: '4.2 heures',
    systemHealth: 'excellent',
    features: [
      'Messages unifiés',
      'Connexions multi-types',
      'Géolocalisation optionnelle',
      'CC enseignants/parents',
      'Messages contextuels'
    ]
  };
  
  console.log(`📊 [UNIFIED_STATS] Statistiques système unifié consultées`);
  res.json({ success: true, data: stats });
});

export default router;