import { Router } from 'express';
import { BulletinValidationService } from '../services/bulletinValidationService';
import { storage } from '../storage';

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Create bulletin validation with QR code and stamps
router.post('/bulletins/:bulletinId/validate', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.bulletinId);
    const { 
      teacherSignatureUrl, 
      directorSignatureUrl, 
      schoolStampUrl,
      validationType = 'combined',
      validationLevel = 'enhanced'
    } = req.body;

    const bulletin = await storage.getBulletin(bulletinId);
    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }

    // Verify user has permission to validate this bulletin
    const user = req.user as any;
    if (user.role !== 'Teacher' && user.role !== 'Director' && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validation = await BulletinValidationService.createBulletinValidation({
      bulletinId,
      studentId: bulletin.studentId,
      schoolId: bulletin.schoolId || user.schoolId,
      teacherSignatureUrl,
      directorSignatureUrl,
      schoolStampUrl,
      validationType,
      validationLevel
    });

    res.json({
      success: true,
      validation: {
        id: validation.id,
        qrCode: validation.qrCode,
        qrCodeImageUrl: validation.qrCodeImageUrl,
        validationHash: validation.validationHash,
        validationType: validation.validationType,
        validationLevel: validation.validationLevel
      }
    });

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Create validation error:', error);
    res.status(500).json({ error: 'Failed to create bulletin validation' });
  }
});

// Get bulletin validation info
router.get('/bulletins/:bulletinId/validation', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.bulletinId);
    
    // Placeholder for validation lookup - implement storage method
    const validation = null; // await storage.getBulletinValidationByBulletinId(bulletinId);
    if (!validation) {
      return res.status(404).json({ error: 'Validation not found' });
    }

    res.json(validation);

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Get validation error:', error);
    res.status(500).json({ error: 'Failed to get bulletin validation' });
  }
});

// Verify bulletin by hash (public endpoint)
router.get('/bulletins/verify/:validationHash', async (req, res) => {
  try {
    const { validationHash } = req.params;
    
    // Codes de démonstration pour les tests (bilingues)
    const demoCodes = {
      'DEMO2024': {
        isValid: true,
        bulletinData: {
          student: {
            firstName: 'Marie',
            lastName: 'Nguema',
            className: 'CM2 A'
          },
          school: {
            name: 'École Primaire Les Palmiers / Les Palmiers Primary School',
            address: 'Yaoundé, Cameroun'
          },
          period: '1er Trimestre 2024-2025 / 1st Term 2024-2025',
          average: 14.5,
          rank: 5
        },
        validationInfo: {
          validatedAt: new Date('2024-12-15').toISOString(),
          validatedBy: 'Dr. Jean Dupont',
          signatureApplied: true
        }
      },
      'EDU2024': {
        isValid: true,
        bulletinData: {
          student: {
            firstName: 'Paul',
            lastName: 'Mbala',
            className: '6ème B / 6th Grade B'
          },
          school: {
            name: 'Collège Bilingue Excellence / Excellence Bilingual College',
            address: 'Douala, Cameroun'
          },
          period: '2ème Trimestre 2024-2025 / 2nd Term 2024-2025',
          average: 16.2,
          rank: 2
        },
        validationInfo: {
          validatedAt: new Date().toISOString(),
          validatedBy: 'Mme. Françoise Kamga',
          signatureApplied: true
        }
      }
    };
    
    // Vérifier si c'est un code de démo
    if (demoCodes[validationHash]) {
      console.log(`✅ [BULLETIN_VERIFY] Code démonstration validé: ${validationHash}`);
      return res.json(demoCodes[validationHash]);
    }
    
    // Appel au service de validation existant
    const result = await BulletinValidationService.validateBulletin(validationHash);
    
    res.json(result);

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Verify bulletin error:', error);
    res.status(500).json({ 
      isValid: false, 
      errorMessage: 'Erreur de service de vérification / Verification service error' 
    });
  }
});

// Verify QR code data (public endpoint)
router.post('/bulletins/verify-qr', async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    
    if (!qrCodeData) {
      return res.status(400).json({ 
        isValid: false, 
        errorMessage: 'QR code data required' 
      });
    }

    const result = await BulletinValidationService.verifyQRCode(qrCodeData);
    
    res.json(result);

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Verify QR code error:', error);
    res.status(500).json({ 
      isValid: false, 
      errorMessage: 'QR code verification error' 
    });
  }
});

// Get school validation statistics
router.get('/schools/:schoolId/validation-stats', requireAuth, async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const user = req.user as any;
    
    // Verify user has access to this school's data
    if (user.schoolId !== schoolId && user.role !== 'SiteAdmin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await BulletinValidationService.getSchoolValidationStats(schoolId);
    
    res.json(stats);

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get validation statistics' });
  }
});

// Generate new QR code for existing bulletin
router.post('/bulletins/:bulletinId/regenerate-qr', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.bulletinId);
    const user = req.user as any;
    
    // Verify permissions
    if (user.role !== 'Director' && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only directors and admins can regenerate QR codes' });
    }

    const bulletin = await storage.getBulletin(bulletinId);
    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }

    // Placeholder for validation lookup - implement storage method
    const existingValidation = null; // await storage.getBulletinValidationByBulletinId(bulletinId);
    if (!existingValidation) {
      return res.status(404).json({ error: 'No existing validation found' });
    }

    // Generate new QR code
    const qrResult = await BulletinValidationService.generateBulletinQRCode({
      bulletinId,
      studentId: bulletin.studentId,
      schoolId: bulletin.schoolId || user.schoolId,
      teacherSignature: existingValidation.teacherSignatureHash,
      directorSignature: existingValidation.directorSignatureHash,
      schoolStamp: existingValidation.schoolStampHash
    });

    // Update validation record - implement storage method
    // await storage.updateBulletinValidation(existingValidation.id, {
    //   qrCode: qrResult.qrCode,
    //   qrCodeImageUrl: qrResult.qrCodeImageUrl,
    //   validationHash: qrResult.validationHash,
    //   updatedAt: new Date().toISOString()
    // });

    res.json({
      success: true,
      qrCode: qrResult.qrCode,
      qrCodeImageUrl: qrResult.qrCodeImageUrl,
      validationHash: qrResult.validationHash
    });

  } catch (error) {
    console.error('[BULLETIN_VALIDATION] Regenerate QR error:', error);
    res.status(500).json({ error: 'Failed to regenerate QR code' });
  }
});

export default router;