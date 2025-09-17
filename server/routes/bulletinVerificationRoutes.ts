// BULLETIN VERIFICATION API ROUTES
// Professional bulletin verification system with QR code support

import { Router } from 'express';
import { db } from '../db';
import { 
  bulletinVerifications, 
  bulletinVerificationLogs, 
  bulletinVerificationSettings,
  schools,
  users,
  classes
} from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Rate limiting - simple in-memory store (use Redis in production)
const verificationAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Rate limiting middleware
const rateLimitVerification = (req: any, res: any, next: any) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 20; // Max 20 verifications per hour per IP
  
  const attempts = verificationAttempts.get(clientIP);
  
  if (attempts) {
    const timeDiff = now.getTime() - attempts.lastAttempt.getTime();
    
    if (timeDiff < windowMs) {
      if (attempts.count >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: 'Too many verification attempts. Please try again later.',
          messageFr: 'Trop de tentatives de vérification. Veuillez réessayer plus tard.'
        });
      }
      attempts.count++;
    } else {
      attempts.count = 1;
    }
    
    attempts.lastAttempt = now;
  } else {
    verificationAttempts.set(clientIP, { count: 1, lastAttempt: now });
  }
  
  next();
};

// Verification input schema
const verifyBulletinSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  language: z.enum(['fr', 'en']).optional().default('fr')
});

// GET /api/bulletins/verify?code=xxx - Verify bulletin by QR code or manual entry
router.get('/verify', rateLimitVerification, async (req, res) => {
  try {
    const validation = verifyBulletinSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code format',
        messageFr: 'Format de code de vérification invalide',
        errors: validation.error.errors
      });
    }
    
    const { code, language } = validation.data;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    console.log(`[BULLETIN_VERIFY] 🔍 Verification attempt for code: ${code.substring(0, 8)}...`);
    
    // Try to find verification record by either full code or short code
    const verificationRecord = await db.select({
      id: bulletinVerifications.id,
      verificationCode: bulletinVerifications.verificationCode,
      shortCode: bulletinVerifications.shortCode,
      studentId: bulletinVerifications.studentId,
      schoolId: bulletinVerifications.schoolId,
      classId: bulletinVerifications.classId,
      term: bulletinVerifications.term,
      academicYear: bulletinVerifications.academicYear,
      studentName: bulletinVerifications.studentName,
      studentMatricule: bulletinVerifications.studentMatricule,
      className: bulletinVerifications.className,
      schoolName: bulletinVerifications.schoolName,
      generalAverage: bulletinVerifications.generalAverage,
      classRank: bulletinVerifications.classRank,
      totalStudents: bulletinVerifications.totalStudents,
      isActive: bulletinVerifications.isActive,
      issuedAt: bulletinVerifications.issuedAt,
      approvedAt: bulletinVerifications.approvedAt,
      expiresAt: bulletinVerifications.expiresAt,
      verificationCount: bulletinVerifications.verificationCount
    })
    .from(bulletinVerifications)
    .where(
      and(
        sql`(${bulletinVerifications.verificationCode} = ${code} OR ${bulletinVerifications.shortCode} = ${code})`,
        eq(bulletinVerifications.isActive, true)
      )
    )
    .limit(1);
    
    // Log verification attempt
    const logData = {
      verificationId: verificationRecord[0]?.id || null,
      accessType: 'qr_scan' as const,
      accessResult: 'invalid_code' as const,
      sessionId: req.sessionID || null,
      userRole: 'public' as const,
      ipAddress: clientIP,
      userAgent: userAgent,
      verificationMethod: code.length > 10 ? 'qr_code' : 'manual_entry',
      referrer: req.get('Referer') || null,
      accessMetadata: {
        language,
        timestamp: new Date().toISOString(),
        codeLength: code.length
      }
    };
    
    // Check if verification record exists
    if (!verificationRecord.length) {
      // Log failed attempt
      await db.insert(bulletinVerificationLogs).values({
        ...logData,
        accessResult: 'invalid_code'
      });
      
      return res.status(404).json({
        success: false,
        message: 'Invalid verification code. Please check the code and try again.',
        messageFr: 'Code de vérification invalide. Veuillez vérifier le code et réessayer.',
        errorCode: 'INVALID_CODE'
      });
    }
    
    const verification = verificationRecord[0];
    
    // Check if bulletin has expired
    if (verification.expiresAt && new Date() > verification.expiresAt) {
      await db.insert(bulletinVerificationLogs).values({
        ...logData,
        verificationId: verification.id,
        accessResult: 'expired'
      });
      
      return res.status(410).json({
        success: false,
        message: 'This bulletin verification has expired.',
        messageFr: 'Cette vérification de bulletin a expiré.',
        errorCode: 'EXPIRED'
      });
    }
    
    // Get school verification settings
    const schoolSettings = await db.select()
      .from(bulletinVerificationSettings)
      .where(eq(bulletinVerificationSettings.schoolId, verification.schoolId))
      .limit(1);
    
    const settings = schoolSettings[0] || {
      enablePublicVerification: true,
      showStudentPhoto: true,
      showSchoolLogo: true,
      showDetailedGrades: false
    };
    
    if (!settings.enablePublicVerification) {
      await db.insert(bulletinVerificationLogs).values({
        ...logData,
        verificationId: verification.id,
        accessResult: 'access_denied'
      });
      
      return res.status(403).json({
        success: false,
        message: 'Public verification is not enabled for this institution.',
        messageFr: 'La vérification publique n\'est pas activée pour cet établissement.',
        errorCode: 'ACCESS_DENIED'
      });
    }
    
    // Successful verification - update counter and log
    await Promise.all([
      // Increment verification counter
      db.update(bulletinVerifications)
        .set({ 
          verificationCount: sql`${bulletinVerifications.verificationCount} + 1`,
          lastVerifiedAt: new Date(),
          lastVerifiedIP: clientIP
        })
        .where(eq(bulletinVerifications.id, verification.id)),
      
      // Log successful verification
      db.insert(bulletinVerificationLogs).values({
        ...logData,
        verificationId: verification.id,
        accessResult: 'success'
      })
    ]);
    
    console.log(`[BULLETIN_VERIFY] ✅ Successful verification for ${verification.studentName} - ${verification.schoolName}`);
    
    // Return bulletin verification data
    const responseData = {
      success: true,
      message: language === 'fr' ? 'Bulletin vérifié avec succès' : 'Bulletin verified successfully',
      data: {
        student: {
          name: verification.studentName,
          matricule: verification.studentMatricule,
          class: verification.className
        },
        school: {
          name: verification.schoolName,
          id: verification.schoolId
        },
        academic: {
          term: verification.term,
          academicYear: verification.academicYear,
          generalAverage: verification.generalAverage,
          classRank: verification.classRank,
          totalStudents: verification.totalStudents
        },
        verification: {
          issuedAt: verification.issuedAt,
          approvedAt: verification.approvedAt,
          verificationCount: verification.verificationCount + 1,
          shortCode: verification.shortCode
        },
        settings: {
          showStudentPhoto: settings.showStudentPhoto,
          showSchoolLogo: settings.showSchoolLogo,
          showDetailedGrades: settings.showDetailedGrades
        }
      }
    };
    
    res.json(responseData);
    
  } catch (error: any) {
    console.error('[BULLETIN_VERIFY] ❌ Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification',
      messageFr: 'Erreur interne du serveur lors de la vérification',
      errorCode: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/bulletins/verify - Alternative verification method with more data
router.post('/verify', rateLimitVerification, async (req, res) => {
  try {
    const validation = verifyBulletinSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification data',
        messageFr: 'Données de vérification invalides',
        errors: validation.error.errors
      });
    }
    
    const { code, language } = validation.data;
    
    // Same verification logic as GET endpoint
    // This endpoint allows for more complex verification data in the future
    const queryParams = new URLSearchParams({ code, language });
    
    // Redirect to GET endpoint with same functionality
    // This maintains consistency while allowing for future POST-specific features
    req.query = { code, language };
    
    // Call the GET handler
    return router.handle(Object.assign(req, { method: 'GET', url: `/verify?${queryParams}` }), res);
    
  } catch (error: any) {
    console.error('[BULLETIN_VERIFY] ❌ POST verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification',
      messageFr: 'Erreur interne du serveur lors de la vérification',
      errorCode: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/bulletins/verification-settings/:schoolId - Get school verification settings (admin only)
router.get('/verification-settings/:schoolId', async (req, res) => {
  try {
    // Note: Add authentication middleware in production
    const schoolId = parseInt(req.params.schoolId);
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID'
      });
    }
    
    const settings = await db.select()
      .from(bulletinVerificationSettings)
      .where(eq(bulletinVerificationSettings.schoolId, schoolId))
      .limit(1);
    
    if (!settings.length) {
      // Return default settings if none exist
      return res.json({
        success: true,
        data: {
          enableQRCodes: true,
          enablePublicVerification: true,
          requireAuthentication: false,
          showStudentPhoto: true,
          showSchoolLogo: true,
          showDetailedGrades: false,
          maxVerificationsPerHour: 10
        }
      });
    }
    
    res.json({
      success: true,
      data: settings[0]
    });
    
  } catch (error: any) {
    console.error('[VERIFICATION_SETTINGS] ❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification settings'
    });
  }
});

// GET /api/bulletins/verification-stats/:schoolId - Get verification statistics (admin only)
router.get('/verification-stats/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { startDate, endDate } = req.query;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID'
      });
    }
    
    // Get verification statistics
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_verifications,
        COUNT(DISTINCT bv.student_id) as unique_students,
        COUNT(CASE WHEN bvl.access_result = 'success' THEN 1 END) as successful_verifications,
        COUNT(CASE WHEN bvl.access_result = 'invalid_code' THEN 1 END) as failed_verifications,
        COUNT(CASE WHEN bvl.verification_method = 'qr_code' THEN 1 END) as qr_verifications,
        COUNT(CASE WHEN bvl.verification_method = 'manual_entry' THEN 1 END) as manual_verifications
      FROM bulletin_verifications bv
      LEFT JOIN bulletin_verification_logs bvl ON bv.id = bvl.verification_id
      WHERE bv.school_id = ${schoolId}
        ${startDate ? sql`AND bvl.created_at >= ${startDate}` : sql``}
        ${endDate ? sql`AND bvl.created_at <= ${endDate}` : sql``}
    `);
    
    res.json({
      success: true,
      data: {
        stats: stats.rows[0] || {
          total_verifications: 0,
          unique_students: 0,
          successful_verifications: 0,
          failed_verifications: 0,
          qr_verifications: 0,
          manual_verifications: 0
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
    
  } catch (error: any) {
    console.error('[VERIFICATION_STATS] ❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification statistics'
    });
  }
});

export default router;