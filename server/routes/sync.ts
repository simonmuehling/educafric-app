// Offline Sync Routes
// Handles synchronization of offline actions for poor connectivity areas

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { db } from '../db';
import { attendance, grades, homework, insertAttendanceSchema, insertGradeSchema, insertHomeworkSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Sync attendance records with idempotency
router.post('/attendance', requireAuth, async (req, res) => {
  try {
    const { studentId, classId, date, status, clientActionId } = req.body;
    const userId = req.user!.id;

    // Check if user has permission to mark attendance
    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate input using Zod schema
    const validatedData = insertAttendanceSchema.omit({ id: true, teacherId: true }).parse({
      studentId,
      classId,
      date,
      status
    });

    // Check for existing record (idempotency) - same student, class, and date
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, validatedData.studentId),
          eq(attendance.classId, validatedData.classId),
          eq(attendance.date, new Date(validatedData.date))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(attendance)
        .set({ status: validatedData.status, teacherId: userId })
        .where(eq(attendance.id, existing[0].id))
        .returning();
      
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new attendance record
    const newAttendance = await db.insert(attendance).values({
      ...validatedData,
      date: new Date(validatedData.date),
      teacherId: userId
    }).returning();

    res.json({ success: true, data: newAttendance[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Attendance sync error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to sync attendance' });
  }
});

// Update attendance record
router.put('/attendance/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await db
      .update(attendance)
      .set({ status })
      .where(eq(attendance.id, parseInt(id)))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('[SYNC] Attendance update error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Sync grade records with idempotency
router.post('/grades', requireAuth, async (req, res) => {
  try {
    const { studentId, classId, subjectName, grade, term, academicYear, type, clientActionId } = req.body;
    const userId = req.user!.id;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate input using Zod schema
    const validatedData = insertGradeSchema.omit({ id: true, teacherId: true }).parse({
      studentId,
      classId,
      subjectName,
      grade: parseFloat(grade),
      term,
      academicYear,
      type: type || 'Evaluation'
    });

    // Check for existing record (idempotency) - same student, class, subject, term, year, type
    const existing = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, validatedData.studentId),
          eq(grades.classId, validatedData.classId),
          eq(grades.subjectName, validatedData.subjectName),
          eq(grades.term, validatedData.term),
          eq(grades.academicYear, validatedData.academicYear),
          eq(grades.type, validatedData.type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(grades)
        .set({ grade: validatedData.grade, teacherId: userId })
        .where(eq(grades.id, existing[0].id))
        .returning();
      
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new grade record
    const newGrade = await db.insert(grades).values({
      ...validatedData,
      teacherId: userId
    }).returning();

    res.json({ success: true, data: newGrade[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Grade sync error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to sync grade' });
  }
});

// Update grade record
router.put('/grades/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { grade } = req.body;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await db
      .update(grades)
      .set({ grade: parseFloat(grade) })
      .where(eq(grades.id, parseInt(id)))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('[SYNC] Grade update error:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

// Sync homework records with idempotency
router.post('/homework', requireAuth, async (req, res) => {
  try {
    const { title, description, classId, subjectName, dueDate, clientActionId } = req.body;
    const userId = req.user!.id;

    if (req.user!.role !== 'Teacher' && req.user!.role !== 'Director' && req.user!.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate input using Zod schema
    const validatedData = insertHomeworkSchema.omit({ id: true, teacherId: true }).parse({
      title,
      description,
      classId,
      subjectName,
      dueDate
    });

    // Check for existing record (idempotency) - same title, class, subject, due date
    const existing = await db
      .select()
      .from(homework)
      .where(
        and(
          eq(homework.title, validatedData.title),
          eq(homework.classId, validatedData.classId),
          eq(homework.subjectName, validatedData.subjectName),
          eq(homework.dueDate, new Date(validatedData.dueDate))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record instead of creating duplicate
      const updated = await db
        .update(homework)
        .set({ description: validatedData.description, teacherId: userId })
        .where(eq(homework.id, existing[0].id))
        .returning();
      
      return res.json({ success: true, data: updated[0], updated: true });
    }

    // Create new homework record
    const newHomework = await db.insert(homework).values({
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
      teacherId: userId
    }).returning();

    res.json({ success: true, data: newHomework[0], updated: false });
  } catch (error) {
    console.error('[SYNC] Homework sync error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
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
                teacherId: req.user!.id
              }).returning();
            } else if (action.action === 'update') {
              result = await db
                .update(attendance)
                .set(action.data)
                .where(eq(attendance.id, action.data.id))
                .returning();
            }
            break;

          case 'grade':
            if (action.action === 'create') {
              result = await db.insert(grades).values({
                ...action.data,
                teacherId: req.user!.id,
                grade: parseFloat(action.data.grade)
              }).returning();
            } else if (action.action === 'update') {
              result = await db
                .update(grades)
                .set({ ...action.data, grade: parseFloat(action.data.grade) })
                .where(eq(grades.id, action.data.id))
                .returning();
            }
            break;

          case 'homework':
            if (action.action === 'create') {
              result = await db.insert(homework).values({
                ...action.data,
                teacherId: req.user!.id
              }).returning();
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
