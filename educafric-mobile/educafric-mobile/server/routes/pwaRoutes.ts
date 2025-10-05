import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Route de santé pour PWA Connection Manager
router.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'EducAfric',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      nodeVersion: process.version
    }
  });
});

// Route pour récupérer les notifications manquées (PWA Sync)
router.get('/notifications/missed', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer les notifications non lues des 2 dernières heures
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // Pour l'instant, retourner des notifications de test
    const notifications = [
      {
        id: `missed_${Date.now()}`,
        title: 'Notification manquée de test',
        message: 'Ceci est une notification qui était en attente de synchronisation.',
        type: 'test',
        priority: 'normal',
        timestamp: twoHoursAgo.toISOString(),
        userId: userId
      }
    ];
    
    console.log(`[PWA_SYNC] ${notifications.length} notifications manquées récupérées pour utilisateur ${userId}`);
    
    res.json(notifications);
  } catch (error) {
    console.error('[PWA_SYNC] Erreur récupération notifications manquées:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de test de connectivité
router.post('/test-connection', (req, res) => {
  const delay = Math.random() * 200 + 50; // 50-250ms de latence simulée
  
  setTimeout(() => {
    res.json({
      success: true,
      latency: Math.round(delay),
      timestamp: new Date().toISOString(),
      quality: delay < 100 ? 'excellent' : delay < 200 ? 'good' : 'poor'
    });
  }, delay);
});

// Route pour simuler une notification push
router.post('/simulate-notification', (req, res) => {
  const { title, message, type } = req.body;
  
  const notification = {
    id: `sim_${Date.now()}`,
    title: title || 'Notification de test',
    message: message || 'Ceci est une notification de test pour vérifier la connectivité PWA.',
    type: type || 'test',
    priority: 'normal',
    timestamp: new Date().toISOString()
  };
  
  console.log('[PWA_SIM] Notification simulée:', notification);
  
  res.json({
    success: true,
    notification: notification
  });
});

export default router;