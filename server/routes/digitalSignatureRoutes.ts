import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../db';
import { digitalSignatures, bulletinSignatures } from '../../shared/schemas/digitalSignatureSchema';
import { signatures } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// ============================================
// PRINCIPAL SIGNATURE MANAGEMENT (for ID cards, bulletins, documents)
// ============================================

// Get principal/director signature for the school
router.get('/principal', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user?.id;
    const schoolId = user?.schoolId || user?.school_id || 0;
    
    if (!userId) {
      console.log('[SIGNATURE] No user ID found');
      return res.json({ signatureData: null });
    }
    
    console.log('[SIGNATURE] Getting signature for user:', userId, 'school:', schoolId);
    
    // Use sql tagged template with Drizzle
    const result = await db.execute(
      sql`SELECT id, signature_data, signature_type, signatory_name, signatory_title, created_at, updated_at
          FROM signatures
          WHERE (user_id = ${userId} OR school_id = ${schoolId}) AND is_active = true
          ORDER BY updated_at DESC
          LIMIT 1`
    );
    
    if (!result.rows || result.rows.length === 0) {
      console.log('[SIGNATURE] No signature found');
      return res.json({ signatureData: null });
    }
    
    const row = result.rows[0] as any;
    console.log('[SIGNATURE] ✅ Signature found for user:', userId);
    
    res.json({
      id: row.id,
      signatureData: row.signature_data,
      signatureName: row.signatory_name || user.name || 'Directeur',
      signatureFunction: row.signatory_title || 'Directeur',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('[SIGNATURE] Error getting principal signature:', error);
    res.status(500).json({ error: 'Failed to get signature' });
  }
});

// Save or update principal signature (alias routes for compatibility)
router.post('/save', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user?.id;
    const schoolId = user?.schoolId || user?.school_id || null;
    const { signatureData, userRole: requestRole, signatureName, signatureFunction } = req.body;
    
    if (!signatureData) {
      return res.status(400).json({ success: false, error: 'Signature data is required' });
    }
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const sigName = signatureName || user.name || 'Directeur';
    const sigFunction = signatureFunction || 'Directeur';
    const signatureType = requestRole || 'principal';
    
    console.log('[SIGNATURE] /save - Saving signature for user:', userId, 'school:', schoolId, 'role:', signatureType);
    
    // Check if signature already exists
    const existing = await db.execute(
      sql`SELECT id FROM signatures WHERE user_id = ${userId} LIMIT 1`
    );
    
    let result;
    if (existing.rows && existing.rows.length > 0) {
      const existingId = (existing.rows[0] as any).id;
      result = await db.execute(
        sql`UPDATE signatures 
            SET signature_data = ${signatureData}, signature_type = ${signatureType}, 
                signatory_name = ${sigName}, signatory_title = ${sigFunction}, 
                is_active = true, updated_at = NOW()
            WHERE id = ${existingId}
            RETURNING id, signature_data, created_at, updated_at`
      );
    } else {
      result = await db.execute(
        sql`INSERT INTO signatures (user_id, school_id, user_role, signature_data, signature_type, signatory_name, signatory_title, is_active, created_at, updated_at)
            VALUES (${userId}, ${schoolId}, ${signatureType}, ${signatureData}, ${signatureType}, ${sigName}, ${sigFunction}, true, NOW(), NOW())
            RETURNING id, signature_data, created_at, updated_at`
      );
    }
    
    console.log('[SIGNATURE] ✅ /save - Signature saved for user:', userId);
    
    res.json({
      success: true,
      id: (result.rows[0] as any).id,
      signatureName: sigName,
      signatureFunction: sigFunction
    });
  } catch (error) {
    console.error('[SIGNATURE] Error saving signature via /save:', error);
    res.status(500).json({ success: false, error: 'Failed to save signature' });
  }
});

// Save or update principal signature
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user?.id;
    const schoolId = user?.schoolId || user?.school_id || null;
    const { signatureData, signatureName, signatureFunction, signatureFor } = req.body;
    
    if (!signatureData) {
      return res.status(400).json({ error: 'Signature data is required' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const signatureType = signatureFor || 'principal';
    const sigName = signatureName || user.name || 'Directeur';
    const sigFunction = signatureFunction || 'Directeur';
    
    console.log('[SIGNATURE] Saving signature for user:', userId, 'school:', schoolId);
    
    // Check if signature already exists
    const existing = await db.execute(
      sql`SELECT id FROM signatures WHERE user_id = ${userId} LIMIT 1`
    );
    
    let result;
    if (existing.rows && existing.rows.length > 0) {
      // Update existing
      const existingId = (existing.rows[0] as any).id;
      result = await db.execute(
        sql`UPDATE signatures 
            SET signature_data = ${signatureData}, signature_type = ${signatureType}, 
                signatory_name = ${sigName}, signatory_title = ${sigFunction}, 
                is_active = true, updated_at = NOW()
            WHERE id = ${existingId}
            RETURNING id, signature_data, created_at, updated_at`
      );
    } else {
      // Create new
      result = await db.execute(
        sql`INSERT INTO signatures (user_id, school_id, user_role, signature_data, signature_type, signatory_name, signatory_title, is_active, created_at, updated_at)
            VALUES (${userId}, ${schoolId}, 'director', ${signatureData}, ${signatureType}, ${sigName}, ${sigFunction}, true, NOW(), NOW())
            RETURNING id, signature_data, created_at, updated_at`
      );
    }
    
    console.log('[SIGNATURE] ✅ Signature saved for user:', userId);
    
    res.json({
      success: true,
      id: (result.rows[0] as any).id,
      signatureName: sigName,
      signatureFunction: sigFunction
    });
  } catch (error) {
    console.error('[SIGNATURE] Error saving signature:', error);
    res.status(500).json({ error: 'Failed to save signature' });
  }
});

// Delete principal signature
router.delete('/principal', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    await db.execute(
      sql`UPDATE signatures SET is_active = false, updated_at = NOW() WHERE user_id = ${userId}`
    );
    
    console.log('[SIGNATURE] 🗑️ Signature deleted for user:', userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[SIGNATURE] Error deleting signature:', error);
    res.status(500).json({ error: 'Failed to delete signature' });
  }
});

// Get signature by school ID (for ID cards, bulletins - public endpoint)
router.get('/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId, 10);
    
    // First try to find by school_id in signatures
    let result = await db.execute(
      sql`SELECT signature_data, signatory_name
          FROM signatures
          WHERE school_id = ${schoolId} AND is_active = true
          ORDER BY updated_at DESC
          LIMIT 1`
    );
    
    // If not found, try via user relationship
    if (!result.rows || result.rows.length === 0) {
      result = await db.execute(
        sql`SELECT s.signature_data, COALESCE(s.signatory_name, u.name) as signatory_name
            FROM signatures s
            JOIN users u ON s.user_id = u.id
            WHERE u.school_id = ${schoolId} AND s.is_active = true
            ORDER BY s.updated_at DESC
            LIMIT 1`
      );
    }
    
    if (!result.rows || result.rows.length === 0) {
      return res.json({ signatureData: null });
    }
    
    const row = result.rows[0] as any;
    res.json({
      signatureData: row.signature_data,
      signatoryName: row.signatory_name
    });
  } catch (error) {
    console.error('[SIGNATURE] Error getting school signature:', error);
    res.status(500).json({ error: 'Failed to get signature' });
  }
});

// ============================================
// BULLETIN DIGITAL SIGNATURES (existing)
// ============================================

// Sign a bulletin digitally (Chef d'établissement only)
router.post('/bulletins/:bulletinId/sign', requireAuth, requireRole('Director'), async (req, res) => {
  try {
    const { bulletinId } = req.params;
    const user = req.user as any;
    const { documentHash, deviceInfo } = req.body;
    
    console.log('[DIGITAL_SIGNATURE] 🖊️ Signing bulletin:', bulletinId, 'by user:', user.id);
    
    // Generate signature hash and verification code
    const signatureData = {
      bulletinId,
      signatoryId: user.id,
      timestamp: new Date().toISOString(),
      documentHash
    };
    
    const signatureHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(signatureData))
      .digest('hex');
      
    const verificationCode = crypto.randomBytes(16).toString('hex');
    
    // Create digital signature record
    const signature = await db.insert(digitalSignatures).values({
      documentType: 'bulletin',
      documentId: bulletinId,
      signatoryId: user.id,
      signatoryName: user.name || 'Chef d\'Établissement',
      signatoryTitle: 'Chef d\'Établissement',
      signatoryRole: 'Director',
      schoolId: user.schoolId,
      signatureHash,
      documentHash,
      verificationCode,
      signatureDevice: deviceInfo || 'Unknown',
      signatureIP: req.ip
    }).returning();
    
    // Update bulletin signature status
    await db.insert(bulletinSignatures).values({
      bulletinId,
      studentId: parseInt(req.body.studentId),
      schoolId: user.schoolId,
      requiredSignatures: JSON.stringify(['Director']),
      completedSignatures: JSON.stringify([{
        role: 'Director',
        signatureId: signature[0].id,
        signedAt: new Date().toISOString(),
        signatoryName: user.name
      }]),
      status: 'signed',
      signedAt: new Date()
    }).onConflictDoUpdate({
      target: [bulletinSignatures.bulletinId],
      set: {
        status: 'signed',
        signedAt: new Date(),
        completedSignatures: JSON.stringify([{
          role: 'Director',
          signatureId: signature[0].id,
          signedAt: new Date().toISOString(),
          signatoryName: user.name
        }])
      }
    });
    
    console.log('[DIGITAL_SIGNATURE] ✅ Bulletin signed successfully:', {
      bulletinId,
      signatureId: signature[0].id,
      verificationCode
    });
    
    res.json({
      success: true,
      data: {
        signatureId: signature[0].id,
        verificationCode,
        signedAt: signature[0].signatureTimestamp,
        signatoryName: user.name,
        status: 'signed'
      }
    });
  } catch (error) {
    console.error('[DIGITAL_SIGNATURE] ❌ Error signing bulletin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign bulletin'
    });
  }
});

// Get signature status for a bulletin
router.get('/bulletins/:bulletinId/status', requireAuth, async (req, res) => {
  try {
    const { bulletinId } = req.params;
    const user = req.user as any;
    
    const signatureStatus = await db
      .select()
      .from(bulletinSignatures)
      .where(
        and(
          eq(bulletinSignatures.bulletinId, bulletinId),
          eq(bulletinSignatures.schoolId, user.schoolId)
        )
      )
      .limit(1);
    
    if (!signatureStatus.length) {
      return res.json({
        success: true,
        data: {
          status: 'draft',
          signed: false,
          requiredSignatures: ['Director'],
          completedSignatures: []
        }
      });
    }
    
    const status = signatureStatus[0];
    const completedSignatures = status.completedSignatures as any[] || [];
    
    res.json({
      success: true,
      data: {
        status: status.status,
        signed: status.status === 'signed',
        signedAt: status.signedAt,
        requiredSignatures: status.requiredSignatures as string[] || ['Director'],
        completedSignatures,
        sentToStudents: status.sentToStudents,
        sentToParents: status.sentToParents
      }
    });
  } catch (error) {
    console.error('[DIGITAL_SIGNATURE] ❌ Error getting signature status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get signature status'
    });
  }
});

// Verify signature authenticity
router.get('/verify/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;
    
    const signature = await db
      .select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.verificationCode, verificationCode))
      .limit(1);
    
    if (!signature.length) {
      return res.status(404).json({
        success: false,
        error: 'Signature not found'
      });
    }
    
    const sig = signature[0];
    
    res.json({
      success: true,
      data: {
        isValid: sig.isValid,
        documentType: sig.documentType,
        documentId: sig.documentId,
        signatoryName: sig.signatoryName,
        signatoryTitle: sig.signatoryTitle,
        signedAt: sig.signatureTimestamp,
        schoolId: sig.schoolId,
        verificationCode: sig.verificationCode
      }
    });
  } catch (error) {
    console.error('[DIGITAL_SIGNATURE] ❌ Error verifying signature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify signature'
    });
  }
});

export default router;