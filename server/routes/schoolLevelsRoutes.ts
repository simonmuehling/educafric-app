import { Router } from 'express';
import { db } from '../db';
import { schoolLevels } from '@shared/schema';
import { eq, and, asc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schema for school levels
const createLevelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFr: z.string().optional(),
  nameEn: z.string().optional(),
  order: z.number().int().positive("Order must be a positive integer")
});

const updateLevelSchema = z.object({
  name: z.string().min(1).optional(),
  nameFr: z.string().optional(),
  nameEn: z.string().optional(),
  order: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

// GET all levels for a school
router.get('/', async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'No school ID found' });
    }

    const levels = await db
      .select()
      .from(schoolLevels)
      .where(eq(schoolLevels.schoolId, schoolId))
      .orderBy(asc(schoolLevels.order));

    return res.json({ success: true, levels });
  } catch (error) {
    console.error('[SCHOOL_LEVELS] Error fetching levels:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school levels' 
    });
  }
});

// POST create a new level
router.post('/', async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'No school ID found' });
    }

    const validatedData = createLevelSchema.parse(req.body);

    const [newLevel] = await db
      .insert(schoolLevels)
      .values({
        schoolId,
        name: validatedData.name,
        nameFr: validatedData.nameFr || validatedData.name,
        nameEn: validatedData.nameEn || validatedData.name,
        order: validatedData.order,
        isActive: true
      })
      .returning();

    console.log(`[SCHOOL_LEVELS] Created new level: ${newLevel.name} for school ${schoolId}`);

    return res.json({ 
      success: true, 
      level: newLevel,
      message: 'Level created successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    console.error('[SCHOOL_LEVELS] Error creating level:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create school level' 
    });
  }
});

// PUT update an existing level
router.put('/:id', async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const levelId = parseInt(req.params.id);
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'No school ID found' });
    }

    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, message: 'Invalid level ID' });
    }

    const validatedData = updateLevelSchema.parse(req.body);

    const [updatedLevel] = await db
      .update(schoolLevels)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(and(
        eq(schoolLevels.id, levelId),
        eq(schoolLevels.schoolId, schoolId)
      ))
      .returning();

    if (!updatedLevel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found or does not belong to your school' 
      });
    }

    console.log(`[SCHOOL_LEVELS] Updated level ${levelId}: ${updatedLevel.name}`);

    return res.json({ 
      success: true, 
      level: updatedLevel,
      message: 'Level updated successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    console.error('[SCHOOL_LEVELS] Error updating level:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update school level' 
    });
  }
});

// DELETE a level
router.delete('/:id', async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const levelId = parseInt(req.params.id);
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'No school ID found' });
    }

    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, message: 'Invalid level ID' });
    }

    const [deletedLevel] = await db
      .delete(schoolLevels)
      .where(and(
        eq(schoolLevels.id, levelId),
        eq(schoolLevels.schoolId, schoolId)
      ))
      .returning();

    if (!deletedLevel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found or does not belong to your school' 
      });
    }

    console.log(`[SCHOOL_LEVELS] Deleted level ${levelId}: ${deletedLevel.name}`);

    return res.json({ 
      success: true, 
      message: 'Level deleted successfully' 
    });
  } catch (error) {
    console.error('[SCHOOL_LEVELS] Error deleting level:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete school level' 
    });
  }
});

export default router;
