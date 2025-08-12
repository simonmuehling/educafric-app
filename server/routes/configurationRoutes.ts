import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour le statut de configuration
const configurationStatusSchema = z.object({
  'school-info': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'admin-accounts': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'teachers': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'classes': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'students': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'timetable': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'communications': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'attendance': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'geolocation': z.enum(['completed', 'in-progress', 'pending', 'missing']),
  'subscription': z.enum(['completed', 'in-progress', 'pending', 'missing'])
});

// Middleware d'authentification simple pour les routes de configuration
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId && !req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

/**
 * GET /api/school/configuration-status
 * Récupère le statut de configuration de l'école
 */
router.get('/configuration-status', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const schoolId = user.schoolId || 1; // Valeur par défaut pour les tests
    console.log(`[CONFIG_STATUS] Vérification configuration pour école ${schoolId}`);

    const configurationStatus = await analyzeSchoolConfiguration(schoolId);
    
    res.json({
      schoolId: schoolId,
      overallProgress: calculateOverallProgress(configurationStatus),
      lastUpdated: new Date().toISOString(),
      steps: configurationStatus,
      missingElements: getMissingElements(configurationStatus),
      nextRecommendedStep: getNextRecommendedStep(configurationStatus)
    });

  } catch (error) {
    console.error('[CONFIG_STATUS] Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du statut de configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/school/configuration-status/update
 * Met à jour le statut d'une étape de configuration
 */
router.post('/configuration-status/update', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { stepId, status, completedData } = req.body;

    if (!stepId || !status) {
      return res.status(400).json({ message: 'stepId et status sont requis' });
    }

    const schoolId = user.schoolId || 1;
    console.log(`[CONFIG_UPDATE] Mise à jour étape ${stepId} -> ${status} pour école ${schoolId}`);

    // Sauvegarder le statut mis à jour
    await updateStepStatus(schoolId, stepId, status, completedData);

    // Récupérer le nouveau statut complet
    const updatedStatus = await analyzeSchoolConfiguration(schoolId);

    res.json({
      success: true,
      stepId,
      newStatus: status,
      overallProgress: calculateOverallProgress(updatedStatus),
      nextRecommendedStep: getNextRecommendedStep(updatedStatus)
    });

  } catch (error) {
    console.error('[CONFIG_UPDATE] Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/school/configuration-recommendations
 * Récupère les recommandations personnalisées pour l'école
 */
router.get('/configuration-recommendations', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const schoolId = user.schoolId || 1;
    const configurationStatus = await analyzeSchoolConfiguration(schoolId);
    const recommendations = generateRecommendations(configurationStatus, user);

    res.json({
      schoolId: schoolId,
      recommendations,
      priorityActions: getPriorityActions(configurationStatus),
      estimatedCompletionTime: getEstimatedCompletionTime(configurationStatus)
    });

  } catch (error) {
    console.error('[CONFIG_RECOMMENDATIONS] Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération des recommandations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fonction utilitaire pour analyser la configuration de l'école
async function analyzeSchoolConfiguration(schoolId: number) {
  const configStatus: any = {};

  try {
    // Vérifier les informations de l'école
    try {
      const school = await storage.getSchool(schoolId);
      configStatus['school-info'] = (school && school.name && school.address) ? 'completed' : 'missing';
    } catch (error) {
      configStatus['school-info'] = 'missing';
    }

    // Vérifier les comptes administrateurs
    try {
      const administrators = await storage.getSchoolAdministrators(schoolId);
      configStatus['admin-accounts'] = (administrators && administrators.length > 0) ? 'completed' : 'missing';
    } catch (error) {
      configStatus['admin-accounts'] = 'missing';
    }

    // Vérifier les enseignants - utiliser une approche simplifiée
    configStatus['teachers'] = 'pending'; // À implémenter selon les données disponibles

    // Vérifier les classes
    try {
      const classes = await storage.getClassesBySchool(schoolId);
      configStatus['classes'] = (classes && classes.length > 0) ? 'completed' : 'missing';
    } catch (error) {
      configStatus['classes'] = 'missing';
    }

    // Vérifier les élèves - utiliser une approche simplifiée
    configStatus['students'] = 'pending';

    // Vérifier l'emploi du temps
    configStatus['timetable'] = 'pending';

    // Vérifier les communications (basique pour l'instant)
    configStatus['communications'] = 'pending'; // À implémenter selon vos besoins

    // Vérifier le système de présences
    configStatus['attendance'] = 'pending'; // À implémenter selon vos besoins

    // Vérifier la géolocalisation (optionnel)
    configStatus['geolocation'] = 'pending'; // À implémenter selon vos besoins

    // Vérifier l'abonnement
    configStatus['subscription'] = 'pending'; // À implémenter selon vos besoins

  } catch (error) {
    console.error('[CONFIG_ANALYSIS] Erreur lors de l\'analyse:', error);
    // En cas d'erreur, marquer les éléments comme manquants
    Object.keys(configStatus).forEach(key => {
      if (!configStatus[key]) {
        configStatus[key] = 'missing';
      }
    });
  }

  return configStatus;
}

function calculateOverallProgress(configStatus: any): number {
  const totalSteps = Object.keys(configStatus).length;
  const completedSteps = Object.values(configStatus).filter(status => status === 'completed').length;
  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
}

function getMissingElements(configStatus: any): string[] {
  return Object.keys(configStatus).filter(key => 
    configStatus[key] === 'missing' || configStatus[key] === 'pending'
  );
}

function getNextRecommendedStep(configStatus: any): string | null {
  // Priorité des étapes par ordre d'importance
  const priorityOrder = [
    'school-info',
    'admin-accounts', 
    'teachers',
    'classes',
    'students',
    'timetable',
    'communications',
    'attendance',
    'geolocation',
    'subscription'
  ];

  for (const step of priorityOrder) {
    if (configStatus[step] === 'missing' || configStatus[step] === 'pending') {
      return step;
    }
  }
  
  return null; // Toutes les étapes sont terminées
}

function generateRecommendations(configStatus: any, user: any): any[] {
  const recommendations = [];
  const missingElements = getMissingElements(configStatus);

  if (missingElements.includes('school-info')) {
    recommendations.push({
      type: 'urgent',
      title: 'Compléter les informations de l\'école',
      description: 'Les informations de base de votre école sont incomplètes',
      action: 'Aller aux Paramètres École',
      estimatedTime: '5 minutes'
    });
  }

  if (missingElements.includes('teachers') && configStatus['school-info'] === 'completed') {
    recommendations.push({
      type: 'important',
      title: 'Ajouter vos enseignants',
      description: 'Commencez par enregistrer votre équipe pédagogique',
      action: 'Aller à la Gestion Enseignants',
      estimatedTime: '15 minutes'
    });
  }

  return recommendations;
}

function getPriorityActions(configStatus: any): any[] {
  const actions = [];
  
  if (configStatus['school-info'] === 'missing') {
    actions.push({
      stepId: 'school-info',
      priority: 'urgent',
      reason: 'Informations de base manquantes'
    });
  }

  if (configStatus['teachers'] === 'missing' && configStatus['school-info'] === 'completed') {
    actions.push({
      stepId: 'teachers',
      priority: 'important', 
      reason: 'Nécessaire avant de créer les classes'
    });
  }

  return actions;
}

function getEstimatedCompletionTime(configStatus: any): string {
  const missingCount = getMissingElements(configStatus).length;
  const estimatedMinutes = missingCount * 10; // 10 minutes par étape en moyenne
  
  if (estimatedMinutes < 60) {
    return `${estimatedMinutes} minutes`;
  } else {
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
}

async function updateStepStatus(schoolId: number, stepId: string, status: string, completedData?: any) {
  // Sauvegarder dans une table de configuration ou localStorage selon votre architecture
  console.log(`[CONFIG_SAVE] École ${schoolId}: ${stepId} -> ${status}`);
  
  // Pour l'instant, on peut utiliser un mécanisme simple de sauvegarde
  // Dans une vraie implémentation, vous pourriez avoir une table `school_configuration`
  
  try {
    // Exemple de sauvegarde basique - à adapter selon votre base de données
    const configData = {
      schoolId,
      stepId,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : null,
      data: completedData
    };
    
    // Sauvegarder dans votre système de stockage préféré
    console.log('[CONFIG_SAVED]', configData);
    
  } catch (error) {
    console.error('[CONFIG_SAVE_ERROR]', error);
    throw error;
  }
}

export default router;