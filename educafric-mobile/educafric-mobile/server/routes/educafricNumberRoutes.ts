// ===== EDUCAFRIC NUMBER ROUTES =====
// API routes for EDUCAFRIC number management (Admin only for schools)

import { Router } from "express";
import { EducafricNumberService } from "../services/educafricNumberService";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// ===== ADMIN ROUTES FOR SCHOOL & COMMERCIAL EDUCAFRIC NUMBERS =====

// Get all school EDUCAFRIC numbers
router.get('/admin/educafric-numbers', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const numbers = await EducafricNumberService.getSchoolNumbers();
    res.json({ numbers });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error fetching school numbers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all commercial EDUCAFRIC numbers
router.get('/admin/educafric-numbers/commercial', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const numbers = await EducafricNumberService.getCommercialNumbers();
    res.json({ numbers });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error fetching commercial numbers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get counter statistics
router.get('/admin/educafric-numbers/stats', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const stats = await EducafricNumberService.getCounterStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new school EDUCAFRIC number
router.post('/admin/educafric-numbers', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user!.id;

    const record = await EducafricNumberService.createNumber({
      type: 'SC',
      entityType: 'school',
      issuedBy: userId,
      notes
    });

    res.json({ 
      success: true, 
      educafricNumber: record.educafricNumber,
      record 
    });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error creating school number:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new commercial EDUCAFRIC number
router.post('/admin/educafric-numbers/commercial', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user!.id;

    const record = await EducafricNumberService.createNumber({
      type: 'CO',
      entityType: 'user',
      issuedBy: userId,
      notes
    });

    res.json({ 
      success: true, 
      educafricNumber: record.educafricNumber,
      record 
    });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error creating commercial number:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update EDUCAFRIC number (status or notes)
router.patch('/admin/educafric-numbers/:id', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await EducafricNumberService.updateNumber(parseInt(id), {
      status,
      notes
    });

    res.json({ success: true, record: updated });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error updating number:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete/Revoke EDUCAFRIC number
router.delete('/admin/educafric-numbers/:id', requireAuth, requireRole('SiteAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    await EducafricNumberService.revokeNumber(parseInt(id));

    res.json({ success: true, message: 'EDUCAFRIC number deleted successfully' });
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error deleting number:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== PUBLIC ROUTE FOR SCHOOL SIGNUP VALIDATION =====

// Verify EDUCAFRIC number for school signup
router.post('/educafric-numbers/verify', async (req, res) => {
  try {
    const { educafricNumber } = req.body;

    if (!educafricNumber) {
      return res.status(400).json({ 
        valid: false, 
        message: 'EDUCAFRIC number is required' 
      });
    }

    const result = await EducafricNumberService.verifySchoolNumber(educafricNumber);

    res.json(result);
  } catch (error: any) {
    console.error('[EDUCAFRIC_NUMBERS] Error verifying number:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error verifying EDUCAFRIC number' 
    });
  }
});

export default router;
