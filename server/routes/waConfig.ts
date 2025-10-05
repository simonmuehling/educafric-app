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
        error: 'Unauthorized'
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
        error: 'Unauthorized'
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

    // UPSERT: Try to update, if fails (sandbox user), insert minimal record
    try {
      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
      
      // Check if update affected any rows (drizzle doesn't return rowCount easily, so we check differently)
      // For sandbox users (9001-9006), we need to insert if they don't exist
      if (userId >= 9001 && userId <= 9006) {
        // Check if user exists
        const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        
        if (!existing) {
          // Sandbox user doesn't exist in DB, create minimal record
          const sandboxEmails: Record<number, string> = {
            9001: 'sandbox.parent@educafric.demo',
            9002: 'sandbox.teacher@educafric.demo',
            9003: 'sandbox.freelancer@educafric.demo',
            9004: 'sandbox.student@educafric.demo',
            9005: 'sandbox.admin@educafric.demo',
            9006: 'sandbox.director@educafric.demo'
          };
          
          const sandboxRoles: Record<number, string> = {
            9001: 'Parent',
            9002: 'Teacher',
            9003: 'Freelancer',
            9004: 'Student',
            9005: 'Admin',
            9006: 'Director'
          };
          
          await db.insert(users).values({
            id: userId,
            email: sandboxEmails[userId] || `sandbox-${userId}@educafric.demo`,
            role: sandboxRoles[userId] || 'Student',
            firstName: 'Sandbox',
            lastName: 'User',
            schoolId: 999,
            password: 'sandbox', // Dummy password, not used for sandbox login
            ...updateData
          });
          
          console.log('[WA_CONFIG_INSERT] Created sandbox user in DB:', userId);
        }
      }
    } catch (error) {
      console.error('[WA_CONFIG_UPDATE] Error:', error);
      throw error;
    }

    console.log('[WA_CONFIG_UPDATE] User WhatsApp config updated:', {
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
