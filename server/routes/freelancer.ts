import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Get freelancer profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Freelancer role required.'
      });
    }

    const profile = await storage.getFreelancerProfile(user.id);
    
    res.json({
      success: true,
      profile: profile || {}
    });
  } catch (error) {
    console.error('[FREELANCER_API] Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch freelancer profile'
    });
  }
});

// Get freelancer students
router.get('/students', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Freelancer role required.'
      });
    }

    const students = await storage.getFreelancerStudents(user.id);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[FREELANCER_API] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch freelancer students'
    });
  }
});

// Get freelancer sessions
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Freelancer role required.'
      });
    }

    const sessions = await storage.getFreelancerSessions(user.id);
    
    res.json({
      success: true,
      sessions: sessions || []
    });
  } catch (error) {
    console.error('[FREELANCER_API] Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch freelancer sessions'
    });
  }
});

// Update freelancer profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Freelancer role required.'
      });
    }

    const updatedProfile = await storage.updateFreelancerProfile(user.id, req.body);
    
    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('[FREELANCER_API] Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update freelancer profile'
    });
  }
});

export default router;