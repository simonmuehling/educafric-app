import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../db';
import { digitalSignatures, bulletinSignatures } from '../../shared/schemas/digitalSignatureSchema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

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