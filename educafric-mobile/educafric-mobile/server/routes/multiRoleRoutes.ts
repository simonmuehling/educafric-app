import { Router } from 'express';
import { MultiRoleService } from '../services/multiRoleService';
// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};
import { storage } from '../storage';

const router = Router();

// Detect potential roles based on phone number during registration
router.post('/detect-roles', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const detection = await MultiRoleService.detectRolesByPhone(phone);
    res.json(detection);
  } catch (error) {
    console.error('[MULTI_ROLE] Role detection error:', error);
    res.status(500).json({ error: 'Failed to detect roles' });
  }
});

// Register user with multiple roles
router.post('/register-multi-role', async (req, res) => {
  try {
    const { userData, selectedRoles } = req.body;
    
    if (!userData || !selectedRoles || selectedRoles.length === 0) {
      return res.status(400).json({ error: 'User data and selected roles are required' });
    }
    
    const user = await MultiRoleService.registerMultiRoleUser(userData, selectedRoles);
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        secondaryRoles: user.secondaryRoles,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('[MULTI_ROLE] Multi-role registration error:', error);
    res.status(500).json({ error: 'Failed to register multi-role user' });
  }
});

// Get available schools for a teacher (multi-school support)
router.get('/teacher-schools', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const schools = await MultiRoleService.getTeacherSchools(userId);
    res.json({ schools });
  } catch (error) {
    console.error('[MULTI_ROLE] Teacher schools error:', error);
    res.status(500).json({ error: 'Failed to get teacher schools' });
  }
});

// Switch active school for a teacher
router.post('/switch-school', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { schoolId } = req.body;
    
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }
    
    const success = await MultiRoleService.switchTeacherActiveSchool(userId, parseInt(schoolId));
    
    if (success) {
      res.json({ success: true, message: 'School switched successfully' });
    } else {
      res.status(400).json({ error: 'Failed to switch school. User may not have access to this school.' });
    }
  } catch (error) {
    console.error('[MULTI_ROLE] School switch error:', error);
    res.status(500).json({ error: 'Failed to switch school' });
  }
});

// Add a new role to existing user
router.post('/add-role', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { role, schoolId, description, metadata } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const affiliation = await MultiRoleService.addRoleAffiliation(
      userId, 
      role, 
      schoolId, 
      description, 
      metadata
    );
    
    res.json({ 
      success: true, 
      affiliation,
      message: 'Role added successfully' 
    });
  } catch (error) {
    console.error('[MULTI_ROLE] Add role error:', error);
    res.status(500).json({ error: 'Failed to add role' });
  }
});

// Get all roles for current user
router.get('/user-roles', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await storage.getUserById(userId);
    const affiliations = await MultiRoleService.getUserRoleAffiliations(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      primaryRole: user.role,
      activeRole: user.activeRole || user.role,
      secondaryRoles: user.secondaryRoles || [],
      affiliations: affiliations.map(aff => ({
        id: aff.id,
        role: aff.role,
        schoolId: aff.schoolId,
        description: aff.description,
        status: aff.status,
        metadata: aff.metadata
      }))
    });
  } catch (error) {
    console.error('[MULTI_ROLE] Get user roles error:', error);
    res.status(500).json({ error: 'Failed to get user roles' });
  }
});

// Switch active role
router.post('/switch-role', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { newRole } = req.body;
    
    if (!newRole) {
      return res.status(400).json({ error: 'New role is required' });
    }
    
    const success = await MultiRoleService.switchActiveRole(userId, newRole);
    
    if (success) {
      // Update session with new role
      (req.user as any).activeRole = newRole;
      res.json({ 
        success: true, 
        activeRole: newRole,
        message: 'Role switched successfully' 
      });
    } else {
      res.status(400).json({ error: 'User does not have permission for this role' });
    }
  } catch (error) {
    console.error('[MULTI_ROLE] Role switch error:', error);
    res.status(500).json({ error: 'Failed to switch role' });
  }
});

export default router;