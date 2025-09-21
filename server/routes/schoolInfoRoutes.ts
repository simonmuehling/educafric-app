import express from 'express';
import { requireAuth, requireAnyRole } from '../middleware/auth';
import { db } from '../db';
import { schools } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get school information including official Cameroon government details and logo
router.get('/info', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher', 'Student', 'Parent']), async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'User not associated with a school'
      });
    }
    
    console.log('[SCHOOL_INFO] 🏫 Fetching school info for school:', schoolId);
    
    const school = await db.select({
      id: schools.id,
      name: schools.name,
      address: schools.address,
      phone: schools.phone,
      email: schools.email,
      logoUrl: schools.logoUrl,
      regionaleMinisterielle: schools.regionaleMinisterielle,
      delegationDepartementale: schools.delegationDepartementale,
      boitePostale: schools.boitePostale,
      arrondissement: schools.arrondissement,
      academicYear: schools.academicYear,
      currentTerm: schools.currentTerm,
      settings: schools.settings
    }).from(schools).where(eq(schools.id, schoolId)).limit(1);
    
    if (!school.length) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }
    
    const schoolData = school[0];
    
    // Return school info with official Cameroon government details
    const response = {
      id: schoolData.id,
      name: schoolData.name,
      address: schoolData.address,
      phone: schoolData.phone,
      email: schoolData.email,
      logoUrl: schoolData.logoUrl,
      // Official Cameroon government information for documents
      officialInfo: {
        regionaleMinisterielle: schoolData.regionaleMinisterielle || 'DÉLÉGATION RÉGIONALE DU CENTRE',
        delegationDepartementale: schoolData.delegationDepartementale || 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI',
        boitePostale: schoolData.boitePostale,
        arrondissement: schoolData.arrondissement,
      },
      // Additional school details
      academicYear: schoolData.academicYear,
      currentTerm: schoolData.currentTerm,
      settings: schoolData.settings
    };
    
    console.log('[SCHOOL_INFO] ✅ School info retrieved:', {
      schoolId,
      name: schoolData.name,
      hasLogo: !!schoolData.logoUrl,
      hasOfficialInfo: !!(schoolData.regionaleMinisterielle || schoolData.delegationDepartementale)
    });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('[SCHOOL_INFO] ❌ Error fetching school info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school information'
    });
  }
});

// Get school logo URL specifically
router.get('/logo', requireAuth, requireAnyRole(['Admin', 'Director', 'Teacher', 'Student', 'Parent']), async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'User not associated with a school'
      });
    }
    
    const school = await db.select({
      logoUrl: schools.logoUrl
    }).from(schools).where(eq(schools.id, schoolId)).limit(1);
    
    if (!school.length) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }
    
    const logoUrl = school[0].logoUrl;
    
    if (logoUrl) {
      res.json({
        success: true,
        data: { logoUrl }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'School logo not found'
      });
    }
  } catch (error) {
    console.error('[SCHOOL_INFO] ❌ Error fetching school logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school logo'
    });
  }
});

export default router;