import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../db';
import { digitalSignatures, bulletinSignatures } from '../../shared/schemas/digitalSignatureSchema';
import { signatures } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// ============================================
// PRINCIPAL SIGNATURE MANAGEMENT (for ID cards, bulletins, documents)
// ============================================

// Get principal/director signature for the school
router.get('/principal', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Get the signature for the school's director
    const signature = await db
      .select()
      .from(signatures)
      .where(
        and(
          eq(signatures.userId, user.id),
          eq(signatures.userRole, 'director'),
          eq(signatures.isActive, true)
        )
      )
      .limit(1);
    
    if (!signature.length) {
      return res.json({ signatureData: null });
    }
    
    res.json({
      id: signature[0].id,
      signatureData: signature[0].signatureData,
      signatureName: user.name || 'Directeur',
      signatureFunction: 'Directeur',
      createdAt: signature[0].createdAt,
      updatedAt: signature[0].updatedAt
    });
  } catch (error) {
    console.error('[SIGNATURE] Error getting principal signature:', error);
    res.status(500).json({ error: 'Failed to get signature' });
  }
});

// Save or update principal signature
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { signatureData, signatureName, signatureFunction, signatureFor } = req.body;
    
    if (!signatureData) {
      return res.status(400).json({ error: 'Signature data is required' });
    }
    
    const userRole = signatureFor || 'director';
    
    // Check if signature already exists
    const existing = await db
      .select()
      .from(signatures)
      .where(
        and(
          eq(signatures.userId, user.id),
          eq(signatures.userRole, userRole)
        )
      )
      .limit(1);
    
    let result;
    if (existing.length) {
      // Update existing
      result = await db
        .update(signatures)
        .set({
          signatureData,
          signatureType: 'drawn',
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(signatures.id, existing[0].id))
        .returning();
    } else {
      // Create new
      result = await db
        .insert(signatures)
        .values({
          userId: user.id,
          userRole,
          signatureData,
          signatureType: 'drawn',
          isActive: true
        })
        .returning();
    }
    
    console.log('[SIGNATURE] ✅ Signature saved for user:', user.id, 'role:', userRole);
    
    res.json({
      success: true,
      id: result[0].id,
      signatureName: signatureName || user.name,
      signatureFunction: signatureFunction || 'Directeur'
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
    
    await db
      .update(signatures)
      .set({ isActive: false })
      .where(
        and(
          eq(signatures.userId, user.id),
          eq(signatures.userRole, 'director')
        )
      );
    
    console.log('[SIGNATURE] 🗑️ Signature deleted for user:', user.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[SIGNATURE] Error deleting signature:', error);
    res.status(500).json({ error: 'Failed to delete signature' });
  }
});

// Get signature by school ID (for ID cards, bulletins - public endpoint)
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Find director of this school and get their signature
    const result = await db.execute(`
      SELECT s.signature_data, u.name as signatory_name
      FROM signatures s
      JOIN users u ON s.user_id = u.id
      WHERE u.school_id = $1 
        AND s.user_role = 'director' 
        AND s.is_active = true
      LIMIT 1
    `, [schoolId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.json({ signatureData: null });
    }
    
    res.json({
      signatureData: result.rows[0].signature_data,
      signatoryName: result.rows[0].signatory_name
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