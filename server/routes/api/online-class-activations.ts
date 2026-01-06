import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { onlineClassActivationService } from '../../services/onlineClassActivationService';
import { onlineClassAccessService } from '../../services/onlineClassAccessService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const activateSchoolSchema = z.object({
  schoolId: z.number(),
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly']),
  notes: z.string().optional()
});

const activateTeacherSchema = z.object({
  teacherId: z.number(),
  paymentId: z.string(),
  paymentMethod: z.enum(['stripe', 'mtn']),
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly']).default('yearly'),
  amountPaid: z.number().optional()
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
 * 
 * TODO SECURITY: Currently allows teachers to self-activate without payment verification.
 * This route MUST be restricted to admins only until Stripe/MTN payment verification is implemented.
 * Teachers should not be able to POST to this endpoint directly.
 */
router.post('/teachers',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // SECURITY: Only admins can activate teachers until payment verification is implemented
      if (!['SiteAdmin', 'Admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Seuls les administrateurs peuvent activer les enseignants. Paiement via Stripe/MTN à venir.'
        });
      }

      const validated = activateTeacherSchema.parse(req.body);

      const activation = await onlineClassActivationService.activateForTeacher(
        validated.teacherId,
        validated.paymentId,
        validated.paymentMethod,
        validated.durationType,
        validated.amountPaid
      );

      console.log(`[ONLINE_CLASS_ACTIVATION] ✅ Teacher ${validated.teacherId} activated (${validated.paymentMethod}, ${validated.durationType})`);

      res.status(201).json({
        success: true,
        activation,
        message: `Module cours en ligne activé (${validated.durationType})`
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

      // Transform activations to match frontend expectations
      const transformedActivations = activations.map(a => ({
        id: a.id,
        entityType: a.activatorType, // 'school' or 'teacher'
        entityId: a.activatorId,
        entityName: a.activatorType === 'school' ? `School ${a.activatorId}` : `Teacher ${a.activatorId}`,
        durationType: a.durationType,
        expiresAt: a.endDate.toISOString(), // Frontend expects ISO string
        isActive: a.status === 'active', // Convert status to boolean
        activatedBy: a.activatedBy,
        activatorName: `User ${a.activatedBy}`,
        paymentId: a.paymentId,
        paymentMethod: a.paymentMethod,
        amountPaid: a.amountPaid ? Number(a.amountPaid) : undefined,
        notes: a.notes,
        createdAt: a.createdAt.toISOString()
      }));

      res.json({
        success: true,
        activations: transformedActivations,
        total: transformedActivations.length
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

      // Transform activations to match frontend expectations
      const transformedActivations = activations.map(a => ({
        id: a.id,
        entityType: a.activatorType,
        entityId: a.activatorId,
        entityName: a.activatorType === 'school' ? `School ${a.activatorId}` : `Teacher ${a.activatorId}`,
        durationType: a.durationType,
        expiresAt: a.endDate.toISOString(),
        isActive: a.status === 'active',
        activatedBy: a.activatedBy,
        activatorName: `User ${a.activatedBy}`,
        paymentId: a.paymentId,
        paymentMethod: a.paymentMethod,
        amountPaid: a.amountPaid ? Number(a.amountPaid) : undefined,
        notes: a.notes,
        createdAt: a.createdAt.toISOString()
      }));

      res.json({
        success: true,
        activations: transformedActivations,
        total: transformedActivations.length
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
      
      // ✅ MULTI-ROLE: Check activeRole first, fallback to primary role
      const effectiveRole = user.activeRole || user.role;
      
      console.log('[ONLINE_CLASS_ACCESS_CHECK] User:', {
        id: user.id,
        email: user.email,
        role: user.role,
        activeRole: user.activeRole,
        effectiveRole,
        schoolId: user.schoolId
      });
      
      if (effectiveRole !== 'Teacher') {
        return res.json({
          success: true,
          allowed: false,
          reason: 'only_teachers',
          message: 'Seuls les enseignants peuvent créer des cours en ligne'
        });
      }

      const accessCheck = await onlineClassAccessService.canTeacherAccessOnlineClass(
        user.id,
        new Date(),
        user.email // ✅ Pass user email for sandbox/test exemption check
      );

      console.log('[ONLINE_CLASS_ACCESS_CHECK] Result:', accessCheck);

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
      
      // ✅ MULTI-ROLE: Check activeRole first, fallback to primary role
      const effectiveRole = user.activeRole || user.role;
      
      if (effectiveRole !== 'Teacher') {
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

/**
 * GET /api/online-class-activations/school-status
 * Check if current director's school has online classes activated
 */
router.get('/school-status',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only directors can check their school's status
      if (user.role !== 'Director') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les directeurs peuvent vérifier le statut de leur école'
        });
      }

      if (!user.schoolId) {
        return res.json({
          success: true,
          isActivated: false,
          message: 'Aucune école associée'
        });
      }

      const isActivated = await onlineClassAccessService.isSchoolActivated(user.schoolId);
      
      // Get activation details if activated
      let activationDetails = null;
      if (isActivated) {
        const activation = await onlineClassActivationService.checkSchoolActivation(user.schoolId);
        if (activation) {
          activationDetails = {
            startDate: activation.startDate,
            endDate: activation.endDate,
            daysRemaining: Math.ceil((new Date(activation.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          };
        }
      }

      console.log(`[ONLINE_CLASS_ACTIVATION] 🏫 School ${user.schoolId} status check: ${isActivated ? 'ACTIVATED' : 'NOT ACTIVATED'}`);

      res.json({
        success: true,
        isActivated,
        activationDetails,
        message: isActivated 
          ? 'Module Cours en Ligne activé pour votre école'
          : 'Module Cours en Ligne non activé - Contactez Educafric pour l\'activer'
      });
    } catch (error) {
      console.error('[ONLINE_CLASS_ACTIVATION] Error checking school status:', error);
      
      res.status(500).json({
        success: false,
        error: 'Échec de vérification du statut'
      });
    }
  }
);

export default router;
