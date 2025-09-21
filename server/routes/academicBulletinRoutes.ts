import express from 'express';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = express.Router();

// Academic bulletin management routes - simple and focused
// These routes handle the new simplified bulletin creation system

interface BulletinData {
  id?: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  trimester: string;
  academicYear: string;
  subjects: Array<{
    name: string;
    coefficient: number;
    grade: number;
    remark: string;
  }>;
  discipline: {
    absJ: number;
    absNJ: number;
    late: number;
    sanctions: number;
  };
  generalRemark: string;
  schoolId: number;
  createdBy: string;
  createdAt?: Date;
  status: 'draft' | 'finalized';
}

// In-memory storage for bulletins (replace with database later if needed)
const bulletins: Map<string, BulletinData> = new Map();

// Get all bulletins for a school
router.get('/bulletins', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    console.log('[ACADEMIC_BULLETINS] 📋 Fetching bulletins for school:', schoolId);
    
    const schoolBulletins = Array.from(bulletins.values())
      .filter(bulletin => bulletin.schoolId === schoolId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    res.json({
      success: true,
      data: schoolBulletins,
      count: schoolBulletins.length
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error fetching bulletins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bulletins'
    });
  }
});

// Save a bulletin (create or update)
router.post('/bulletins', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), (req, res) => {
  try {
    const user = req.user as any;
    const bulletinData: Partial<BulletinData> = req.body;
    
    // Generate ID if creating new bulletin
    const bulletinId = bulletinData.id || `bulletin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const bulletin: BulletinData = {
      ...bulletinData,
      id: bulletinId,
      schoolId: user.schoolId,
      createdBy: user.email,
      createdAt: new Date(),
      status: bulletinData.status || 'draft'
    } as BulletinData;
    
    bulletins.set(bulletinId, bulletin);
    
    console.log('[ACADEMIC_BULLETINS] ✅ Saved bulletin:', bulletinId, 'for student:', bulletin.studentName);
    
    res.json({
      success: true,
      data: bulletin,
      message: 'Bulletin saved successfully'
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error saving bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save bulletin'
    });
  }
});

// Get a specific bulletin
router.get('/bulletins/:id', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), (req, res) => {
  try {
    const user = req.user as any;
    const bulletinId = req.params.id;
    
    const bulletin = bulletins.get(bulletinId);
    
    if (!bulletin) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
    // Check if user has access to this bulletin (same school)
    if (bulletin.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: bulletin
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error fetching bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bulletin'
    });
  }
});

// Delete a bulletin
router.delete('/bulletins/:id', requireAuth, requireAnyRole(['Admin', 'Director']), (req, res) => {
  try {
    const user = req.user as any;
    const bulletinId = req.params.id;
    
    const bulletin = bulletins.get(bulletinId);
    
    if (!bulletin) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
    // Check if user has access to this bulletin (same school)
    if (bulletin.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    bulletins.delete(bulletinId);
    
    console.log('[ACADEMIC_BULLETINS] 🗑️ Deleted bulletin:', bulletinId);
    
    res.json({
      success: true,
      message: 'Bulletin deleted successfully'
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error deleting bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bulletin'
    });
  }
});

// Finalize a bulletin (change status from draft to finalized)
router.patch('/bulletins/:id/finalize', requireAuth, requireAnyRole(['Admin', 'Director']), (req, res) => {
  try {
    const user = req.user as any;
    const bulletinId = req.params.id;
    
    const bulletin = bulletins.get(bulletinId);
    
    if (!bulletin) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
    // Check if user has access to this bulletin (same school)
    if (bulletin.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    bulletin.status = 'finalized';
    bulletins.set(bulletinId, bulletin);
    
    console.log('[ACADEMIC_BULLETINS] 🔒 Finalized bulletin:', bulletinId);
    
    res.json({
      success: true,
      data: bulletin,
      message: 'Bulletin finalized successfully'
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error finalizing bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to finalize bulletin'
    });
  }
});

export default router;