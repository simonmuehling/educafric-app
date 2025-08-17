import QRCode from 'qrcode';
import crypto from 'crypto';
import { storage } from '../storage';

export class BulletinValidationService {
  /**
   * Generate QR code for bulletin validation
   */
  static async generateBulletinQRCode(bulletinData: {
    bulletinId: number;
    studentId: number;
    schoolId: number;
    teacherSignature?: string;
    directorSignature?: string;
    schoolStamp?: string;
  }): Promise<{
    qrCode: string;
    qrCodeImageUrl: string;
    validationHash: string;
  }> {
    // Create validation data
    const validationData = {
      bulletinId: bulletinData.bulletinId,
      studentId: bulletinData.studentId,
      schoolId: bulletinData.schoolId,
      timestamp: new Date().toISOString(),
      signatures: {
        teacher: bulletinData.teacherSignature ? this.hashSignature(bulletinData.teacherSignature) : null,
        director: bulletinData.directorSignature ? this.hashSignature(bulletinData.directorSignature) : null,
        stamp: bulletinData.schoolStamp ? this.hashSignature(bulletinData.schoolStamp) : null,
      }
    };

    // Generate validation hash
    const validationHash = this.generateValidationHash(validationData);
    
    // Create QR code data
    const qrData = JSON.stringify({
      type: 'educafric_bulletin',
      version: '2025.1',
      bulletinId: bulletinData.bulletinId,
      hash: validationHash,
      verifyUrl: `${process.env.BASE_URL || 'https://educafric.com'}/verify/${validationHash}`
    });

    // Generate QR code image
    const qrCodeImageUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });

    return {
      qrCode: qrData,
      qrCodeImageUrl,
      validationHash
    };
  }

  /**
   * Validate bulletin using QR code or hash
   */
  static async validateBulletin(validationHash: string): Promise<{
    isValid: boolean;
    bulletinData?: any;
    validationInfo?: any;
    errorMessage?: string;
  }> {
    try {
      // Look up validation record (placeholder - implement storage method)
      const validation = null; // await storage.getBulletinValidationByHash(validationHash);
      
      if (!validation) {
        return {
          isValid: false,
          errorMessage: 'Bulletin validation not found'
        };
      }

      // Check if validation has expired
      if (validation.expiresAt && new Date() > new Date(validation.expiresAt)) {
        return {
          isValid: false,
          errorMessage: 'Bulletin validation has expired'
        };
      }

      // Verify integrity
      const integrityCheck = await this.verifyBulletinIntegrity(validation);
      
      if (!integrityCheck.isValid) {
        return {
          isValid: false,
          errorMessage: integrityCheck.errorMessage
        };
      }

      // Get bulletin data
      const bulletinData = await storage.getBulletinById(validation.bulletinId);
      const student = await storage.getUserById(validation.studentId);
      const school = await storage.getSchoolById(validation.schoolId);

      // Record verification
      await this.recordVerification(validation.id, {
        verificationMethod: 'hash_lookup',
        verificationResult: 'valid',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: true,
        bulletinData: {
          ...bulletinData,
          student: {
            firstName: student?.firstName,
            lastName: student?.lastName,
            className: bulletinData.className
          },
          school: {
            name: school?.name,
            logo: school?.schoolLogoUrl,
            stamp: school?.schoolStampUrl
          }
        },
        validationInfo: {
          validatedAt: validation.validatedAt,
          validationType: validation.validationType,
          validationLevel: validation.validationLevel,
          verificationCount: validation.verificationCount + 1
        }
      };

    } catch (error) {
      console.error('[BULLETIN_VALIDATION] Validation error:', error);
      return {
        isValid: false,
        errorMessage: 'Validation service error'
      };
    }
  }

  /**
   * Create comprehensive bulletin validation with stamps and signatures
   */
  static async createBulletinValidation(data: {
    bulletinId: number;
    studentId: number;
    schoolId: number;
    teacherSignatureUrl?: string;
    directorSignatureUrl?: string;
    schoolStampUrl?: string;
    validationType: 'qr_code' | 'digital_signature' | 'combined';
    validationLevel: 'basic' | 'enhanced' | 'maximum';
  }) {
    // Generate QR code
    const qrResult = await this.generateBulletinQRCode({
      bulletinId: data.bulletinId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      teacherSignature: data.teacherSignatureUrl,
      directorSignature: data.directorSignatureUrl,
      schoolStamp: data.schoolStampUrl
    });

    // Create bulletin hash
    const bulletinHash = await this.generateBulletinHash(data.bulletinId);

    // Create validation record
    const validation = await storage.createBulletinValidation({
      bulletinId: data.bulletinId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      qrCode: qrResult.qrCode,
      qrCodeImageUrl: qrResult.qrCodeImageUrl,
      validationHash: qrResult.validationHash,
      teacherSignatureHash: data.teacherSignatureUrl ? this.hashSignature(data.teacherSignatureUrl) : null,
      directorSignatureHash: data.directorSignatureUrl ? this.hashSignature(data.directorSignatureUrl) : null,
      schoolStampHash: data.schoolStampUrl ? this.hashSignature(data.schoolStampUrl) : null,
      validationType: data.validationType,
      validationLevel: data.validationLevel,
      originalBulletinHash: bulletinHash,
      currentBulletinHash: bulletinHash,
      integrityStatus: 'intact'
    });

    return validation;
  }

  /**
   * Verify bulletin integrity
   */
  private static async verifyBulletinIntegrity(validation: any): Promise<{
    isValid: boolean;
    errorMessage?: string;
  }> {
    // Generate current hash of bulletin
    const currentHash = await this.generateBulletinHash(validation.bulletinId);
    
    if (currentHash !== validation.originalBulletinHash) {
      return {
        isValid: false,
        errorMessage: 'Bulletin has been modified since validation'
      };
    }

    return { isValid: true };
  }

  /**
   * Generate cryptographic hash for validation
   */
  private static generateValidationHash(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Generate hash for signature or stamp
   */
  private static hashSignature(signatureUrl: string): string {
    return crypto
      .createHash('sha256')
      .update(signatureUrl + process.env.SIGNATURE_SALT || 'educafric_2025')
      .digest('hex');
  }

  /**
   * Generate bulletin content hash
   */
  private static async generateBulletinHash(bulletinId: number): Promise<string> {
    // Get bulletin data
    const bulletin = await storage.getBulletinById(bulletinId);
    
    // Create hash of essential bulletin data
    const hashData = {
      bulletinId,
      studentId: bulletin.studentId,
      grades: bulletin.grades,
      generalAverage: bulletin.generalAverage,
      classRank: bulletin.classRank,
      createdAt: bulletin.createdAt
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  /**
   * Record verification attempt
   */
  private static async recordVerification(validationId: number, verificationData: any) {
    await storage.createQrVerification({
      bulletinValidationId: validationId,
      verifierIp: verificationData.verifierIp,
      verificationMethod: verificationData.verificationMethod,
      verificationResult: verificationData.verificationResult,
      verificationData: verificationData,
      timestamp: new Date().toISOString()
    });

    // Update verification count
    await storage.incrementValidationVerificationCount(validationId);
  }

  /**
   * Get validation statistics for school
   */
  static async getSchoolValidationStats(schoolId: number) {
    return await storage.getSchoolValidationStats(schoolId);
  }

  /**
   * Verify QR code by scanning
   */
  static async verifyQRCode(qrCodeData: string): Promise<{
    isValid: boolean;
    bulletinData?: any;
    errorMessage?: string;
  }> {
    try {
      const parsedData = JSON.parse(qrCodeData);
      
      if (parsedData.type !== 'educafric_bulletin') {
        return {
          isValid: false,
          errorMessage: 'Invalid QR code type'
        };
      }

      return await this.validateBulletin(parsedData.hash);
      
    } catch (error) {
      return {
        isValid: false,
        errorMessage: 'Invalid QR code format'
      };
    }
  }
}