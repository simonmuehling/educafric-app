import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { onlineClassActivationService } from '../../services/onlineClassActivationService';
import { onlineClassAccessService } from '../../services/onlineClassAccessService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const activateSchoolSchema = z.object({
  schoolId: z.number(),
  durationType: z.enum(['monthly', 'quarterly', 'semestral', 'yearly']),
  notes: z.string().optional()
});

const activateTeacherSchema = z.object({
  teacherId: z.number(),
  paymentId: z.string(),
  paymentMethod: z.enum(['stripe', 'mtn']),
  amountPaid: z.number().default(150000)
});

/**
 * POST /api/admin/online-class-activations/schools
 * Admin manually activates online class module for a school
 */
router.post('/schools',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only admins can activate
      if (!['SiteAdmin', 'Admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Seuls les administrateurs peuvent activer ce module'
        });
      }

      const validated = activateSchoolSchema.parse(req.body);

      const activation = await onlineClassActivationService.activateForSchool(
        validated.schoolId,
        validated.durationType,
        user.id,
        validated.notes
      );

      console.log(`[ONLINE_CLASS_ACTIVATION] ✅ School ${validated.schoolId} activated by admin ${user.id}`);

      res.status(201).json({
        success: true,
        activation,
        message: `Module cours en ligne activé pour l'école (${validated.durationType})`
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error activating school:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Échec de l\'activation'
      });
    }
  }
);

/**
 * POST /api/admin/online-class-activations/teachers
 * Record a teacher's personal activation (after payment)
 */
router.post('/teachers',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only admins or the teacher themselves can record activation
      const validated = activateTeacherSchema.parse(req.body);
      
      if (user.role === 'Teacher' && user.id !== validated.teacherId) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      if (!['SiteAdmin', 'Admin', 'Teacher'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      const activation = await onlineClassActivationService.activateForTeacher(
        validated.teacherId,
        validated.paymentId,
        validated.paymentMethod,
        validated.amountPaid
      );

      console.log(`[ONLINE_CLASS_ACTIVATION] ✅ Teacher ${validated.teacherId} activated (${validated.paymentMethod})`);

      res.status(201).json({
        success: true,
        activation,
        message: 'Module cours en ligne activé (1 an)'
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error activating teacher:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Échec de l\'activation'
      });
    }
  }
);

/**
 * GET /api/admin/online-class-activations
 * Get all activations (admin only)
 */
router.get('/',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (!['SiteAdmin', 'Admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Seuls les administrateurs peuvent voir les activations'
        });
      }

      const activations = await onlineClassActivationService.getAllActivations();

      res.json({
        success: true,
        activations,
        total: activations.length
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error fetching activations:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de récupération des activations'
      });
    }
  }
);

/**
 * GET /api/admin/online-class-activations/schools/:schoolId
 * Get activations for a specific school
 */
router.get('/schools/:schoolId',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      const schoolId = parseInt(req.params.schoolId);
      
      if (!['SiteAdmin', 'Admin', 'Director'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      // Directors can only see their own school
      if (user.role === 'Director' && user.schoolId !== schoolId) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé - école différente'
        });
      }

      const activations = await onlineClassActivationService.getSchoolActivations(schoolId);

      res.json({
        success: true,
        activations,
        total: activations.length
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error fetching school activations:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de récupération des activations'
      });
    }
  }
);

/**
 * DELETE /api/admin/online-class-activations/:activationId
 * Cancel an activation (admin only)
 */
router.delete('/:activationId',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      const activationId = parseInt(req.params.activationId);
      
      if (!['SiteAdmin', 'Admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Seuls les administrateurs peuvent annuler les activations'
        });
      }

      await onlineClassActivationService.cancelActivation(activationId);

      console.log(`[ONLINE_CLASS_ACTIVATION] ✅ Activation ${activationId} cancelled by admin ${user.id}`);

      res.json({
        success: true,
        message: 'Activation annulée'
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error cancelling activation:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de l\'annulation'
      });
    }
  }
);

/**
 * GET /api/online-class-activations/check-access
 * Check if current user can access online classes
 */
router.get('/check-access',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'Teacher') {
        return res.json({
          success: true,
          allowed: false,
          reason: 'only_teachers',
          message: 'Seuls les enseignants peuvent créer des cours en ligne'
        });
      }

      const accessCheck = await onlineClassAccessService.canTeacherAccessOnlineClass(
        user.id,
        new Date()
      );

      res.json({
        success: true,
        ...accessCheck
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error checking access:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de vérification d\'accès'
      });
    }
  }
);

/**
 * GET /api/online-class-activations/access-details
 * Get detailed access information for current teacher
 */
router.get('/access-details',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les enseignants peuvent voir ces détails'
        });
      }

      const details = await onlineClassAccessService.getAccessDetails(user.id);

      if (!details) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        ...details
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error fetching access details:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de récupération des détails'
      });
    }
  }
);

export default router;
