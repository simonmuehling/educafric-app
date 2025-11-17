/**
 * SANDBOX ISOLATION DEMONSTRATION ENDPOINT
 * 
 * This file demonstrates the CORRECT pattern for implementing
 * complete database-level isolation between sandbox and production data.
 * 
 * USE THIS AS A TEMPLATE for updating all other endpoints.
 */

import { Router } from 'express';
import { db } from '../../db';
import { users, schools, classes } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isSandboxUserByEmail } from '../../utils/sandboxUtils';

const router = Router();

/**
 * ❌ BAD EXAMPLE - How NOT to query (causes data leakage)
 * 
 * This endpoint ONLY filters by schoolId, which means:
 * - Production user with schoolId=1 would see sandbox students
 * - Sandbox and production data can mix
 */
router.get('/students-bad', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // ❌ WRONG: Only filtering by schoolId
    const studentsList = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'Student'),
          eq(users.schoolId, user.schoolId)
        )
      );

    return res.json({
      warning: 'This endpoint has NO sandbox isolation - data can leak!',
      students: studentsList
    });
  } catch (error) {
    console.error('Error in bad endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ✅ GOOD EXAMPLE - Correct pattern with complete isolation
 * 
 * This endpoint filters by BOTH schoolId AND sandbox status:
 * - Production users ONLY see production students
 * - Sandbox users ONLY see sandbox students
 * - Complete database-level isolation
 */
router.get('/students-good', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // ✅ Step 1: Determine if user is sandbox based on email pattern
    const userIsSandbox = isSandboxUserByEmail(user.email);

    // ✅ Step 2: Query with BOTH schoolId AND sandbox status filter
    const studentsList = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        schoolId: users.schoolId,
        // Include school info to verify isolation
        schoolName: schools.name,
        schoolIsSandbox: schools.isSandbox
      })
      .from(users)
      // ✅ Step 3: Join with schools table to access is_sandbox column
      .leftJoin(schools, eq(users.schoolId, schools.id))
      // ✅ Step 4: Filter by role, schoolId AND sandbox status
      .where(
        and(
          eq(users.role, 'Student'),
          eq(users.schoolId, user.schoolId),
          eq(schools.isSandbox, userIsSandbox) // CRITICAL: Prevents data leakage
        )
      );

    return res.json({
      success: true,
      message: 'This endpoint has COMPLETE sandbox isolation ✅',
      isolation: {
        userEmail: user.email,
        userIsSandbox,
        schoolId: user.schoolId,
        filter: `schoolId=${user.schoolId} AND is_sandbox=${userIsSandbox}`
      },
      students: studentsList,
      count: studentsList.length
    });
  } catch (error) {
    console.error('Error in good endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ✅ EXAMPLE: Teachers Query with Isolation
 */
router.get('/teachers-isolated', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userIsSandbox = isSandboxUserByEmail(user.email);

    const teachersList = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        schoolName: schools.name,
        schoolIsSandbox: schools.isSandbox
      })
      .from(users)
      .leftJoin(schools, eq(users.schoolId, schools.id))
      .where(
        and(
          eq(users.role, 'Teacher'),
          eq(users.schoolId, user.schoolId),
          eq(schools.isSandbox, userIsSandbox) // ✅ Sandbox isolation
        )
      );

    return res.json({
      success: true,
      teachers: teachersList,
      isolation: {
        userIsSandbox,
        schoolId: user.schoolId
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ✅ EXAMPLE: Classes Query with Isolation
 */
router.get('/classes-isolated', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userIsSandbox = isSandboxUserByEmail(user.email);

    const classesList = await db
      .select({
        id: classes.id,
        name: classes.name,
        level: classes.level,
        section: classes.section,
        schoolName: schools.name,
        schoolIsSandbox: schools.isSandbox
      })
      .from(classes)
      .leftJoin(schools, eq(classes.schoolId, schools.id))
      .where(
        and(
          eq(classes.schoolId, user.schoolId),
          eq(schools.isSandbox, userIsSandbox) // ✅ Sandbox isolation
        )
      );

    return res.json({
      success: true,
      classes: classesList,
      isolation: {
        userIsSandbox,
        schoolId: user.schoolId
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📋 Isolation Verification Endpoint
 * 
 * Test endpoint to verify sandbox isolation is working correctly
 */
router.get('/verify-isolation', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userIsSandbox = isSandboxUserByEmail(user.email);

    // Get user's school info
    const schoolInfo = await db
      .select()
      .from(schools)
      .where(eq(schools.id, user.schoolId))
      .limit(1);

    const school = schoolInfo[0];

    // Verify isolation
    const isolationValid = school ? school.isSandbox === userIsSandbox : false;

    return res.json({
      user: {
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        detectedAsSandbox: userIsSandbox
      },
      school: {
        id: school?.id,
        name: school?.name,
        isSandbox: school?.isSandbox
      },
      isolation: {
        isValid: isolationValid,
        status: isolationValid 
          ? '✅ ISOLATED - User and school sandbox status match'
          : '❌ LEAKAGE DETECTED - Sandbox status mismatch!',
        userIsSandbox,
        schoolIsSandbox: school?.isSandbox
      }
    });
  } catch (error) {
    console.error('Error verifying isolation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
