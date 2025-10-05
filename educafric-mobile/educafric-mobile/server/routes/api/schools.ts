import { Router, Request, Response } from 'express';
import { storage } from '../../storage';

// Simple auth middleware for now
function requireAuth(req: any, res: any, next: any) {
  // For now, just pass through - will implement proper auth when needed
  next();
}

// Extended request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Get subjects for the authenticated user's school
router.get('/subjects', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const subjects = await storage.getSchoolSubjects(user.schoolId);
    res.json(subjects);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Get classes for the authenticated user's school
router.get('/classes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
      // Default values for missing properties  
      principalName: 'Non défini', // TODO: Add to schema when available
      logo: school.logoUrl || null,
      website: null, // TODO: Add to schema when available
      establishedYear: new Date().getFullYear(), // TODO: Add to schema when available
      studentsCount: 0, // Will be calculated separately
      teachersCount: 0 // Will be calculated separately
    });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school profile:', error);
    res.status(500).json({ message: 'Failed to fetch school profile' });
  }
});

// Update school profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
router.get('/configuration', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const config = await storage.getSchoolConfiguration(user.schoolId);
    res.json(config || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school configuration:', error);
    res.status(500).json({ message: 'Failed to fetch school configuration' });
  }
});

// Update school configuration
router.put('/configuration', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const configData = req.body;
    const success = await storage.updateSchoolConfiguration(user.schoolId, configData);
    
    if (success) {
      res.json({ message: 'School configuration updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update school configuration' });
    }
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school configuration:', error);
    res.status(500).json({ message: 'Failed to update school configuration' });
  }
});

// Get school security settings
router.get('/security', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const security = await storage.getSchoolSecuritySettings(user.schoolId);
    res.json(security || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school security:', error);
    res.status(500).json({ message: 'Failed to fetch school security settings' });
  }
});

// Update school security settings
router.put('/security', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const securityData = req.body;
    const success = await storage.updateSchoolSecuritySettings(user.schoolId, securityData);
    
    if (success) {
      res.json({ message: 'School security settings updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update school security settings' });
    }
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school security:', error);
    res.status(500).json({ message: 'Failed to update school security settings' });
  }
});

// Get school notifications settings
router.get('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const notifications = await storage.getSchoolNotificationSettings(user.schoolId);
    res.json(notifications || {});
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching school notifications:', error);
    res.status(500).json({ message: 'Failed to fetch school notifications' });
  }
});

// Update school notifications settings
router.put('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const notificationsData = req.body;
    const success = await storage.updateSchoolNotificationSettings(user.schoolId, notificationsData);
    
    if (success) {
      res.json({ message: 'School notifications settings updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update school notifications settings' });
    }
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error updating school notifications:', error);
    res.status(500).json({ message: 'Failed to update school notifications' });
  }
});

// === TEACHER ABSENCE ROUTES ===

// Get teacher absences for school
router.get('/teacher-absences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const absences = await storage.getTeacherAbsences(user.schoolId);
    res.json(absences);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching teacher absences:', error);
    res.status(500).json({ message: 'Failed to fetch teacher absences' });
  }
});

// Get teacher absence statistics
router.get('/teacher-absences-stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const stats = await storage.getTeacherAbsenceStats(user.schoolId);
    res.json(stats);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching absence stats:', error);
    res.status(500).json({ message: 'Failed to fetch absence statistics' });
  }
});

// Create new teacher absence
router.post('/teacher-absences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const absenceData = {
      ...req.body,
      schoolId: user.schoolId,
      reportedBy: user.id
    };

    const newAbsence = await storage.createTeacherAbsence(absenceData);
    
    // TODO: Send notifications via unified messaging system
    console.log(`[TEACHER_ABSENCE] New absence created: ${newAbsence.id}`);
    
    res.status(201).json({
      message: 'Teacher absence created successfully',
      absence: newAbsence
    });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error creating teacher absence:', error);
    res.status(500).json({ message: 'Failed to create teacher absence' });
  }
});

// Perform action on teacher absence
router.post('/teacher-absences/:absenceId/actions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const absenceId = parseInt(req.params.absenceId);
    const { actionType, actionData } = req.body;

    const result = await storage.performAbsenceAction(absenceId, actionType, actionData);
    
    if (result.success) {
      // TODO: Send notifications via unified messaging system based on action
      if (actionType === 'assign_substitute' || actionType === 'notify_parents') {
        console.log(`[TEACHER_ABSENCE] Should send notifications for action: ${actionType}`);
      }
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error performing absence action:', error);
    res.status(500).json({ message: 'Failed to perform action' });
  }
});

// Get available substitute teachers
router.get('/substitute-teachers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const substitutes = await storage.getAvailableSubstitutes(user.schoolId);
    res.json(substitutes);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching substitute teachers:', error);
    res.status(500).json({ message: 'Failed to fetch substitute teachers' });
  }
});

// Assign substitute teacher to absence
router.post('/teacher-absences/assign-replacement', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const { absenceId, replacementTeacherId } = req.body;
    
    const result = await storage.assignSubstitute(absenceId, replacementTeacherId);
    
    if (result.success) {
      // TODO: Send notifications to all affected parties
      console.log(`[TEACHER_ABSENCE] Substitute assigned successfully: ${replacementTeacherId}`);
    }
    
    res.json({
      message: 'Substitute teacher assigned successfully',
      ...result
    });
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error assigning substitute:', error);
    res.status(500).json({ message: 'Failed to assign substitute teacher' });
  }
});

// Get absence reports
router.get('/teacher-absence-reports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const { teacherId } = req.query;
    const reports = await storage.getAbsenceReports(
      teacherId ? parseInt(teacherId as string) : undefined, 
      user.schoolId
    );
    
    res.json(reports);
  } catch (error: any) {
    console.error('[SCHOOLS_API] Error fetching absence reports:', error);
    res.status(500).json({ message: 'Failed to fetch absence reports' });
  }
});

export default router;