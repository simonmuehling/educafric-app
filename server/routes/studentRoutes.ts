import { Router } from 'express';
import { requireAuth } from '../middleware/errorHandler';
import { storage } from '../storage';

const router = Router();

// GET /api/student/library - Student library/progress data
router.get('/library', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock library/progress data for demo
    const libraryData = [
      {
        subject: 'Mathématiques',
        currentGrade: 16.5,
        previousGrade: 15.2,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 12,
          completed: 10,
          average: 16.2
        }
      },
      {
        subject: 'Français',
        currentGrade: 14.8,
        previousGrade: 15.1,
        trend: 'down',
        goal: 16.0,
        assignments: {
          total: 8,
          completed: 7,
          average: 14.5
        }
      },
      {
        subject: 'Sciences',
        currentGrade: 15.9,
        previousGrade: 15.9,
        trend: 'stable',
        goal: 16.5,
        assignments: {
          total: 10,
          completed: 9,
          average: 15.7
        }
      },
      {
        subject: 'Histoire',
        currentGrade: 17.2,
        previousGrade: 16.8,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 6,
          completed: 6,
          average: 17.1
        }
      }
    ];

    res.json({
      success: true,
      data: libraryData,
      message: 'Library data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library data'
    });
  }
});

// GET /api/student/achievements - Student achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock achievements data
    const achievements = [
      {
        id: 1,
        title: 'Excellent Student',
        description: 'Maintained average above 16/20',
        icon: '🏆',
        date: '2025-01-15',
        points: 100
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: '95% attendance rate this term',
        icon: '📅',
        date: '2025-01-10',
        points: 75
      },
      {
        id: 3,
        title: 'Math Champion',
        description: 'Top score in mathematics',
        icon: '🔢',
        date: '2025-01-05',
        points: 80
      }
    ];

    res.json({
      success: true,
      data: achievements,
      message: 'Achievements retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
});

export default router;