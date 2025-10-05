// ===== SANCTIONS ROUTES =====
// API routes for disciplinary sanctions management

import express from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";
import { 
  insertSanctionSchema, 
  sanctionFormSchema, 
  SANCTION_TYPES, 
  SANCTION_SEVERITY, 
  SANCTION_STATUS 
} from "../../shared/schemas/sanctionsSchema";
import { z } from "zod";

const router = express.Router();

// Validation schemas for API endpoints
const sanctionParamsSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), "Invalid sanction ID")
});

const studentParamsSchema = z.object({
  studentId: z.string().refine((val) => !isNaN(Number(val)), "Invalid student ID")
});

const classParamsSchema = z.object({
  classId: z.string().refine((val) => !isNaN(Number(val)), "Invalid class ID")
});

const schoolParamsSchema = z.object({
  schoolId: z.string().refine((val) => !isNaN(Number(val)), "Invalid school ID")
});

const filtersSchema = z.object({
  sanctionType: z.enum(['conduct_warning', 'conduct_blame', 'exclusion_temporary', 'exclusion_permanent']).optional(),
  status: z.enum(['active', 'appealed', 'revoked', 'expired']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  academicYear: z.string().optional(),
  term: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

const revokeSanctionSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long")
});

const appealSanctionSchema = z.object({
  appealReason: z.string().min(1, "Appeal reason is required").max(500, "Appeal reason too long")
});

// === CRUD OPERATIONS ===

// GET /api/sanctions/:id - Get single sanction
router.get('/api/sanctions/:id', 
  requireAuth,
  async (req, res) => {
    try {
      const { id } = sanctionParamsSchema.parse(req.params);
      const sanctionId = parseInt(id);
      
      const sanction = await storage.getSanction(sanctionId);
      
      if (!sanction) {
        return res.status(404).json({ error: 'Sanction not found' });
      }
      
      // Check authorization - user must be director/teacher at the school
      const user = (req as any).user;
      if (user.role !== 'director' && user.role !== 'teacher') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      // Additional check: verify user has access to this school
      if (user.schoolId !== sanction.schoolId) {
        return res.status(403).json({ error: 'Access denied to this sanction' });
      }
      
      res.json(sanction);
    } catch (error) {
      console.error('[SANCTIONS_API] Error getting sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to get sanction' });
    }
  }
);

// POST /api/sanctions - Create new sanction
router.post('/api/sanctions',
  requireAuth,
  requireRole(['director', 'teacher']),
  async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Validate request body
      const sanctionData = sanctionFormSchema.parse({
        ...req.body,
        schoolId: user.schoolId, // Always use user's school
        issueBy: user.id // Always use current user as issuer
      });
      
      const newSanction = await storage.createSanction(sanctionData);
      
      console.log('[SANCTIONS_API] ✅ Sanction created:', newSanction.id, 'by user:', user.id);
      res.status(201).json(newSanction);
    } catch (error) {
      console.error('[SANCTIONS_API] Error creating sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid sanction data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create sanction' });
    }
  }
);

// PUT /api/sanctions/:id - Update sanction
router.put('/api/sanctions/:id',
  requireAuth,
  requireRole(['director', 'teacher']),
  async (req, res) => {
    try {
      const { id } = sanctionParamsSchema.parse(req.params);
      const sanctionId = parseInt(id);
      const user = (req as any).user;
      
      // Check if sanction exists and user has access
      const existingSanction = await storage.getSanction(sanctionId);
      if (!existingSanction) {
        return res.status(404).json({ error: 'Sanction not found' });
      }
      
      if (user.schoolId !== existingSanction.schoolId) {
        return res.status(403).json({ error: 'Access denied to this sanction' });
      }
      
      // Only allow certain fields to be updated
      const allowedUpdates = ['description', 'severity', 'status'];
      const updates = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      const updatedSanction = await storage.updateSanction(sanctionId, updates);
      
      console.log('[SANCTIONS_API] ✅ Sanction updated:', sanctionId, 'by user:', user.id);
      res.json(updatedSanction);
    } catch (error) {
      console.error('[SANCTIONS_API] Error updating sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update sanction' });
    }
  }
);

// DELETE /api/sanctions/:id - Delete sanction
router.delete('/api/sanctions/:id',
  requireAuth,
  requireRole(['director']), // Only directors can delete sanctions
  async (req, res) => {
    try {
      const { id } = sanctionParamsSchema.parse(req.params);
      const sanctionId = parseInt(id);
      const user = (req as any).user;
      
      // Check if sanction exists and user has access
      const existingSanction = await storage.getSanction(sanctionId);
      if (!existingSanction) {
        return res.status(404).json({ error: 'Sanction not found' });
      }
      
      if (user.schoolId !== existingSanction.schoolId) {
        return res.status(403).json({ error: 'Access denied to this sanction' });
      }
      
      await storage.deleteSanction(sanctionId);
      
      console.log('[SANCTIONS_API] ✅ Sanction deleted:', sanctionId, 'by user:', user.id);
      res.status(204).send();
    } catch (error) {
      console.error('[SANCTIONS_API] Error deleting sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to delete sanction' });
    }
  }
);

// === QUERY OPERATIONS ===

// GET /api/sanctions/student/:studentId - Get student sanctions
router.get('/api/sanctions/student/:studentId',
  requireAuth,
  async (req, res) => {
    try {
      const { studentId } = studentParamsSchema.parse(req.params);
      const filters = filtersSchema.parse(req.query);
      const user = (req as any).user;
      
      const studentIdNum = parseInt(studentId);
      
      // TODO: Add check to verify user has access to this student
      
      const sanctions = await storage.getStudentSanctions(studentIdNum, filters);
      
      console.log('[SANCTIONS_API] ✅ Retrieved', sanctions.length, 'sanctions for student:', studentIdNum);
      res.json(sanctions);
    } catch (error) {
      console.error('[SANCTIONS_API] Error getting student sanctions:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to get student sanctions' });
    }
  }
);

// GET /api/sanctions/class/:classId - Get class sanctions
router.get('/api/sanctions/class/:classId',
  requireAuth,
  requireRole(['director', 'teacher']),
  async (req, res) => {
    try {
      const { classId } = classParamsSchema.parse(req.params);
      const filters = filtersSchema.parse(req.query);
      const user = (req as any).user;
      
      const classIdNum = parseInt(classId);
      
      const sanctions = await storage.getClassSanctions(classIdNum, filters);
      
      console.log('[SANCTIONS_API] ✅ Retrieved', sanctions.length, 'sanctions for class:', classIdNum);
      res.json(sanctions);
    } catch (error) {
      console.error('[SANCTIONS_API] Error getting class sanctions:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to get class sanctions' });
    }
  }
);

// GET /api/sanctions/school/:schoolId - Get school sanctions  
router.get('/api/sanctions/school/:schoolId',
  requireAuth,
  requireRole(['director']),
  async (req, res) => {
    try {
      const { schoolId } = schoolParamsSchema.parse(req.params);
      const filters = filtersSchema.parse(req.query);
      const user = (req as any).user;
      
      const schoolIdNum = parseInt(schoolId);
      
      // Verify user has access to this school
      if (user.schoolId !== schoolIdNum) {
        return res.status(403).json({ error: 'Access denied to this school' });
      }
      
      const sanctions = await storage.getSchoolSanctions(schoolIdNum, filters);
      
      console.log('[SANCTIONS_API] ✅ Retrieved', sanctions.length, 'sanctions for school:', schoolIdNum);
      res.json(sanctions);
    } catch (error) {
      console.error('[SANCTIONS_API] Error getting school sanctions:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to get school sanctions' });
    }
  }
);

// GET /api/sanctions/school/:schoolId/type/:sanctionType - Get sanctions by type
router.get('/api/sanctions/school/:schoolId/type/:sanctionType',
  requireAuth,
  requireRole(['director', 'teacher']),
  async (req, res) => {
    try {
      const { schoolId } = schoolParamsSchema.parse(req.params);
      const { sanctionType } = z.object({
        sanctionType: z.enum(['conduct_warning', 'conduct_blame', 'exclusion_temporary', 'exclusion_permanent'])
      }).parse(req.params);
      
      const user = (req as any).user;
      const schoolIdNum = parseInt(schoolId);
      
      // Verify user has access to this school
      if (user.schoolId !== schoolIdNum) {
        return res.status(403).json({ error: 'Access denied to this school' });
      }
      
      const sanctions = await storage.getSanctionsByType(schoolIdNum, sanctionType);
      
      console.log('[SANCTIONS_API] ✅ Retrieved', sanctions.length, 'sanctions of type:', sanctionType);
      res.json(sanctions);
    } catch (error) {
      console.error('[SANCTIONS_API] Error getting sanctions by type:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to get sanctions by type' });
    }
  }
);

// === SPECIAL OPERATIONS ===

// POST /api/sanctions/:id/revoke - Revoke a sanction
router.post('/api/sanctions/:id/revoke',
  requireAuth,
  requireRole(['director']), // Only directors can revoke sanctions
  async (req, res) => {
    try {
      const { id } = sanctionParamsSchema.parse(req.params);
      const { reason } = revokeSanctionSchema.parse(req.body);
      const user = (req as any).user;
      
      const sanctionId = parseInt(id);
      
      // Check if sanction exists and user has access
      const existingSanction = await storage.getSanction(sanctionId);
      if (!existingSanction) {
        return res.status(404).json({ error: 'Sanction not found' });
      }
      
      if (user.schoolId !== existingSanction.schoolId) {
        return res.status(403).json({ error: 'Access denied to this sanction' });
      }
      
      if (existingSanction.status !== 'active') {
        return res.status(400).json({ error: 'Can only revoke active sanctions' });
      }
      
      const revokedSanction = await storage.revokeSanction(sanctionId, user.id, reason);
      
      console.log('[SANCTIONS_API] ✅ Sanction revoked:', sanctionId, 'by user:', user.id);
      res.json(revokedSanction);
    } catch (error) {
      console.error('[SANCTIONS_API] Error revoking sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to revoke sanction' });
    }
  }
);

// POST /api/sanctions/:id/appeal - Appeal a sanction
router.post('/api/sanctions/:id/appeal',
  requireAuth,
  async (req, res) => {
    try {
      const { id } = sanctionParamsSchema.parse(req.params);
      const { appealReason } = appealSanctionSchema.parse(req.body);
      const user = (req as any).user;
      
      const sanctionId = parseInt(id);
      
      // Check if sanction exists
      const existingSanction = await storage.getSanction(sanctionId);
      if (!existingSanction) {
        return res.status(404).json({ error: 'Sanction not found' });
      }
      
      // Only student or parent can appeal (TODO: implement parent relationship check)
      if (user.role !== 'student' && user.role !== 'parent') {
        return res.status(403).json({ error: 'Only students or parents can appeal sanctions' });
      }
      
      if (existingSanction.status !== 'active') {
        return res.status(400).json({ error: 'Can only appeal active sanctions' });
      }
      
      const appealedSanction = await storage.appealSanction(sanctionId, appealReason);
      
      console.log('[SANCTIONS_API] ✅ Sanction appealed:', sanctionId, 'by user:', user.id);
      res.json(appealedSanction);
    } catch (error) {
      console.error('[SANCTIONS_API] Error appealing sanction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to appeal sanction' });
    }
  }
);

// POST /api/sanctions/expire - Batch expire sanctions (admin/cron job)
router.post('/api/sanctions/expire',
  requireAuth,
  requireRole(['director', 'site_admin']),
  async (req, res) => {
    try {
      await storage.expireSanctions();
      
      console.log('[SANCTIONS_API] ✅ Batch sanction expiration completed');
      res.json({ message: 'Sanctions expired successfully' });
    } catch (error) {
      console.error('[SANCTIONS_API] Error expiring sanctions:', error);
      res.status(500).json({ error: 'Failed to expire sanctions' });
    }
  }
);

// GET /api/sanctions/enums - Get sanction enums for frontend
router.get('/api/sanctions/enums',
  requireAuth,
  async (req, res) => {
    res.json({
      sanctionTypes: Object.values(SANCTION_TYPES),
      severityLevels: Object.values(SANCTION_SEVERITY),
      statusOptions: Object.values(SANCTION_STATUS)
    });
  }
);

export default router;