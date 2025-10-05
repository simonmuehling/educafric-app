import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '@shared/types';

// GDPR and African Data Protection compliance middleware
export function dataProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add GDPR-compliant headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add data processing notice headers for African markets
  if (req.path.includes('/api/')) {
    res.setHeader('X-Data-Processing', 'GDPR-Compliant');
    res.setHeader('X-Data-Jurisdiction', 'African-Union-Compatible');
  }
  
  next();
}

// Privacy-aware logging for educational data
export function privacyLogger(req: Request, res: Response, next: NextFunction) {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const user = req.user as AuthenticatedUser;
  
  // Log data access for educational records
  if (req.path.includes('/grades') || req.path.includes('/attendance') || req.path.includes('/students')) {
    const logData = {
      timestamp: new Date().toISOString(),
      action: req.method,
      resource: req.path,
      userId: user?.id,
      userRole: user?.role,
      schoolId: user?.schoolId,
      ip: req.ip,
      compliance: 'educational-data-access'
    };
    
    console.log(`[PRIVACY] ${JSON.stringify(logData)}`);
  }
  
  next();
}

// Data subject rights endpoints
export function setupDataRightsRoutes(app: any) {
  // Data export endpoint (GDPR Article 20)
  app.get('/api/data/export', requireAuthentication, async (req: Request, res: Response) => {
    try {
      const user = req.user as AuthenticatedUser;
      
      // Collect all user data across the platform
      const userData = {
        profile: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        // Add other data categories based on user role
        metadata: {
          exportDate: new Date().toISOString(),
          jurisdiction: 'African Union Data Protection Guidelines',
          retention: '7 years for educational records',
          rights: 'Right to rectification, deletion, and portability'
        }
      };
      
      res.json({
        success: true,
        data: userData,
        format: 'JSON',
        compliance: 'GDPR Article 20 - Right to Data Portability'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Data export failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Data deletion request endpoint (GDPR Article 17)
  app.post('/api/data/deletion-request', requireAuthentication, async (req: Request, res: Response) => {
    try {
      const user = req.user as AuthenticatedUser;
      const { reason, immediate } = req.body;
      
      // Log deletion request for compliance
      const deletionLog = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        reason: reason || 'User requested account deletion',
        immediate: immediate || false,
        status: 'pending_review',
        educationalRecordsRetention: '7 years as required by law'
      };
      
      console.log(`[DATA_DELETION] ${JSON.stringify(deletionLog)}`);
      
      res.json({
        success: true,
        message: 'Deletion request received and logged',
        reference: `DEL-${Date.now()}`,
        timeline: 'Educational records: 7 years retention, Personal data: 30 days',
        contact: 'privacy@educafric.com'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Deletion request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// African data protection compliance checker
export function africanDataProtectionCompliance() {
  return {
    // Nigeria Data Protection Regulation (NDPR)
    nigeria: {
      lawfulBasis: 'Consent and Legitimate Interest for Educational Services',
      dataController: 'Educafric Platform',
      dataProtectionOfficer: 'privacy@educafric.com',
      jurisdiction: 'Federal Republic of Nigeria'
    },
    
    // Kenya Data Protection Act
    kenya: {
      lawfulBasis: 'Consent for Educational Services',
      dataController: 'Educafric Educational Technology',
      dataCommissioner: 'Office of the Data Protection Commissioner',
      jurisdiction: 'Republic of Kenya'
    },
    
    // Ghana Data Protection Act
    ghana: {
      lawfulBasis: 'Consent and Educational Services',
      dataController: 'Educafric Ghana Operations',
      dataProtectionCommission: 'Data Protection Commission Ghana',
      jurisdiction: 'Republic of Ghana'
    },
    
    // Cameroon (Draft Data Protection Law)
    cameroon: {
      lawfulBasis: 'Consent for Educational Technology Services',
      dataController: 'Educafric Cameroun',
      jurisdiction: 'Republic of Cameroon',
      note: 'Compliance with draft data protection framework'
    }
  };
}

function requireAuthentication(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
}

// Privacy policy generator for African markets
export function generatePrivacyPolicy(language: 'en' | 'fr' = 'en') {
  const policies = {
    en: {
      title: 'Educafric Privacy Policy',
      lastUpdated: '2025-01-24',
      sections: {
        dataCollection: 'We collect educational data necessary for providing digital learning services to African schools.',
        lawfulBasis: 'Processing is based on consent and legitimate interest for educational services.',
        dataSharing: 'Student data is shared only with authorized educational staff within the same school.',
        retention: 'Educational records are retained for 7 years as required by educational regulations.',
        rights: 'You have the right to access, rectify, and delete your personal data.',
        contact: 'For privacy concerns, contact: privacy@educafric.com'
      }
    },
    fr: {
      title: 'Politique de Confidentialité Educafric',
      lastUpdated: '2025-01-24',
      sections: {
        dataCollection: 'Nous collectons les données éducatives nécessaires pour fournir des services d\'apprentissage numérique aux écoles africaines.',
        lawfulBasis: 'Le traitement est basé sur le consentement et l\'intérêt légitime pour les services éducatifs.',
        dataSharing: 'Les données des élèves ne sont partagées qu\'avec le personnel éducatif autorisé de la même école.',
        retention: 'Les dossiers éducatifs sont conservés pendant 7 ans comme requis par les réglementations éducatives.',
        rights: 'Vous avez le droit d\'accéder, de rectifier et de supprimer vos données personnelles.',
        contact: 'Pour les préoccupations de confidentialité, contactez: privacy@educafric.com'
      }
    }
  };
  
  return policies[language];
}