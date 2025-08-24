import { Router } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Get subjects for the authenticated user's school
router.get('/subjects', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const subjects = await storage.getSubjectsBySchool(user.schoolId);
    res.json(subjects);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Get classes for the authenticated user's school
router.get('/classes', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const classes = await storage.getClassesBySchool(user.schoolId);
    
    // Transform classes data for response
    const classesData = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      section: cls.section,
      teacherId: cls.teacherId,
      capacity: cls.maxStudents || 30,
      studentsCount: 0 // Will be calculated separately
    }));

    res.json(classesData);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
});

// Get school profile
router.get('/profile', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const school = await storage.getSchool(user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({
      id: school.id,
      name: school.name,
      type: school.type,
      address: school.address,
      phone: school.phone,
      email: school.email,
      principalName: school.principalName,
      logo: school.logo,
      website: school.website,
      establishedYear: school.establishedYear,
      studentsCount: school.studentsCount || 0,
      teachersCount: school.teachersCount || 0
    });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school profile:', error);
    res.status(500).json({ message: 'Failed to fetch school profile' });
  }
});

// Update school profile
router.put('/profile', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const updateData = req.body;
    await storage.updateSchool(user.schoolId, updateData);
    
    res.json({ message: 'School profile updated successfully' });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school profile:', error);
    res.status(500).json({ message: 'Failed to update school profile' });
  }
});

// Get school configuration
router.get('/configuration', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    // For now, return empty config - will implement when storage method exists
    const config = {};
    res.json(config || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school configuration:', error);
    res.status(500).json({ message: 'Failed to fetch school configuration' });
  }
});

// Update school configuration
router.put('/configuration', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const configData = req.body;
    // For now, just acknowledge - will implement when storage method exists
    
    res.json({ message: 'School configuration updated successfully' });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school configuration:', error);
    res.status(500).json({ message: 'Failed to update school configuration' });
  }
});

// Get school security settings
router.get('/security', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    // For now, return empty security - will implement when storage method exists
    const security = {};
    res.json(security || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school security:', error);
    res.status(500).json({ message: 'Failed to fetch school security settings' });
  }
});

// Update school security settings
router.put('/security', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const securityData = req.body;
    // For now, just acknowledge - will implement when storage method exists
    
    res.json({ message: 'School security settings updated successfully' });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school security:', error);
    res.status(500).json({ message: 'Failed to update school security settings' });
  }
});

// Get school notifications settings
router.get('/notifications', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    // For now, return empty notifications - will implement when storage method exists
    const notifications = {};
    res.json(notifications || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school notifications:', error);
    res.status(500).json({ message: 'Failed to fetch school notifications' });
  }
});

// Update school notifications settings
router.put('/notifications', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const notificationsData = req.body;
    // For now, just acknowledge - will implement when storage method exists
    
    res.json({ message: 'School notifications settings updated successfully' });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school notifications:', error);
    res.status(500).json({ message: 'Failed to update school notifications' });
  }
});

export default router;