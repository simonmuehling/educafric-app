/**
 * WhatsApp Configuration Routes
 * Allows users to configure their WhatsApp settings
 */

import express from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { WaOptInUpdateSchema } from '../../shared/schemas/waValidation';

const router = express.Router();

/**
 * GET /api/user/whatsapp-config
 * Get current user's WhatsApp configuration
 */
router.get('/api/user/whatsapp-config', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorised'
      });
    }

    // Try to get config from database first
    const [user] = await db
      .select({
        whatsappE164: users.whatsappE164,
        waOptIn: users.waOptIn,
        waLanguage: users.waLanguage,
        preferredChannel: users.preferredChannel
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      return res.json({
        success: true,
        config: {
          whatsappE164: user.whatsappE164,
          waOptIn: user.waOptIn || false,
          waLanguage: user.waLanguage || 'fr',
          preferredChannel: user.preferredChannel || 'email'
        }
      });
    }

    // If not found, check if it's a sandbox user (9001-9006)
    if (userId >= 9001 && userId <= 9006) {
      return res.json({
        success: true,
        config: {
          whatsappE164: null,
          waOptIn: false,
          waLanguage: 'fr',
          preferredChannel: 'email'
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  } catch (error) {
    console.error('[WA_CONFIG_GET] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WhatsApp configuration'
    });
  }
});

/**
 * POST /api/user/whatsapp-config
 * Update current user's WhatsApp configuration
 */
router.post('/api/user/whatsapp-config', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorised'
      });
    }

    // Validate request body
    const parsed = WaOptInUpdateSchema.parse(req.body);

    // Build update object dynamically
    const updateData: any = {
      waOptIn: parsed.waOptIn,
      waLanguage: parsed.waLanguage || 'fr',
      preferredChannel: parsed.waOptIn ? 'whatsapp' : 'email'
    };
    
    if (parsed.whatsappE164) {
      updateData.whatsappE164 = parsed.whatsappE164;
    }

    // UPSERT: Check if user exists first, then insert or update
    const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existing) {
      // User exists, update
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
      console.log('[WA_CONFIG_UPDATE] Updated existing user:', userId);
    } else {
      // User doesn't exist - for sandbox users (9001-9006), create them
      if (userId >= 9001 && userId <= 9006) {
        const sandboxData: Record<number, { email: string; role: string; firstName: string; lastName: string }> = {
          9001: { email: 'sandbox.parent@educafric.demo', role: 'Parent', firstName: 'Marie', lastName: 'Kamga' },
          9002: { email: 'sandbox.teacher@educafric.demo', role: 'Teacher', firstName: 'Paul', lastName: 'Mvondo' },
          9003: { email: 'sandbox.freelancer@educafric.demo', role: 'Freelancer', firstName: 'Sophie', lastName: 'Biya' },
          9004: { email: 'sandbox.student@educafric.demo', role: 'Student', firstName: 'Junior', lastName: 'Kamga' },
          9005: { email: 'sandbox.admin@educafric.demo', role: 'Admin', firstName: 'Carine', lastName: 'Nguetsop' },
          9006: { email: 'sandbox.director@educafric.demo', role: 'Director', firstName: 'Michel', lastName: 'Atangana' }
        };
        
        const userData = sandboxData[userId] || {
          email: `sandbox-${userId}@educafric.demo`,
          role: 'Student',
          firstName: 'Sandbox',
          lastName: 'User'
        };
        
        await db.insert(users).values({
          id: userId,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          schoolId: 999,
          password: 'sandbox', // Dummy password, not used for sandbox login
          ...updateData
        });
        
        console.log('[WA_CONFIG_INSERT] Created sandbox user in DB:', { userId, email: userData.email });
      } else {
        throw new Error('User not found and not a sandbox user');
      }
    }

    console.log('[WA_CONFIG_SUCCESS] WhatsApp config saved:', {
      userId,
      waOptIn: parsed.waOptIn,
      hasPhone: !!parsed.whatsappE164
    });

    res.json({
      success: true,
      message: 'WhatsApp configuration updated successfully'
    });
  } catch (error) {
    console.error('[WA_CONFIG_UPDATE] Error:', error);
    
    // Return Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update WhatsApp configuration'
    });
  }
});

export default router;
