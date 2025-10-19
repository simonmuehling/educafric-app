// Offline Sync Routes
// Handles synchronization of offline actions for poor connectivity areas

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { attendance, grades, homework } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Zod schemas for sync validation
const attendanceSyncSchema = z.object({
  studentId: z.number().int().positive(),
  classId: z.number().int().positive(),
  schoolId: z.number().int().positive(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional().nullable(),
  timeIn: z.string().datetime().optional().nullable(),
  timeOut: z.string().datetime().optional().nullable()
});

const gradeSyncSchema = z.object({
  studentId: z.number().int().positive(),
  classId: z.number().int().positive(),
  schoolId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  grade: z.number().min(0),
  term: z.string().min(1),
  academicYear: z.string().min(1),
  examType: z.string().optional(),
  coefficient: z.number().min(0).optional()
});

const homeworkSyncSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  classId: z.number().int().positive(),
  schoolId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  instructions: z.string().optional().nullable()
});

// Sync attendance records with idempotency
router.post('/attendance', requireAuth, async (req, res) => {
  try {
    // Check if user has permission to mark attendance
    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Zod validation
    const validation = attendanceSyncSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { studentId, classId, schoolId, date, status, notes, timeIn, timeOut } = validation.data;
    const userId = req.user!.id;

    // Check for existing record (idempotency) - same student, class, and date
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, studentId),
          eq(attendance.classId, classId),
          eq(attendance.date, new Date(date))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(attendance)
        .set({ 
          status, 
          markedBy: userId,
          notes: notes || null,
          timeIn: timeIn ? new Date(timeIn) : null,
          timeOut: timeOut ? new Date(timeOut) : null,
          updatedAt: new Date()
        })
        .where(eq(attendance.id, existing[0].id))
        .returning();
      
      console.log('[SYNC] Attendance updated (idempotent):', existing[0].id);
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new attendance record
    const newAttendance = await db.insert(attendance).values({
      studentId,
      classId,
      schoolId,
      date: new Date(date),
      status,
      markedBy: userId,
      notes: notes || null,
      timeIn: timeIn ? new Date(timeIn) : null,
      timeOut: timeOut ? new Date(timeOut) : null
    }).returning();

    console.log('[SYNC] Attendance created:', newAttendance[0].id);
    res.json({ success: true, data: newAttendance[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Attendance sync error:', error);
    res.status(500).json({ error: 'Failed to sync attendance' });
  }
});

// Update attendance record
router.put('/attendance/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user!.id;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await db
      .update(attendance)
      .set({ 
        status, 
        notes: notes || null,
        markedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(attendance.id, parseInt(id)))
      .returning();

    console.log('[SYNC] Attendance updated:', id);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('[SYNC] Attendance update error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Sync grade records with idempotency
router.post('/grades', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Zod validation
    const validation = gradeSyncSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { studentId, classId, schoolId, subjectId, grade, term, academicYear, examType, coefficient } = validation.data;
    const userId = req.user!.id;

    // Check for existing record (idempotency) - same student, class, subject, term, year, exam type
    const existing = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.classId, classId),
          eq(grades.subjectId, subjectId),
          eq(grades.term, term),
          eq(grades.academicYear, academicYear),
          eq(grades.examType, examType || 'evaluation')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(grades)
        .set({ 
          grade: grade.toString(),
          teacherId: userId,
          coefficient: coefficient || 1,
          updatedAt: new Date()
        })
        .where(eq(grades.id, existing[0].id))
        .returning();
      
      console.log('[SYNC] Grade updated (idempotent):', existing[0].id);
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new grade record
    const newGrade = await db.insert(grades).values({
      studentId,
      classId,
      schoolId,
      subjectId,
      teacherId: userId,
      grade: grade.toString(),
      term,
      academicYear,
      examType: examType || 'evaluation',
      coefficient: coefficient || 1
    }).returning();

    console.log('[SYNC] Grade created:', newGrade[0].id);
    res.json({ success: true, data: newGrade[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Grade sync error:', error);
    res.status(500).json({ error: 'Failed to sync grade' });
  }
});

// Update grade record
router.put('/grades/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, coefficient } = req.body;
    const userId = req.user!.id;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await db
      .update(grades)
      .set({ 
        grade: grade.toString(),
        coefficient: coefficient || 1,
        teacherId: userId,
        updatedAt: new Date()
      })
      .where(eq(grades.id, parseInt(id)))
      .returning();

    console.log('[SYNC] Grade updated:', id);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('[SYNC] Grade update error:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

// Sync homework records with idempotency
router.post('/homework', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Zod validation
    const validation = homeworkSyncSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { title, description, instructions, classId, schoolId, subjectId, dueDate, priority } = validation.data;
    const userId = req.user!.id;

    // Check for existing record (idempotency) - same title, class, subject, due date
    const existing = await db
      .select()
      .from(homework)
      .where(
        and(
          eq(homework.title, title),
          eq(homework.classId, classId),
          eq(homework.subjectId, subjectId),
          dueDate ? eq(homework.dueDate, new Date(dueDate)) : eq(homework.dueDate, null)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(homework)
        .set({ 
          description: description || null,
          instructions: instructions || null,
          teacherId: userId,
          priority: priority || 'medium',
          updatedAt: new Date()
        })
        .where(eq(homework.id, existing[0].id))
        .returning();
      
      console.log('[SYNC] Homework updated (idempotent):', existing[0].id);
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new homework record
    const newHomework = await db.insert(homework).values({
      title,
      description: description || null,
      instructions: instructions || null,
      classId,
      schoolId,
      subjectId,
      teacherId: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'medium',
      status: 'active'
    }).returning();

    console.log('[SYNC] Homework created:', newHomework[0].id);
    res.json({ success: true, data: newHomework[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Homework sync error:', error);
    res.status(500).json({ error: 'Failed to sync homework' });
  }
});

// Batch sync endpoint - sync multiple offline actions at once
router.post('/batch', requireAuth, async (req, res) => {
  try {
    const { actions } = req.body;
    
    if (!Array.isArray(actions)) {
      return res.status(400).json({ error: 'Actions must be an array' });
    }

    const results = [];
    const errors = [];

    for (const action of actions) {
      try {
        let result;
        
        switch (action.type) {
          case 'attendance':
            if (action.action === 'create') {
              result = await db.insert(attendance).values({
                ...action.data,
                markedBy: req.user!.id,
                date: new Date(action.data.date)
              }).returning();
            } else if (action.action === 'update') {
              result = await db
                .update(attendance)
                .set({ 
                  ...action.data, 
                  markedBy: req.user!.id,
                  updatedAt: new Date()
                })
                .where(eq(attendance.id, action.data.id))
                .returning();
            }
            break;

          case 'grade':
            if (action.action === 'create') {
              result = await db.insert(grades).values({
                ...action.data,
                teacherId: req.user!.id,
                grade: action.data.grade.toString()
              }).returning();
            } else if (action.action === 'update') {
              result = await db
                .update(grades)
                .set({ 
                  ...action.data, 
                  grade: action.data.grade.toString(),
                  teacherId: req.user!.id,
                  updatedAt: new Date()
                })
                .where(eq(grades.id, action.data.id))
                .returning();
            }
            break;

          case 'homework':
            if (action.action === 'create') {
              result = await db.insert(homework).values({
                ...action.data,
                teacherId: req.user!.id,
                dueDate: action.data.dueDate ? new Date(action.data.dueDate) : null
              }).returning();
            } else if (action.action === 'update') {
              result = await db
                .update(homework)
                .set({ 
                  ...action.data,
                  teacherId: req.user!.id,
                  updatedAt: new Date()
                })
                .where(eq(homework.id, action.data.id))
                .returning();
            }
            break;

          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }

        results.push({ id: action.id, success: true, data: result });
      } catch (error) {
        console.error(`[SYNC] Batch sync error for action ${action.id}:`, error);
        errors.push({ id: action.id, error: (error as Error).message });
      }
    }

    console.log(`[SYNC] Batch sync completed: ${results.length} succeeded, ${errors.length} failed`);
    res.json({
      success: errors.length === 0,
      results,
      errors,
      total: actions.length,
      succeeded: results.length,
      failed: errors.length
    });
  } catch (error) {
    console.error('[SYNC] Batch sync error:', error);
    res.status(500).json({ error: 'Failed to process batch sync' });
  }
});

// Get sync status - check pending changes from server
router.get('/status', requireAuth, async (req, res) => {
  try {
    // Return timestamp for last server update
    // This can be used by client to determine if they need to fetch new data
    res.json({
      serverTime: Date.now(),
      syncAvailable: true
    });
  } catch (error) {
    console.error('[SYNC] Status check error:', error);
    res.status(500).json({ error: 'Failed to check sync status' });
  }
});

export default router;
