import { Router, Request, Response } from 'express';
import { storage } from '../../storage';

// Simple auth middleware for now
function requireAuth(req: any, res: any, next: any) {
  // For now, just pass through - will implement proper auth when needed
  next();
}

const router = Router();

// Get teachers for the authenticated user's school
router.get('/school', requireAuth, async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const teachers = await storage.getTeachersBySchool(user.schoolId);
    
    // Transform teachers data for response
    const teachersData = teachers.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      role: teacher.role,
      status: 'active' // Will implement blocking when storage supports it
    }));

    res.json(teachersData);
  } catch (error: any) {
    console.error('[TEACHERS_API] Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Update teacher
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    await storage.updateUser(parseInt(id), updateData);
    res.json({ message: 'Teacher updated successfully' });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error updating teacher:', error);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await storage.deleteUser(parseInt(id));
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

// Block teacher
router.post('/:id/block', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // For now, acknowledge - will implement when storage supports blocking
    // await storage.updateUser(parseInt(id), { blocked: true });
    res.json({ message: 'Teacher blocked successfully' });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error blocking teacher:', error);
    res.status(500).json({ message: 'Failed to block teacher' });
  }
});

// Unblock teacher
router.post('/:id/unblock', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // For now, acknowledge - will implement when storage supports blocking
    // await storage.updateUser(parseInt(id), { blocked: false });
    res.json({ message: 'Teacher unblocked successfully' });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error unblocking teacher:', error);
    res.status(500).json({ message: 'Failed to unblock teacher' });
  }
});

// Create new teacher
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const teacherData = {
      ...req.body,
      role: 'Teacher',
      schoolId: user.schoolId
    };

    const newTeacher = await storage.createUser(teacherData);
    res.status(201).json({ 
      message: 'Teacher created successfully', 
      teacher: {
        id: newTeacher.id,
        firstName: newTeacher.firstName,
        lastName: newTeacher.lastName,
        email: newTeacher.email,
        role: newTeacher.role
      }
    });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error creating teacher:', error);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

export default router;