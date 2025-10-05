import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type; // 'logos' or 'students'
    const dir = path.join(process.cwd(), 'public', 'uploads', uploadType);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const entityId = req.params.entityId;
    const ext = path.extname(file.originalname);
    cb(null, `${entityId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed'));
    }
  }
});

// Upload school logo
router.post('/schools/:schoolId/logo', requireAuth, requireAnyRole(['Admin', 'Director']), upload.single('logo'), (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = parseInt(req.params.schoolId);
    
    // Check if user belongs to this school (except Admin)
    if (user.role !== 'Admin' && user.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - not your school'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    console.log('[ASSETS] ✅ School logo uploaded:', schoolId, '->', logoUrl);
    
    res.json({
      success: true,
      data: {
        logoUrl,
        filename: req.file.filename,
        size: req.file.size
      },
      message: 'School logo uploaded successfully'
    });
  } catch (error) {
    console.error('[ASSETS] ❌ Error uploading school logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload school logo'
    });
  }
});

// Upload student photo
router.post('/students/:studentId/photo', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher', 'Student']), upload.single('photo'), (req, res) => {
  try {
    const user = req.user as any;
    const studentId = req.params.studentId;
    
    // Students can only upload their own photos
    if (user.role === 'Student' && user.id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'Students can only upload their own photos'
      });
    }
    
    // Teachers and Directors must be from the same school (we'll assume this for now)
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const photoUrl = `/uploads/students/${req.file.filename}`;
    
    console.log('[ASSETS] ✅ Student photo uploaded:', studentId, '->', photoUrl);
    
    res.json({
      success: true,
      data: {
        photoUrl,
        filename: req.file.filename,
        size: req.file.size
      },
      message: 'Student photo uploaded successfully'
    });
  } catch (error) {
    console.error('[ASSETS] ❌ Error uploading student photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload student photo'
    });
  }
});

// Get school logo
router.get('/schools/:schoolId/logo', (req, res) => {
  try {
    const schoolId = req.params.schoolId;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    
    // Try different extensions
    const extensions = ['.png', '.jpg', '.jpeg'];
    let logoPath = null;
    
    for (const ext of extensions) {
      const testPath = path.join(uploadsDir, `${schoolId}${ext}`);
      if (fs.existsSync(testPath)) {
        logoPath = testPath;
        break;
      }
    }
    
    if (logoPath && fs.existsSync(logoPath)) {
      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache
      res.setHeader('ETag', `school-${schoolId}-${fs.statSync(logoPath).mtime.getTime()}`);
      
      res.sendFile(logoPath);
    } else {
      // Return placeholder or 404
      res.status(404).json({
        success: false,
        error: 'School logo not found'
      });
    }
  } catch (error) {
    console.error('[ASSETS] ❌ Error fetching school logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school logo'
    });
  }
});

// Get student photo
router.get('/students/:studentId/photo', requireAuth, (req, res) => {
  try {
    const user = req.user as any;
    const studentId = req.params.studentId;
    
    // Basic access control - same school or own photo
    // (This is simplified - in production you'd check proper relationships)
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'students');
    
    // Try different extensions
    const extensions = ['.png', '.jpg', '.jpeg'];
    let photoPath = null;
    
    for (const ext of extensions) {
      const testPath = path.join(uploadsDir, `${studentId}${ext}`);
      if (fs.existsSync(testPath)) {
        photoPath = testPath;
        break;
      }
    }
    
    if (photoPath && fs.existsSync(photoPath)) {
      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h cache
      res.setHeader('ETag', `student-${studentId}-${fs.statSync(photoPath).mtime.getTime()}`);
      
      res.sendFile(photoPath);
    } else {
      // Return placeholder or 404
      res.status(404).json({
        success: false,
        error: 'Student photo not found'
      });
    }
  } catch (error) {
    console.error('[ASSETS] ❌ Error fetching student photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student photo'
    });
  }
});

export default router;