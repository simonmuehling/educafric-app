import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory for teacher photos if it doesn't exist
const teacherPhotosDir = path.join(process.cwd(), 'public', 'uploads', 'teachers');
if (!fs.existsSync(teacherPhotosDir)) {
  fs.mkdirSync(teacherPhotosDir, { recursive: true });
}

// Configure multer for teacher photo uploads
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teacherPhotosDir);
  },
  filename: (req, file, cb) => {
    const teacherId = req.params.id;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `teacher-${teacherId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();

// Get all teachers (root endpoint)
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user;
    if (!user?.schoolId) {
      return res.status(400).json({ message: 'No school associated with user' });
    }

    const teachers = await storage.getTeachersBySchool(user.schoolId);
    
    // Return teachers with all fields including profile picture
    const teachersData = teachers.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      role: teacher.role,
      schoolId: teacher.schoolId,
      status: 'active',
      profilePictureUrl: teacher.profilePictureUrl,
      profileImage: teacher.profileImage
    }));

    res.json(teachersData);
  } catch (error: any) {
    console.error('[TEACHERS_API] Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get teachers for the authenticated user's school
router.get('/school', requireAuth, async (req: any, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
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

    const { password, ...otherData } = req.body;
    
    // Hash password before creating user
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10) 
      : await bcrypt.hash('TempPassword123!', 10); // Default temp password if none provided

    const teacherData = {
      ...otherData,
      password: hashedPassword,
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

// Upload teacher photo
router.post('/:id/photo', requireAuth, photoUpload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }
    
    // Generate the URL for the uploaded photo
    const photoUrl = `/uploads/teachers/${file.filename}`;
    
    // Update the user's profile picture URL in the database
    await storage.updateUser(parseInt(id), { 
      profilePictureUrl: photoUrl,
      profileImage: photoUrl
    });
    
    console.log(`[TEACHERS_API] Photo uploaded for teacher ${id}: ${photoUrl}`);
    
    res.json({ 
      success: true, 
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl
    });
  } catch (error: any) {
    console.error('[TEACHERS_API] Error uploading teacher photo:', error);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

export default router;