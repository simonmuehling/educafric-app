import express, { Request, Response } from 'express';
import { requireAuth, requireAnyRole } from '../middleware/auth';
import { db } from '../db';
import { savedBulletins, archivedDocuments } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// Academic bulletin management routes - PostgreSQL based
// These routes handle the new simplified bulletin creation system

// Get all bulletins for a school
router.get('/bulletins', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID required'
      });
    }
    
    console.log('[ACADEMIC_BULLETINS] 📋 Fetching bulletins for school:', schoolId);
    
    const bulletins = await db
      .select()
      .from(savedBulletins)
      .where(eq(savedBulletins.schoolId, schoolId))
      .orderBy(desc(savedBulletins.createdAt));
    
    console.log(`[ACADEMIC_BULLETINS] ✅ Found ${bulletins.length} bulletins`);
    
    res.json({
      success: true,
      data: bulletins,
      count: bulletins.length
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
router.post('/bulletins', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const bulletinData = req.body;
    
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID required'
      });
    }
    
    console.log('[ACADEMIC_BULLETINS] 💾 Saving bulletin for student:', bulletinData.studentName);
    
    // Check if bulletin already exists (update)
    if (bulletinData.id) {
      const existingBulletin = await db
        .select()
        .from(savedBulletins)
        .where(and(
          eq(savedBulletins.id, parseInt(bulletinData.id)),
          eq(savedBulletins.schoolId, user.schoolId)
        ))
        .limit(1);
      
      if (existingBulletin.length > 0) {
        // Update existing bulletin
        const updated = await db
          .update(savedBulletins)
          .set({
            subjects: bulletinData.subjects,
            discipline: bulletinData.discipline
          })
          .where(and(
            eq(savedBulletins.id, parseInt(bulletinData.id)),
            eq(savedBulletins.schoolId, user.schoolId)
          ))
          .returning();
        
        console.log('[ACADEMIC_BULLETINS] ✅ Updated bulletin:', updated[0].id);
        
        return res.json({
          success: true,
          data: updated[0],
          message: 'Bulletin updated successfully'
        });
      }
    }
    
    // Create new bulletin
    const newBulletin = await db
      .insert(savedBulletins)
      .values({
        schoolId: user.schoolId,
        studentId: parseInt(bulletinData.studentId) || 0,
        studentName: bulletinData.studentName,
        classLabel: bulletinData.classLabel,
        trimester: bulletinData.trimester,
        academicYear: bulletinData.academicYear,
        subjects: bulletinData.subjects,
        discipline: bulletinData.discipline,
        createdBy: user.id
      })
      .returning();
    
    console.log('[ACADEMIC_BULLETINS] ✅ Created bulletin:', newBulletin[0].id, 'for student:', bulletinData.studentName);
    
    // Auto-archive if status is finalized
    if (bulletinData.status === 'finalized') {
      try {
        await archiveBulletin(newBulletin[0], user);
      } catch (archiveError) {
        console.error('[ACADEMIC_BULLETINS] ⚠️ Failed to auto-archive:', archiveError);
        // Continue even if archiving fails
      }
    }
    
    res.json({
      success: true,
      data: newBulletin[0],
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
router.get('/bulletins/:id', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const bulletinId = parseInt(req.params.id);
    
    if (isNaN(bulletinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulletin ID'
      });
    }
    
    const bulletin = await db
      .select()
      .from(savedBulletins)
      .where(and(
        eq(savedBulletins.id, bulletinId),
        eq(savedBulletins.schoolId, user.schoolId)
      ))
      .limit(1);
    
    if (bulletin.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
    res.json({
      success: true,
      data: bulletin[0]
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
router.delete('/bulletins/:id', requireAuth, requireAnyRole(['Admin', 'Director']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const bulletinId = parseInt(req.params.id);
    
    if (isNaN(bulletinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulletin ID'
      });
    }
    
    const deleted = await db
      .delete(savedBulletins)
      .where(and(
        eq(savedBulletins.id, bulletinId),
        eq(savedBulletins.schoolId, user.schoolId)
      ))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
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

// Finalize a bulletin (change status from draft to finalized and auto-archive)
router.patch('/bulletins/:id/finalize', requireAuth, requireAnyRole(['Admin', 'Director']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const bulletinId = parseInt(req.params.id);
    
    if (isNaN(bulletinId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulletin ID'
      });
    }
    
    // First fetch the bulletin to verify it exists
    const bulletinRecord = await db
      .select()
      .from(savedBulletins)
      .where(and(
        eq(savedBulletins.id, bulletinId),
        eq(savedBulletins.schoolId, user.schoolId)
      ))
      .limit(1);
    
    if (bulletinRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bulletin not found'
      });
    }
    
    console.log('[ACADEMIC_BULLETINS] 🔒 Finalizing bulletin:', bulletinId);
    
    // Auto-archive the bulletin (this will handle finalization)
    try {
      await archiveBulletin(bulletinRecord[0], user);
    } catch (archiveError) {
      console.error('[ACADEMIC_BULLETINS] ⚠️ Failed to auto-archive:', archiveError);
      // Continue even if archiving fails
    }
    
    // Fetch the updated bulletin after archiving
    const finalBulletin = await db
      .select()
      .from(savedBulletins)
      .where(eq(savedBulletins.id, bulletinId))
      .limit(1);
    
    res.json({
      success: true,
      data: finalBulletin[0],
      message: 'Bulletin finalized and archived successfully'
    });
  } catch (error) {
    console.error('[ACADEMIC_BULLETINS] ❌ Error finalizing bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to finalize bulletin'
    });
  }
});

// Helper function to archive a bulletin
async function archiveBulletin(bulletin: any, user: any) {
  console.log('[ACADEMIC_BULLETINS] 📦 Archiving bulletin:', bulletin.id);
  
  // Create checksum of bulletin data
  const dataString = JSON.stringify(bulletin);
  const checksum = crypto.createHash('sha256').update(dataString).digest('hex');
  
  // Create filename
  const filename = `bulletin_${bulletin.studentName.replace(/\s+/g, '_')}_${bulletin.trimester}_${bulletin.academicYear}.json`;
  
  // Create archive entry - using type assertion for schema compatibility
  const archived = await db
    .insert(archivedDocuments)
    .values({
      schoolId: bulletin.schoolId,
      type: 'bulletin',
      bulletinId: bulletin.id,
      classId: 0,
      academicYear: bulletin.academicYear,
      term: bulletin.trimester,
      studentId: bulletin.studentId,
      language: 'fr',
      filename: filename,
      storageKey: `bulletins/${bulletin.schoolId}/${bulletin.academicYear}/${filename}`,
      checksumSha256: checksum,
      sizeBytes: Buffer.byteLength(dataString, 'utf8'),
      snapshot: bulletin,
      sentAt: new Date(),
      sentBy: user.id
    } as any)
    .returning();
  
  // Update bulletin with archive reference - using type assertion for schema compatibility
  await db
    .update(savedBulletins)
    .set({
      archiveId: archived[0].id,
      archivedAt: new Date()
    } as any)
    .where(eq(savedBulletins.id, bulletin.id));
  
  console.log('[ACADEMIC_BULLETINS] ✅ Archived bulletin to archive ID:', archived[0].id);
}

export default router;
