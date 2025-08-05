import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TutorialService } from '../services/tutorialService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const getTutorialStatusSchema = z.object({
  userRole: z.string(),
  tutorialVersion: z.string().optional().default("1.0")
});

const updateProgressSchema = z.object({
  currentStep: z.number().min(0),
  totalSteps: z.number().min(1),
  deviceType: z.string().optional(),
  sessionData: z.object({}).optional()
});

const completeTutorialSchema = z.object({
  completionMethod: z.enum(['completed', 'skipped', 'timeout']),
  finalStep: z.number().min(0),
  totalSteps: z.number().min(1),
  deviceType: z.string().optional(),
  sessionData: z.object({}).optional()
});

const resetTutorialSchema = z.object({
  userRole: z.string()
});

// Get tutorial status for current user
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = getTutorialStatusSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request parameters',
        details: validation.error.errors
      });
    }

    const { userRole, tutorialVersion } = validation.data;
    
    const status = await TutorialService.getTutorialStatus({
      userId: user.id,
      userRole,
      tutorialVersion
    });

    console.log(`[TUTORIAL_API] Status retrieved for user ${user.id}, role: ${userRole}`);
    res.json(status);
  } catch (error) {
    console.error('[TUTORIAL_API] Error getting tutorial status:', error);
    res.status(500).json({ error: 'Failed to get tutorial status' });
  }
});

// Update tutorial progress
router.put('/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = updateProgressSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { currentStep, totalSteps, deviceType, sessionData } = validation.data;
    
    const progress = await TutorialService.updateTutorialProgress({
      userId: user.id,
      currentStep,
      totalSteps,
      userRole: user.role,
      deviceType,
      sessionData
    });

    console.log(`[TUTORIAL_API] Progress updated for user ${user.id}: step ${currentStep}/${totalSteps}`);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('[TUTORIAL_API] Error updating tutorial progress:', error);
    res.status(500).json({ error: 'Failed to update tutorial progress' });
  }
});

// Complete tutorial
router.post('/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = completeTutorialSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { completionMethod, finalStep, totalSteps, deviceType, sessionData } = validation.data;
    
    const progress = await TutorialService.completeTutorial({
      userId: user.id,
      userRole: user.role,
      completionMethod,
      finalStep,
      totalSteps,
      deviceType,
      sessionData
    });

    console.log(`[TUTORIAL_API] Tutorial ${completionMethod} for user ${user.id} (${user.role})`);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('[TUTORIAL_API] Error completing tutorial:', error);
    res.status(500).json({ error: 'Failed to complete tutorial' });
  }
});

// Reset tutorial
router.post('/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = resetTutorialSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { userRole } = validation.data;
    
    const success = await TutorialService.resetTutorial(user.id, userRole);

    console.log(`[TUTORIAL_API] Tutorial reset for user ${user.id} (${userRole})`);
    res.json({ success });
  } catch (error) {
    console.error('[TUTORIAL_API] Error resetting tutorial:', error);
    res.status(500).json({ error: 'Failed to reset tutorial' });
  }
});

// Get tutorial analytics (admin only)
router.get('/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'SiteAdmin' && user.role !== 'Admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const analytics = await TutorialService.getTutorialAnalytics();

    console.log(`[TUTORIAL_API] Analytics retrieved by admin ${user.id}`);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('[TUTORIAL_API] Error getting tutorial analytics:', error);
    res.status(500).json({ error: 'Failed to get tutorial analytics' });
  }
});

export { router as tutorialRoutes };