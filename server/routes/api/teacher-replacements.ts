// ===== TEACHER REPLACEMENTS API ROUTES =====

import express from 'express';
import { requireAuth, requireAnyRole } from '../../middleware/auth';
import { teacherReplacementService } from '../../services/teacherReplacementService';

const router = express.Router();

// Get all absences with replacements for a school
router.get('/absences', requireAuth, requireAnyRole(['Director', 'Admin']), async (req, res) => {
  try {
    const schoolId = (req.user as any).schoolId;
    const absences = await teacherReplacementService.getAbsencesWithReplacements(schoolId);
    res.json(absences);
  } catch (error) {
    console.error('[TeacherReplacements] Error getting absences:', error);
    res.status(500).json({ error: 'Failed to get absences' });
  }
});

// Get pending replacements
router.get('/replacements/pending', requireAuth, requireAnyRole(['Director', 'Admin']), async (req, res) => {
  try {
    const schoolId = (req.user as any).schoolId;
    const pending = await teacherReplacementService.getPendingReplacements(schoolId);
    res.json(pending);
  } catch (error) {
    console.error('[TeacherReplacements] Error getting pending replacements:', error);
    res.status(500).json({ error: 'Failed to get pending replacements' });
  }
});

// Create a teacher absence
router.post('/absences', requireAuth, requireAnyRole(['Director', 'Admin', 'Teacher']), async (req, res) => {
  try {
    // Security: Override teacherId and schoolId from authenticated user
    const user = req.user as any;
    const absenceData = {
      ...req.body,
      teacherId: user.role === 'Teacher' ? user.id : req.body.teacherId,
      schoolId: user.schoolId
    };
    
    const absence = await teacherReplacementService.createAbsence(absenceData);
    res.status(201).json(absence);
  } catch (error) {
    console.error('[TeacherReplacements] Error creating absence:', error);
    res.status(500).json({ error: 'Failed to create absence' });
  }
});

// Assign replacement teacher
router.post('/replacements/:id/assign', requireAuth, requireAnyRole(['Director', 'Admin']), async (req, res) => {
  try {
    const replacementId = parseInt(req.params.id);
    const { replacementTeacherId } = req.body;
    const user = req.user as any;
    
    if (!replacementTeacherId) {
      return res.status(400).json({ error: 'replacementTeacherId is required' });
    }
    
    const result = await teacherReplacementService.assignReplacement(replacementId, replacementTeacherId, user.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Replacement not found or already assigned' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('[TeacherReplacements] Error assigning replacement:', error);
    res.status(500).json({ error: 'Failed to assign replacement' });
  }
});

// Confirm replacement
router.post('/replacements/:id/confirm', requireAuth, requireAnyRole(['Teacher']), async (req, res) => {
  try {
    const replacementId = parseInt(req.params.id);
    const user = req.user as any;
    
    const result = await teacherReplacementService.confirmReplacement(replacementId, user.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Replacement not found or already confirmed' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('[TeacherReplacements] Error confirming replacement:', error);
    res.status(500).json({ error: 'Failed to confirm replacement' });
  }
});

export default router;
