import express from 'express';
import { requireAuth } from '../auth';
import { db } from '../db';
import { signatures, bulletinSendings } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Sauvegarder une signature
router.post('/save', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { signatureData, userRole, signatureType } = req.body;

    if (!signatureData || !userRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Signature data and user role are required' 
      });
    }

    // Vérifier que l'utilisateur a le droit de créer cette signature
    if ((userRole === 'director' && user.role !== 'Admin') ||
        (userRole === 'principal_teacher' && user.role !== 'Teacher' && user.role !== 'Admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to create this signature type' 
      });
    }

    // Supprimer l'ancienne signature si elle existe
    await db.delete(signatures)
      .where(and(
        eq(signatures.userId, user.id),
        eq(signatures.userRole, userRole)
      ));

    // Insérer la nouvelle signature
    const [savedSignature] = await db.insert(signatures)
      .values({
        userId: user.id,
        userRole,
        signatureData,
        signatureType,
        createdAt: new Date(),
        isActive: true
      })
      .returning();

    console.log(`[SIGNATURE] ✅ Signature saved for user ${user.email} (${userRole})`);

    res.json({
      success: true,
      message: 'Signature saved successfully',
      signatureId: savedSignature.id
    });

  } catch (error) {
    console.error('[SIGNATURE] Error saving signature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save signature' 
    });
  }
});

// Récupérer une signature
router.get('/:userRole', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { userRole } = req.params;

    const [signature] = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.userId, user.id),
        eq(signatures.userRole, userRole),
        eq(signatures.isActive, true)
      ))
      .orderBy(signatures.createdAt)
      .limit(1);

    if (signature) {
      res.json({
        success: true,
        signature: {
          id: signature.id,
          signatureData: signature.signatureData,
          signatureType: signature.signatureType,
          createdAt: signature.createdAt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No signature found'
      });
    }

  } catch (error) {
    console.error('[SIGNATURE] Error fetching signature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch signature' 
    });
  }
});

// Supprimer une signature
router.delete('/:userRole', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { userRole } = req.params;

    await db.delete(signatures)
      .where(and(
        eq(signatures.userId, user.id),
        eq(signatures.userRole, userRole)
      ));

    console.log(`[SIGNATURE] ✅ Signature deleted for user ${user.email} (${userRole})`);

    res.json({
      success: true,
      message: 'Signature deleted successfully'
    });

  } catch (error) {
    console.error('[SIGNATURE] Error deleting signature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete signature' 
    });
  }
});

// Appliquer signature et envoyer bulletin (pour démo)
router.post('/apply-and-send', async (req, res) => {
  try {
    const { bulletinId, signatureData, signerInfo, studentName } = req.body;
    
    if (!signatureData || !signerInfo) {
      return res.status(400).json({ 
        success: false,
        message: 'Signature data and signer info required' 
      });
    }
    
    // Log pour la démo
    console.log(`📧 [SIGNATURE] Bulletin ${bulletinId} signé par ${signerInfo.name} (${signerInfo.position})`);
    console.log(`📧 [SENDING] Envoi du bulletin à l'élève: ${studentName}`);
    
    // Simuler l'intégration avec le système d'envoi existant
    setTimeout(() => {
      console.log(`✅ [SUCCESS] Bulletin signé et envoyé avec succès pour ${studentName}`);
    }, 1000);
    
    res.json({ 
      success: true, 
      message: 'Bulletin signed and sent successfully',
      bulletinId,
      signerInfo,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[SIGNATURE] Error applying signature:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to apply signature' 
    });
  }
});

export default router;