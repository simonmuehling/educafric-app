import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'homework');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-userid-random-originalname
    const userId = (req as any).user?.id || 'anonymous';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${timestamp}-${userId}-${randomString}-${cleanBaseName}${extension}`;
    cb(null, filename);
  }
});

// File filter for homework submissions
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types for homework submissions
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    // Audio/Video for language assignments
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer upload
export const homeworkUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 5 // Maximum 5 files per submission
  }
});

// Helper function to get file info from multer file
export const getFileInfo = (file: Express.Multer.File) => {
  const fileUrl = `/uploads/homework/${file.filename}`;
  
  // Determine file type based on mimetype
  let type: 'image' | 'document' | 'video' | 'audio' | 'other' = 'other';
  
  if (file.mimetype.startsWith('image/')) {
    type = 'image';
  } else if (file.mimetype.startsWith('video/')) {
    type = 'video';
  } else if (file.mimetype.startsWith('audio/')) {
    type = 'audio';
  } else if (
    file.mimetype.includes('pdf') ||
    file.mimetype.includes('document') ||
    file.mimetype.includes('sheet') ||
    file.mimetype.includes('presentation') ||
    file.mimetype.includes('text')
  ) {
    type = 'document';
  }

  return {
    type,
    url: fileUrl,
    name: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString()
  };
};

// Helper function to delete file
export const deleteFile = (filename: string): boolean => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    return false;
  }
};

// Helper function to get file size
export const getFileSize = (filename: string): number => {
  try {
    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

// Helper function to cleanup old files (run daily)
export const cleanupOldFiles = (daysOld: number = 30) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.birthtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
};