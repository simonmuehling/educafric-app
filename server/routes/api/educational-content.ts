import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configuration multer pour upload de fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'educational-content');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common educational file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/html',
      'video/mp4', 'audio/mpeg', 'audio/wav'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
  }
});

// Create educational content
router.post('/', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content data is required'
      });
    }

    const contentData = JSON.parse(content);
    const user = (req as any).user;

    // Validate required fields
    if (!contentData.title || !contentData.description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Process uploaded files
    const fileUrls = files ? files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/educational-content/${file.filename}`
    })) : [];

    // Create educational content record
    const educationalContent = {
      id: Date.now(), // Temporary ID generation
      title: contentData.title,
      description: contentData.description,
      type: contentData.type || 'lesson',
      subject: contentData.subject,
      level: contentData.level,
      duration: contentData.duration || 60,
      objectives: contentData.objectives || '',
      prerequisites: contentData.prerequisites || '',
      teacherId: user.id,
      teacherName: user.firstName + ' ' + user.lastName,
      schoolId: user.schoolId,
      files: fileUrls,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: 'school', // school, public, private
      downloadCount: 0,
      rating: 0,
      tags: contentData.tags || []
    };

    // In a real implementation, save to database
    console.log('[EDUCATIONAL_CONTENT] Content created:', {
      id: educationalContent.id,
      title: educationalContent.title,
      teacher: educationalContent.teacherName,
      school: educationalContent.schoolId,
      filesCount: fileUrls.length
    });

    res.json({
      success: true,
      message: 'Educational content created successfully',
      content: educationalContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create educational content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get educational content
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, subject, level, teacherId } = req.query;

    // Mock data for demonstration
    const mockContent = [
      {
        id: 1,
        title: "Introduction aux Fractions",
        description: "Cours complet sur les fractions pour les élèves de 6ème",
        type: "lesson",
        subject: "mathematiques",
        level: "6eme",
        duration: 45,
        objectives: "Comprendre le concept de fraction, savoir lire et écrire des fractions simples",
        prerequisites: "Connaissance des nombres entiers",
        teacherId: user.id,
        teacherName: user.firstName + ' ' + user.lastName,
        schoolId: user.schoolId,
        files: [
          { filename: "fractions-intro.pdf", originalName: "Introduction aux fractions.pdf", url: "/uploads/educational-content/fractions-intro.pdf" }
        ],
        status: "published",
        createdAt: "2025-08-20T10:00:00Z",
        updatedAt: "2025-08-20T10:00:00Z",
        visibility: "school",
        downloadCount: 15,
        rating: 4.5,
        tags: ["mathematiques", "fractions", "6eme"]
      },
      {
        id: 2,
        title: "Exercices sur les Verbes",
        description: "Série d'exercices sur la conjugaison des verbes du 1er groupe",
        type: "exercise",
        subject: "francais",
        level: "5eme",
        duration: 30,
        objectives: "Maîtriser la conjugaison des verbes du 1er groupe au présent",
        prerequisites: "Connaissance des pronoms personnels",
        teacherId: user.id,
        teacherName: user.firstName + ' ' + user.lastName,
        schoolId: user.schoolId,
        files: [],
        status: "draft",
        createdAt: "2025-08-22T14:30:00Z",
        updatedAt: "2025-08-22T14:30:00Z",
        visibility: "school",
        downloadCount: 3,
        rating: 0,
        tags: ["francais", "conjugaison", "verbes"]
      }
    ];

    // Filter content based on query parameters
    let filteredContent = mockContent;
    
    if (type) filteredContent = filteredContent.filter(c => c.type === type);
    if (subject) filteredContent = filteredContent.filter(c => c.subject === subject);
    if (level) filteredContent = filteredContent.filter(c => c.level === level);
    if (teacherId) filteredContent = filteredContent.filter(c => c.teacherId.toString() === teacherId);

    res.json({
      success: true,
      content: filteredContent,
      total: filteredContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content'
    });
  }
});

// Get specific educational content
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Mock response for specific content
    const mockContent = {
      id: parseInt(id),
      title: "Introduction aux Fractions",
      description: "Cours complet sur les fractions pour les élèves de 6ème",
      type: "lesson",
      subject: "mathematiques",
      level: "6eme",
      duration: 45,
      objectives: "Comprendre le concept de fraction, savoir lire et écrire des fractions simples",
      prerequisites: "Connaissance des nombres entiers",
      teacherId: user.id,
      teacherName: user.firstName + ' ' + user.lastName,
      schoolId: user.schoolId,
      files: [
        { filename: "fractions-intro.pdf", originalName: "Introduction aux fractions.pdf", url: "/uploads/educational-content/fractions-intro.pdf" }
      ],
      status: "published",
      createdAt: "2025-08-20T10:00:00Z",
      updatedAt: "2025-08-20T10:00:00Z",
      visibility: "school",
      downloadCount: 15,
      rating: 4.5,
      tags: ["mathematiques", "fractions", "6eme"]
    };

    res.json({
      success: true,
      content: mockContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch specific error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content'
    });
  }
});

export default router;