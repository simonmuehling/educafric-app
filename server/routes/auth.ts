import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import rateLimit from 'express-rate-limit';
import { eq, sql } from 'drizzle-orm';
import { storage } from '../storage';
import { db } from '../db';
import { schools } from '@shared/schema';
import { createUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema, changePasswordSchema } from '@shared/schemas';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { hostingerMailService } from '../services/hostingerMailService.js';

const router = Router();

// Session cache to prevent repeated DB queries
interface CachedUser {
  user: any;
  timestamp: number;
}

const userSessionCache = new Map<string | number, CachedUser>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUser(id: string | number): any | null {
  const cached = userSessionCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  if (cached) {
    userSessionCache.delete(id);
  }
  return null;
}

function setCachedUser(id: string | number, user: any): void {
  userSessionCache.set(id, { user, timestamp: Date.now() });
}

function clearCachedUser(id: string | number): void {
  userSessionCache.delete(id);
}

// Clean up expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, cached] of userSessionCache.entries()) {
    if (now - cached.timestamp >= CACHE_TTL) {
      userSessionCache.delete(id);
    }
  }
}, 10 * 60 * 1000);

// Rate limiting for sandbox login to prevent email spam
const sandboxLoginLimiter = rateLimit({
  windowMs: parseInt(process.env.SANDBOX_RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes default
  max: parseInt(process.env.SANDBOX_RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests per window
  message: {
    error: 'Too many sandbox login attempts',
    message: 'Please wait before trying to login to sandbox again',
    retryAfter: '5 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log(`[SANDBOX_RATE_LIMIT] Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many sandbox login attempts',
      message: 'Please wait before trying to login to sandbox again',
      retryAfter: '5 minutes'
    });
  },
  skip: (req) => {
    // Skip rate limiting if SANDBOX_ALERTS_ENABLED is false
    return (process.env.SANDBOX_ALERTS_ENABLED || 'true') === 'false';
  }
});

// Passport configuration - Support login with EMAIL or PHONE
passport.use(new LocalStrategy(
  { 
    usernameField: 'email', // We keep this for compatibility but will check both
    passReqToCallback: true  // Access full request to check phone too
  },
  async (req, email, password, done) => {
    try {
      let user = null;
      
      // Get phone from either phoneNumber field OR from email field (if it's not an email)
      let phone = req.body.phoneNumber || req.body.phone;
      
      // If email field doesn't contain @ symbol, treat it as a phone number
      if (email && !email.includes('@')) {
        phone = email;
        email = null; // Clear email since it's actually a phone number
      }

      // Normalize phone number: add + if missing
      if (phone && !phone.startsWith('+')) {
        phone = '+' + phone;
        console.log(`[AUTH_STRATEGY] Normalized phone number: ${phone}`);
      }

      // Try to find user by email first (if provided)
      if (email) {
        user = await storage.getUserByEmail(email);
        console.log(`[AUTH_STRATEGY] Login attempt with email: ${email}`);
      }
      
      // If no user found by email, try by phone number
      if (!user && phone) {
        user = await storage.getUserByPhone(phone);
        console.log(`[AUTH_STRATEGY] Login attempt with phone: ${phone}`);
      }
      
      if (!user) {
        return done(null, false, { message: 'Email, téléphone ou mot de passe incorrect / Invalid email, phone or password' });
      }

      // Check if account has been deleted
      if (user.deletionRequested || user.deletionApprovedAt) {
        console.log(`[AUTH_STRATEGY] Blocked login attempt for deleted account: ${user.email || user.phone}`);
        return done(null, false, { message: 'Ce compte a été supprimé / This account has been deleted' });
      }

      const isValidPassword = await storage.verifyPassword(user, password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Email, téléphone ou mot de passe incorrect / Invalid email, phone or password' });
      }

      console.log(`[AUTH_STRATEGY] ✅ Successful login: ${user.email || user.phone} (ID: ${user.id})`);
      return done(null, user);
    } catch (error) {
      console.error(`[AUTH_STRATEGY] Error during authentication: ${error}`);
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  try {
    // Validate user object exists and has required properties
    if (!user || typeof user !== 'object' || !user.id) {
      console.error('[AUTH_SERIALIZE] ❌ Invalid user object:', user);
      return done(new Error('Invalid user object for serialization'));
    }
    
    if (user.sandboxMode) {
      done(null, `sandbox:${user.id}`);
    } else {
      done(null, user.id);
    }
  } catch (error) {
    console.error('[AUTH_ERROR] User serialization failed:', error);
    done(error);
  }
});

passport.deserializeUser(async (id: string | number, done) => {
  try {
    // Validate input
    if (!id) {
      return done(null, false);
    }

    // Handle sandbox users with safe ID parsing
    if (typeof id === 'string' && id.startsWith('sandbox:')) {
      const sandboxIdStr = id.replace('sandbox:', '');
      const sandboxId = parseInt(sandboxIdStr);
      
      // Validate the parsed ID is a valid number
      if (isNaN(sandboxId) || sandboxId <= 0) {
        return done(null, false);
      }
      
      // Check cache first for sandbox users
      const cachedSandboxUser = getCachedUser(id);
      if (cachedSandboxUser) {
        return done(null, cachedSandboxUser);
      }
      
      // Return sandbox user data (reconstruct from sandboxProfiles)
      const sandboxProfiles = {
        9001: { id: 9001, name: 'Marie Kamga', role: 'Parent', email: 'sandbox.parent@educafric.demo', schoolId: 999, children: [9004], phone: '+237650123456', address: 'Quartier Bastos, Yaoundé', profession: 'Infirmière', maritalStatus: 'Mariée', emergencyContact: '+237651234567' },
        9002: { id: 9002, name: 'Paul Mvondo', role: 'Teacher', email: 'sandbox.teacher@educafric.demo', schoolId: 999, subjects: ['Mathématiques', 'Physique'], classes: ['3ème A', '2nde B'], phone: '+237651123456', address: 'Quartier Mvan, Yaoundé', specialization: 'Sciences Exactes', experience: '8 ans' },
        9004: { id: 9004, name: 'Junior Kamga', role: 'Student', email: 'sandbox.student@educafric.demo', schoolId: 999, parentId: 9001, classId: 301, className: '3ème A', age: 14, phone: '+237653123456', address: 'Quartier Bastos, Yaoundé', parentName: 'Marie Kamga', subjects: ['Mathématiques', 'Français', 'Sciences', 'Histoire'] },
        9005: { id: 9005, name: 'Dr. Nguetsop Carine', role: 'Admin', email: 'sandbox.admin@educafric.demo', schoolId: 999, phone: '+237654123456', address: 'Quartier Essos, Yaoundé', title: 'Directrice Pédagogique', department: 'Administration', qualification: 'Doctorat en Sciences de l\'Éducation' },
        9006: { id: 9006, name: 'Prof. Atangana Michel', role: 'Director', email: 'sandbox.director@educafric.demo', schoolId: 999, phone: '+237655123456', address: 'Quartier Bastos, Yaoundé', title: 'Directeur Général', qualification: 'Doctorat en Éducation' },
        9008: { id: 9008, name: 'Admin Système', role: 'SiteAdmin', email: 'sandbox.siteadmin@educafric.demo', schoolId: 999, phone: '+237657123456', address: 'Bureau Central, Yaoundé', title: 'Administrateur Système', department: 'IT & Sécurité' }
      };
      
      const profile = sandboxProfiles[sandboxId as keyof typeof sandboxProfiles];
      if (profile) {
        const sandboxUser = {
          ...profile,
          subscription: 'premium',
          sandboxMode: true,
          isSandboxUser: true,
          premiumFeatures: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          sandboxData: {
            schoolName: 'École Internationale de Yaoundé - Campus Sandbox',
            schoolType: 'Établissement Privé Bilingue',
            academicYear: '2024-2025',
            currentTerm: 'Trimestre 2',
            currency: 'CFA',
            location: 'Yaoundé, Cameroun',
            motto: 'Excellence et Innovation Pédagogique'
          }
        };
        setCachedUser(id, sandboxUser);
        return done(null, sandboxUser);
      } else {
        return done(null, false);
      }
    }
    
    // Handle regular database users - check cache first
    try {
      const userId = typeof id === 'string' ? parseInt(id) : id;
      
      if (isNaN(userId as number)) {
        return done(null, false);
      }
      
      // Check cache first
      const cachedUser = getCachedUser(userId as number);
      if (cachedUser) {
        return done(null, cachedUser);
      }
      
      // Cache miss - fetch from database
      const user = await storage.getUserById(userId as number);
      
      if (user) {
        setCachedUser(userId as number, user);
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (dbError) {
      console.error('[AUTH_DESERIALIZE] Database error:', dbError);
      return done(null, false);
    }
  } catch (error) {
    console.error('[AUTH_ERROR] User deserialization failed');
    return done(null, false);
  }
});

// Authentication routes
router.get('/me', async (req, res) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user as any;
    
    // Fetch role affiliations for multi-role support
    let roleAffiliations: any[] = [];
    let secondaryRoles: string[] = [];
    
    try {
      if (user && user.id && !user.sandboxMode) {
        // Fetch roleAffiliations from database
        const affiliations = await storage.getUserRoleAffiliations(user.id);
        
        if (affiliations && affiliations.length > 0) {
          roleAffiliations = affiliations.map(a => ({
            id: a.id,
            role: a.role,
            schoolId: a.schoolId,
            description: a.description,
            status: a.status,
            metadata: a.metadata
          }));
          
          // Extract unique secondary roles (excluding primary role)
          secondaryRoles = [...new Set(
            affiliations
              .filter(a => a.role !== user.role && a.status === 'active')
              .map(a => a.role)
          )];
          
          console.log(`[AUTH_ME] User ${user.id} has ${roleAffiliations.length} role affiliations, ${secondaryRoles.length} secondary roles`);
        }
      }
    } catch (affError) {
      console.error('[AUTH_ME] Error fetching role affiliations:', affError);
    }
    
    // Return user with role affiliations
    res.json({ 
      user: {
        ...user,
        roleAffiliations,
        secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : (user.secondaryRoles || [])
      }
    });
  } catch (error) {
    console.error('[AUTH_ERROR] Error processing authentication:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
});

// Check for duplicate email/phone before registration
router.post('/check-duplicate', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number required' });
    }

    const duplicates: any = {
      hasDuplicate: false,
      emailMatch: null,
      phoneMatch: null,
      existingUser: null
    };

    // Check email
    if (email) {
      const userByEmail = await storage.getUserByEmail(email);
      if (userByEmail) {
        duplicates.hasDuplicate = true;
        duplicates.emailMatch = true;
        duplicates.existingUser = {
          id: userByEmail.id,
          email: userByEmail.email,
          firstName: userByEmail.firstName,
          lastName: userByEmail.lastName,
          role: userByEmail.role,
          phone: userByEmail.phone,
          schoolId: userByEmail.schoolId
        };
      }
    }

    // Check phone
    if (phoneNumber) {
      const userByPhone = await storage.getUserByPhone(phoneNumber);
      if (userByPhone) {
        duplicates.hasDuplicate = true;
        duplicates.phoneMatch = true;
        if (!duplicates.existingUser) {
          duplicates.existingUser = {
            id: userByPhone.id,
            email: userByPhone.email,
            firstName: userByPhone.firstName,
            lastName: userByPhone.lastName,
            role: userByPhone.role,
            phone: userByPhone.phone,
            schoolId: userByPhone.schoolId
          };
        }
      }
    }

    res.json(duplicates);
  } catch (error) {
    console.error('[AUTH_ERROR] Duplicate check failed:', error);
    res.status(500).json({ message: 'Duplicate check failed' });
  }
});

// Import existing profile data to create new role
router.post('/import-profile', async (req, res) => {
  try {
    const { existingUserId, newRole, password } = req.body;
    
    if (!existingUserId || !newRole || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Block Freelancer registration until September 2026
    if (newRole === 'Freelancer') {
      return res.status(403).json({ 
        message: 'Freelancer registration is temporarily unavailable until September 2026',
        messageFr: 'L\'inscription en tant que Freelancer est temporairement indisponible jusqu\'à septembre 2026'
      });
    }

    // Get existing user
    const existingUser = await storage.getUserById(existingUserId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with new role and password
    const hashedPassword = await bcrypt.hash(password, 12);
    const updatedUser = await storage.updateUser(existingUserId, {
      role: newRole,
      password: hashedPassword
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: 'Profile imported successfully'
    });
  } catch (error) {
    console.error('[AUTH_ERROR] Profile import failed:', error);
    res.status(500).json({ message: 'Profile import failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    
    // Block Freelancer registration until September 2026
    if (validatedData.role === 'Freelancer') {
      return res.status(403).json({ 
        message: 'Freelancer registration is temporarily unavailable until September 2026',
        messageFr: 'L\'inscription en tant que Freelancer est temporairement indisponible jusqu\'à septembre 2026'
      });
    }

    // VALIDATE EDUCAFRIC NUMBER FOR DIRECTORS
    if (validatedData.role === 'Director') {
      const educafricNumber = req.body.educafricNumber;
      
      if (!educafricNumber) {
        return res.status(400).json({ 
          message: 'Un numéro EDUCAFRIC est obligatoire pour l\'inscription en tant que Directeur',
          messageFr: 'Un numéro EDUCAFRIC est obligatoire pour l\'inscription en tant que Directeur',
          messageEn: 'An EDUCAFRIC number is required to register as a Director'
        });
      }

      // Verify the EDUCAFRIC number is valid and available
      const { EducafricNumberService } = await import("../services/educafricNumberService");
      const verification = await EducafricNumberService.verifySchoolNumber(educafricNumber);
      
      if (!verification.valid) {
        console.error('[AUTH_REGISTER] Invalid EDUCAFRIC number for Director registration:', verification.message);
        return res.status(400).json({ 
          message: verification.message,
          messageFr: verification.messageFr,
          messageEn: verification.messageEn
        });
      }

      console.log('[AUTH_REGISTER] Verified EDUCAFRIC number for Director:', educafricNumber);
    }
    
    // Check for existing user by email (if provided)
    if (validatedData.email) {
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ 
          message: `Un compte existe déjà avec l'email "${validatedData.email}". Utilisez un autre email ou connectez-vous.`,
          messageFr: `Un compte existe déjà avec l'email "${validatedData.email}". Utilisez un autre email ou connectez-vous.`,
          messageEn: `An account already exists with the email "${validatedData.email}". Use a different email or log in.`
        });
      }
    }
    
    // Check for existing user by phone
    if (validatedData.phoneNumber) {
      const existingPhone = await storage.getUserByPhone(validatedData.phoneNumber);
      if (existingPhone) {
        // Provide specific message based on the existing user's role
        const roleMessages: Record<string, { fr: string; en: string }> = {
          Director: {
            fr: `Ce numéro de téléphone "${validatedData.phoneNumber}" est déjà utilisé par une école. Chaque école doit avoir un numéro de téléphone unique. Si c'est votre numéro, connectez-vous directement.`,
            en: `This phone number "${validatedData.phoneNumber}" is already used by a school. Each school must have a unique phone number. If this is your number, log in directly.`
          },
          default: {
            fr: `Un compte existe déjà avec le numéro "${validatedData.phoneNumber}". Utilisez un autre numéro ou connectez-vous.`,
            en: `An account already exists with the phone number "${validatedData.phoneNumber}". Use a different number or log in.`
          }
        };
        
        const msg = roleMessages[existingPhone.role] || roleMessages.default;
        console.log(`[AUTH_REGISTER] Phone already exists: ${validatedData.phoneNumber} (existing user: ${existingPhone.id}, role: ${existingPhone.role})`);
        
        return res.status(409).json({ 
          message: msg.fr,
          messageFr: msg.fr,
          messageEn: msg.en,
          existingRole: existingPhone.role
        });
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      phone: validatedData.phoneNumber, // Map phoneNumber to phone field
    });

    // If Director, create the school with the EDUCAFRIC number (sequential operations with manual rollback)
    if (validatedData.role === 'Director' && req.body.educafricNumber) {
      let school: any = null;
      
      try {
        // Step 1: Create school with EDUCAFRIC number
        school = await storage.createSchool({
          name: `École de ${validatedData.firstName} ${validatedData.lastName}`, // Temporary name
          type: 'private', // Default to private, can be changed later
          educationalType: 'general',
          address: '',
          phone: validatedData.phoneNumber,
          email: validatedData.email,
          educafricNumber: req.body.educafricNumber,
          academicYear: new Date().getFullYear().toString(),
          currentTerm: 'trimestre1',
          geolocationEnabled: false,
          pwaEnabled: true,
          whatsappEnabled: false,
          smsEnabled: false,
          emailEnabled: true
        });

        console.log('[AUTH_REGISTER] School created with ID:', school.id);

        // Step 2: Link Director to the school
        await storage.updateUser(user.id, { schoolId: school.id });
        console.log('[AUTH_REGISTER] ✅ Director linked to school ID:', school.id);

        // Step 3: Assign the EDUCAFRIC number to the school
        const { EducafricNumberService } = await import("../services/educafricNumberService");
        await EducafricNumberService.assignToSchool(req.body.educafricNumber, school.id);
        console.log('[AUTH_REGISTER] ✅ EDUCAFRIC number assigned to school:', req.body.educafricNumber);

        console.log('[AUTH_REGISTER] ✅ Registration complete - School and Director successfully linked');

      } catch (schoolError: any) {
        console.error('[AUTH_REGISTER] School/Director linking failed:', schoolError);
        
        // Manual rollback: Delete created resources in reverse order
        
        // 1. Delete the school if created
        if (school?.id) {
          try {
            await db.delete(schools).where(eq(schools.id, school.id));
            console.log('[AUTH_REGISTER] ✅ Rolled back school creation');
          } catch (rollbackError) {
            console.error('[AUTH_REGISTER] ⚠️ Failed to rollback school creation:', rollbackError);
          }
        }
        
        // 2. Delete the user
        try {
          await storage.deleteUser(user.id);
          console.log('[AUTH_REGISTER] ✅ Rolled back user creation');
        } catch (rollbackError) {
          console.error('[AUTH_REGISTER] ⚠️ Failed to rollback user creation:', rollbackError);
        }

        // 3. Release EDUCAFRIC number (in case it was partially assigned)
        try {
          const { EducafricNumberService } = await import("../services/educafricNumberService");
          await EducafricNumberService.releaseNumber(req.body.educafricNumber);
          console.log('[AUTH_REGISTER] ✅ Released EDUCAFRIC number:', req.body.educafricNumber);
        } catch (releaseError) {
          console.error('[AUTH_REGISTER] ⚠️ Failed to release EDUCAFRIC number:', releaseError);
        }

        return res.status(500).json({ 
          message: 'Échec de création de l\'école. ' + (schoolError.message || 'Veuillez réessayer ou contacter le support.'),
          messageFr: 'Échec de création de l\'école. ' + (schoolError.message || 'Veuillez réessayer ou contacter le support.'),
          messageEn: 'Failed to create school. ' + (schoolError.message || 'Please try again or contact support.')
        });
      }
    }

    // Send email notification for new user registration (non-blocking)
    try {
      const userIP = req.ip || (req.connection as any).remoteAddress || 'Unknown';
      const userName = `${validatedData.firstName || ''} ${validatedData.lastName || ''}`.trim();
      
      // Get country from IP (non-blocking)
      let country = 'Unknown';
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${userIP.replace('::ffff:', '')}?fields=status,country`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.country || 'Unknown';
          }
        }
      } catch (geoError) {
        console.log('[AUTH_REGISTER] Geolocation lookup failed, using defaults');
      }
      
      // Determine school name for Directors
      let schoolName = undefined;
      if (validatedData.role === 'Director' && req.body.educafricNumber) {
        schoolName = `École de ${userName}`;
      }
      
      await hostingerMailService.sendNewUserRegistrationAlert({
        name: userName,
        email: validatedData.email || undefined,
        phone: validatedData.phoneNumber,
        role: validatedData.role,
        registrationTime: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
        ip: userIP,
        country: country,
        schoolName: schoolName,
        educafricNumber: req.body.educafricNumber || undefined
      });
      
      console.log(`[AUTH_REGISTER] ✅ Registration email notification sent for: ${userName} (${validatedData.role})`);
    } catch (emailError) {
      console.error('[AUTH_REGISTER] Failed to send registration email notification:', emailError);
      // Don't fail registration if email fails
    }

    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    // Log error without exposing sensitive details
    if (error instanceof z.ZodError) {
      console.warn('[AUTH_VALIDATION] Registration validation failed:', error.errors);
      // Create user-friendly validation error messages
      const fieldErrors = error.errors.map(e => {
        const field = e.path.join('.');
        const fieldLabels: Record<string, { fr: string; en: string }> = {
          'firstName': { fr: 'Prénom', en: 'First name' },
          'lastName': { fr: 'Nom', en: 'Last name' },
          'email': { fr: 'Email', en: 'Email' },
          'phoneNumber': { fr: 'Numéro de téléphone', en: 'Phone number' },
          'password': { fr: 'Mot de passe', en: 'Password' },
          'role': { fr: 'Rôle', en: 'Role' }
        };
        const label = fieldLabels[field] || { fr: field, en: field };
        return `${label.fr}: ${e.message}`;
      }).join(', ');
      
      return res.status(400).json({ 
        message: `Erreur de validation: ${fieldErrors}`,
        messageFr: `Erreur de validation: ${fieldErrors}`,
        messageEn: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        errors: error.errors 
      });
    }
    
    console.error('[AUTH_ERROR] Registration failed:', error);
    res.status(500).json({ 
      message: 'Échec de l\'inscription. Veuillez réessayer ou contacter le support.',
      messageFr: 'Échec de l\'inscription. Veuillez réessayer ou contacter le support.',
      messageEn: 'Registration failed. Please try again or contact support.'
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      console.error('[AUTH_ERROR] Login authentication error:', err);
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }
    
    // Check if user has 2FA enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Store user ID in session for 2FA verification but don't fully authenticate
      req.session.pendingTwoFactorUserId = user.id;
      req.session.save();
      
      console.log(`[AUTH_2FA] 2FA required for user: ${user.email}`);
      return res.status(200).json({
        requires2FA: true,
        message: 'Two-factor authentication required',
        userId: user.id
      });
    }
    
    // CRITICAL FIX: Regenerate session to prevent session fixation and ensure fresh cookie
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('[AUTH_ERROR] Session regeneration error:', regenErr);
        return res.status(500).json({ message: 'Failed to regenerate session' });
      }
      
      console.log('[AUTH_SESSION] ✅ Session regenerated, new ID:', req.sessionID);
      
      // Manually log in the user to establish session
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('[AUTH_ERROR] Session creation error:', loginErr);
          return res.status(500).json({ message: 'Failed to create session' });
        }
        
        // Session creation successful
        
        // Force session save
        req.session.save(async (saveErr) => {
        if (saveErr) {
          console.error('[AUTH_ERROR] Session save error:', saveErr);
          return res.status(500).json({ message: 'Failed to save session' });
        }
        
        console.log('[AUTH_SESSION] Session saved successfully');
        console.log('[AUTH_SESSION] Session ID:', req.sessionID);
        console.log('[AUTH_SESSION] Session data:', { userId: (req.session as any).passport?.user });
        console.log('[AUTH_SESSION] Cookie will be set:', {
          name: 'educafric.sid',
          value: req.sessionID.substring(0, 10) + '...',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          domain: process.env.NODE_ENV === 'production' ? '.educafric.com' : 'undefined'
        });
        
        // Send commercial login alert and track activity if user is Commercial role
        if (user.role === 'Commercial') {
          // Exclude demo commercial from alerts (case-insensitive)
          const isDemoCommercial = user.email.toLowerCase() === 'commercial.demo@test.educafric.com'.toLowerCase();
          
          try {
            // Send email alert (skip for demo user)
            if (!isDemoCommercial) {
              const { hostingerMailService } = await import('../services/hostingerMailService');
              await hostingerMailService.sendCommercialLoginAlert({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                email: user.email,
                loginTime: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
                ip: req.ip || req.connection.remoteAddress || 'Unknown',
                schoolId: user.schoolId
              });
              console.log(`[COMMERCIAL_LOGIN] Alert sent for: ${user.email}`);
            }
            
            // Track login activity
            await storage.createCommercialActivity({
              commercialId: user.id,
              activityType: 'login',
              description: 'Commercial user logged in',
              metadata: {
                loginTime: new Date().toISOString(),
                userAgent: req.headers['user-agent']
              },
              ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
              userAgent: req.headers['user-agent'],
              schoolId: user.schoolId
            });
            console.log(`[COMMERCIAL_ACTIVITY] Login activity tracked for: ${user.email}`);
            
            // Send PWA notification to Carine (skip for demo user)
            if (!isDemoCommercial) {
              try {
                // Try to find Carine by her possible emails
                const carineEmails = [
                  'nguetsop.carine@educafric.com',
                  'carine.nguetsop@educafric.com', 
                  'carine@educafric.com',
                  'nguetsopcarine12@icloud.com',
                  'nguetsop.carine@yahoo.fr'
                ];
                
                let carineUser = null;
                for (const email of carineEmails) {
                  try {
                    carineUser = await storage.getUserByEmail(email);
                    if (carineUser) {
                      console.log(`[PWA_NOTIFICATION] 👤 Found Carine user: ${carineUser.email} (ID: ${carineUser.id})`);
                      break;
                    }
                  } catch (error) {
                    // Continue to next email if this one fails
                    continue;
                  }
                }
                
                // Use Carine's ID if found, otherwise log warning and use fallback
                let carineUserId;
                if (carineUser) {
                  carineUserId = carineUser.id;
                } else {
                  console.warn('[PWA_NOTIFICATION] ⚠️  Carine user not found, using fallback notification ID 999999');
                  carineUserId = 999999;
                }
                
                const loginTime = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' });
                const userIP = req.ip || req.connection.remoteAddress || 'Unknown';
                const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                
                // Send notification to both Carine and simon.admin
                const recipients = [
                  { id: carineUserId, name: 'Carine' },
                  { id: 2, name: 'simon.admin' }
                ];
                
                const notifications = [];
                for (const recipient of recipients) {
                  try {
                    const notification = await storage.createNotification({
                      userId: recipient.id,
                      title: '🔔 Connexion Commercial EDUCAFRIC',
                      message: `${userName} (${user.email}) s'est connecté le ${loginTime} depuis l'IP ${userIP}`,
                      type: 'commercial_login',
                      category: 'security',
                      priority: 'high',
                      actionRequired: false,
                      data: {
                        commercialId: user.id,
                        commercialEmail: user.email,
                        commercialName: userName,
                        loginTime: loginTime,
                        ipAddress: userIP,
                        userAgent: req.headers['user-agent'],
                        schoolId: user.schoolId
                      }
                    });
                    
                    notifications.push(notification);
                    const notificationId = notification?.id || 'unknown';
                    console.log(`[PWA_NOTIFICATION] 📱 Commercial login alert successfully created (ID: ${notificationId}) for recipient ${recipient.name} (${recipient.id}) - Commercial: ${user.email}`);
                  } catch (notificationError) {
                    console.error(`[PWA_NOTIFICATION] Failed to send notification to ${recipient.name} (${recipient.id}):`, notificationError);
                  }
                }
              } catch (pwaError) {
                console.error('[PWA_NOTIFICATION] Failed to send PWA notification to Carine:', pwaError);
              }
            }
          } catch (alertError) {
            console.error('[COMMERCIAL_LOGIN] Failed to send alert email or track activity:', alertError);
          }
        }
        
        // AUTO-SYNC: Synchronize multi-role data on login
        try {
          const { MultiRoleService } = await import('../services/multiRoleService');
          const syncResult = await MultiRoleService.syncRolesOnLogin(user.id);
          if (syncResult.synced) {
            console.log(`[MULTI_ROLE_SYNC] ✅ Roles synced for user ${user.id}: ${syncResult.message}`);
          }
        } catch (syncError) {
          console.error('[MULTI_ROLE_SYNC] Failed to sync roles on login:', syncError);
          // Don't fail login if sync fails
        }
        
        // Fetch role affiliations for multi-role support
        let roleAffiliations: any[] = [];
        let secondaryRoles: string[] = [];
        
        try {
          const affiliations = await storage.getUserRoleAffiliations(user.id);
          
          if (affiliations && affiliations.length > 0) {
            roleAffiliations = affiliations.map((a: any) => ({
              id: a.id,
              role: a.role,
              schoolId: a.schoolId,
              description: a.description,
              status: a.status,
              metadata: a.metadata
            }));
            
            // Extract unique secondary roles (excluding primary role)
            secondaryRoles = [...new Set(
              affiliations
                .filter((a: any) => a.role !== user.role && a.status === 'active')
                .map((a: any) => a.role)
            )] as string[];
            
            console.log(`[AUTH_LOGIN] User ${user.id} has ${roleAffiliations.length} role affiliations, ${secondaryRoles.length} secondary roles`);
          }
        } catch (affError) {
          console.error('[AUTH_LOGIN] Error fetching role affiliations:', affError);
        }
        
        // Track login activity for ALL users (with country detection)
        try {
          const userIP = req.ip || (req.connection as any).remoteAddress || 'Unknown';
          const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.phone;
          
          // Get country from IP using free geolocation API (non-blocking)
          let country = 'Unknown';
          let city = 'Unknown';
          try {
            const geoResponse = await fetch(`http://ip-api.com/json/${userIP.replace('::ffff:', '')}?fields=status,country,city`);
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              if (geoData.status === 'success') {
                country = geoData.country || 'Unknown';
                city = geoData.city || 'Unknown';
              }
            }
          } catch (geoError) {
            console.log('[LOGIN_ACTIVITY] Geolocation lookup failed, using defaults');
          }
          
          // Insert login activity into database
          await db.execute(sql`
            INSERT INTO login_activity (user_id, user_email, user_name, user_role, ip_address, country, city, login_time, school_id, school_name)
            VALUES (${user.id}, ${user.email || null}, ${userName}, ${user.role}, ${userIP}, ${country}, ${city}, NOW(), ${user.schoolId || null}, ${null})
          `);
          
          console.log(`[LOGIN_ACTIVITY] ✅ Tracked login: ${userName} (${user.role}) from ${country}`);
        } catch (trackingError) {
          console.error('[LOGIN_ACTIVITY] Failed to track login activity:', trackingError);
          // Don't fail login if tracking fails
        }
        
        // Successfully authenticated and session created
        res.json({ 
          user: {
            ...user,
            roleAffiliations,
            secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : (user.secondaryRoles || [])
          }
        });
        });
      });
    }); // End of session.regenerate callback
  })(req, res, next);
});

// Verify 2FA token during login
router.post('/verify-2fa-login', async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    // Check if there's a pending 2FA user in session
    if (!req.session.pendingTwoFactorUserId || req.session.pendingTwoFactorUserId !== userId) {
      return res.status(401).json({ 
        message: 'No pending 2FA login found. Please login again.' 
      });
    }
    
    // Get the user
    const user = await storage.getUserById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ message: 'Invalid 2FA setup' });
    }
    
    // Verify the token using speakeasy
    const speakeasy = (await import('speakeasy')).default;
    
    // Try TOTP verification
    const totpValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      token: token,
      window: 2,
      encoding: 'base32'
    });
    
    if (totpValid) {
      // Clear the pending 2FA user ID
      delete req.session.pendingTwoFactorUserId;
      
      // Complete the login
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('[AUTH_2FA] Login error after 2FA:', loginErr);
          return res.status(500).json({ message: 'Failed to complete login' });
        }
        
        // Update last 2FA usage timestamp
        await storage.updateUser(user.id, {
          twoFactorVerifiedAt: new Date()
        });
        
        console.log(`[AUTH_2FA] ✅ 2FA verification successful for: ${user.email}`);
        
        // Fetch role affiliations for multi-role support
        let roleAffiliations: any[] = [];
        let secondaryRoles: string[] = [];
        
        try {
          const affiliations = await storage.getUserRoleAffiliations(user.id);
          
          if (affiliations && affiliations.length > 0) {
            roleAffiliations = affiliations.map((a: any) => ({
              id: a.id,
              role: a.role,
              schoolId: a.schoolId,
              description: a.description,
              status: a.status,
              metadata: a.metadata
            }));
            
            secondaryRoles = [...new Set(
              affiliations
                .filter((a: any) => a.role !== user.role && a.status === 'active')
                .map((a: any) => a.role)
            )] as string[];
          }
        } catch (affError) {
          console.error('[AUTH_2FA] Error fetching role affiliations:', affError);
        }
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('[AUTH_2FA] Session save error:', saveErr);
            return res.status(500).json({ message: 'Failed to save session' });
          }
          
          res.json({ 
            success: true,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              roleAffiliations,
              secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : (user.secondaryRoles || [])
            },
            message: '2FA verification successful' 
          });
        });
      });
      return;
    }
    
    // If TOTP fails, try backup codes
    const backupCodes = user.twoFactorBackupCodes || [];
    const backupCodeIndex = backupCodes.indexOf(token.toUpperCase());
    
    if (backupCodeIndex !== -1) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter((_, index) => index !== backupCodeIndex);
      
      // Clear the pending 2FA user ID
      delete req.session.pendingTwoFactorUserId;
      
      // Complete the login
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('[AUTH_2FA] Login error after backup code:', loginErr);
          return res.status(500).json({ message: 'Failed to complete login' });
        }
        
        // Update backup codes and timestamp
        await storage.updateUser(user.id, {
          twoFactorBackupCodes: updatedBackupCodes,
          twoFactorVerifiedAt: new Date()
        });
        
        console.log(`[AUTH_2FA] ✅ Backup code used for: ${user.email} (${updatedBackupCodes.length} remaining)`);
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('[AUTH_2FA] Session save error:', saveErr);
            return res.status(500).json({ message: 'Failed to save session' });
          }
          
          res.json({ 
            success: true,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName
            },
            message: `Backup code accepted. ${updatedBackupCodes.length} codes remaining.`,
            backupCodeUsed: true,
            remainingBackupCodes: updatedBackupCodes.length
          });
        });
      });
      return;
    }
    
    // Invalid token
    console.log(`[AUTH_2FA] ❌ Invalid 2FA token for user: ${user.email}`);
    res.status(401).json({ 
      success: false,
      message: 'Invalid verification code' 
    });
    
  } catch (error) {
    console.error('[AUTH_2FA] Error verifying 2FA:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
});

// Sandbox login endpoint for demo users
router.post('/sandbox-login', sandboxLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug logging
    console.log('[SANDBOX_LOGIN] 🔍 Request received:', { 
      email, 
      nodeEnv: process.env.NODE_ENV,
      sandboxEnabled: process.env.SANDBOX_ENABLED,
      ip: req.ip,
      origin: req.headers.origin
    });
    
    // Production safety: Disable sandbox in production unless explicitly enabled
    const isProduction = process.env.NODE_ENV === 'production';
    const sandboxEnabled = process.env.SANDBOX_ENABLED === 'true';
    
    console.log('[SANDBOX_LOGIN] 🔒 Security check:', { isProduction, sandboxEnabled });
    
    if (isProduction && !sandboxEnabled) {
      console.warn('[SANDBOX_SECURITY] Sandbox login attempted in production - BLOCKED');
      return res.status(403).json({ 
        message: 'Sandbox accounts are disabled in production environment',
        messageFr: 'Les comptes sandbox sont désactivés en production',
        messageEn: 'Sandbox accounts are disabled in production environment'
      });
    }
    
    // Use environment variable for sandbox password (default for dev only)
    const SANDBOX_PASSWORD = process.env.SANDBOX_PASSWORD || 'sandbox123';
    
    // Validate sandbox credentials
    if (password !== SANDBOX_PASSWORD) {
      return res.status(401).json({ message: 'Invalid sandbox credentials' });
    }
    
    // Define sandbox users with same structure as regular users
    const sandboxUsers = {
      'sandbox.parent@educafric.demo': { 
        id: 9001, name: 'Marie Kamga', role: 'Parent', email: 'sandbox.parent@educafric.demo', 
        schoolId: 999, children: [9004], phone: '+237650123456', sandboxMode: true, isSandboxUser: true
      },
      'sandbox.student@educafric.demo': { 
        id: 9004, name: 'Junior Kamga', role: 'Student', email: 'sandbox.student@educafric.demo', 
        schoolId: 999, parentId: 9001, classId: 301, phone: '+237653123456', sandboxMode: true, isSandboxUser: true
      },
      'sandbox.teacher@educafric.demo': { 
        id: 9002, name: 'Paul Mvondo', role: 'Teacher', email: 'sandbox.teacher@educafric.demo', 
        schoolId: 999, subjects: ['Mathématiques', 'Physique'], phone: '+237651123456', sandboxMode: true, isSandboxUser: true,
        workMode: 'hybrid'
      },
      'sandbox.admin@educafric.demo': { 
        id: 9005, name: 'Dr. Nguetsop Carine', role: 'Admin', email: 'sandbox.admin@educafric.demo', 
        schoolId: 999, phone: '+237654123456', sandboxMode: true, isSandboxUser: true
      },
      'sandbox.director@educafric.demo': { 
        id: 9006, name: 'Dr. Christiane Fouda', role: 'Director', email: 'sandbox.director@educafric.demo', 
        schoolId: 999, phone: '+237655123456', sandboxMode: true, isSandboxUser: true
      },
      'sandbox.commercial@educafric.demo': { 
        id: 9007, name: 'Paul Kamga', role: 'Commercial', email: 'sandbox.commercial@educafric.demo', 
        schoolId: 999, phone: '+237656123456', sandboxMode: true, isSandboxUser: true
      },
      'sandbox.siteadmin@educafric.demo': { 
        id: 9008, name: 'Admin Système', role: 'SiteAdmin', email: 'sandbox.siteadmin@educafric.demo', 
        schoolId: 999, phone: '+237657123456', sandboxMode: true, isSandboxUser: true
      }
    };
    
    const user = sandboxUsers[email as keyof typeof sandboxUsers];
    if (!user) {
      return res.status(401).json({ message: 'Invalid sandbox user' });
    }
    
    // Login the sandbox user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('[SANDBOX_ERROR] Session creation error:', loginErr);
        return res.status(500).json({ message: 'Failed to create sandbox session' });
      }
      
      // Force session save
      req.session.save(async (saveErr) => {
        if (saveErr) {
          console.error('[SANDBOX_ERROR] Session save error:', saveErr);
          return res.status(500).json({ message: 'Failed to save sandbox session' });
        }
        
        // Send sandbox login alert for all sandbox users (all roles)
        try {
          // Send email alert for any sandbox user
          const { hostingerMailService } = await import('../services/hostingerMailService');
          await hostingerMailService.sendSandboxLoginAlert({
            name: user.name || user.email,
            email: user.email,
            role: user.role,
            loginTime: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
            ip: req.ip || req.connection.remoteAddress || 'Unknown',
            schoolId: user.schoolId
          });
          console.log(`[SANDBOX_LOGIN] Alert sent for: ${user.email} (${user.role})`);
          
          // Track sandbox login activity (note: sandbox users don't persist to DB)
          console.log(`[SANDBOX_LOGIN] Login activity for: ${user.email} (${user.role}) at ${new Date().toISOString()}`);
          
          // Send PWA notification to Carine specifically for Commercial sandbox users
          if (user.role === 'Commercial') {
            try {
              // Try to find Carine by her possible emails
              const carineEmails = [
                'nguetsop.carine@educafric.com',
                'carine.nguetsop@educafric.com', 
                'carine@educafric.com',
                'nguetsopcarine12@icloud.com',
                'nguetsop.carine@yahoo.fr'
              ];
              
              let carineUser = null;
              for (const email of carineEmails) {
                try {
                  carineUser = await storage.getUserByEmail(email);
                  if (carineUser) {
                    console.log(`[PWA_NOTIFICATION] 👤 Found Carine user: ${carineUser.email} (ID: ${carineUser.id})`);
                    break;
                  }
                } catch (error) {
                  // Continue to next email if this one fails
                  continue;
                }
              }
              
              // Use Carine's ID if found, otherwise log warning and use fallback
              let carineUserId;
              if (carineUser) {
                carineUserId = carineUser.id;
              } else {
                console.warn('[PWA_NOTIFICATION] ⚠️  Carine user not found, using fallback notification ID 999999');
                carineUserId = 999999;
              }
              
              const loginTime = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' });
              const userIP = req.ip || req.connection.remoteAddress || 'Unknown';
              const userName = user.name || user.email;
              
              // Send SANDBOX notification to both Carine and simon.admin
              const recipients = [
                { id: carineUserId, name: 'Carine' },
                { id: 2, name: 'simon.admin' }
              ];
              
              const notifications = [];
              for (const recipient of recipients) {
                try {
                  const notification = await storage.createNotification({
                    userId: recipient.id,
                    title: '🔔 Connexion Commercial SANDBOX EDUCAFRIC',
                    message: `${userName} (${user.email}) s'est connecté en mode sandbox le ${loginTime} depuis l'IP ${userIP}`,
                    type: 'commercial_login',
                    category: 'security',
                    priority: 'high',
                    actionRequired: false,
                    data: {
                      commercialId: user.id,
                      commercialEmail: user.email,
                      commercialName: userName,
                      loginTime: loginTime,
                      ipAddress: userIP,
                      userAgent: req.headers['user-agent'],
                      schoolId: user.schoolId,
                      sandboxMode: true
                    }
                  });
                  
                  notifications.push(notification);
                  const notificationId = notification?.id || 'unknown';
                  console.log(`[PWA_NOTIFICATION] 📱 Commercial SANDBOX login alert successfully created (ID: ${notificationId}) for recipient ${recipient.name} (${recipient.id}) - Commercial: ${user.email}`);
                } catch (notificationError) {
                  console.error(`[PWA_NOTIFICATION] Failed to send SANDBOX notification to ${recipient.name} (${recipient.id}):`, notificationError);
                }
              }
            } catch (pwaError) {
              console.error('[PWA_NOTIFICATION] Failed to send PWA notification to Carine for sandbox commercial:', pwaError);
            }
          }
        } catch (alertError) {
          console.error('[SANDBOX_LOGIN] Failed to send alert email:', alertError);
        }
        
        res.json({ user: user });
      });
    });
    
  } catch (error) {
    console.error('[SANDBOX_ERROR] Sandbox login failed:', error);
    res.status(500).json({ message: 'Sandbox login failed' });
  }
});

// Facebook Authentication Route
router.post('/facebook-login', async (req, res) => {
  try {
    const { email, facebookId, name, firstName, lastName } = req.body;

    if (!email || !facebookId) {
      return res.status(400).json({ message: 'Email and Facebook ID are required' });
    }

    // Vérifier si l'utilisateur existe déjà
    let user;
    try {
      user = await storage.getUserByEmail(email);
    } catch (error) {
      // L'utilisateur n'existe pas, on va le créer
      user = null;
    }

    if (user) {
      // Utilisateur existant - mettre à jour avec l'ID Facebook si nécessaire
      if (!user.facebookId) {
        // Mettre à jour l'utilisateur avec l'ID Facebook
        await storage.updateUser(user.id, { facebookId });
      }
    } else {
      // Créer un nouveau compte utilisateur avec Facebook
      const hashedPassword = await bcrypt.hash(`facebook_${facebookId}`, 10);
      
      const newUserData = {
        email,
        password: hashedPassword,
        firstName: firstName || name?.split(' ')[0] || 'Facebook',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || 'User',
        role: 'Student', // Rôle par défaut
        phoneNumber: `+237${Math.floor(600000000 + Math.random() * 99999999)}`, // Numéro temporaire
        facebookId,
        isEmailVerified: true, // Facebook emails are verified
      };

      try {
        user = await storage.createUser(newUserData);
      } catch (createError: any) {
        console.error('[FACEBOOK_AUTH] User creation failed:', createError);
        return res.status(500).json({ 
          message: 'Failed to create user account',
          error: createError.message 
        });
      }
    }

    // Connecter l'utilisateur
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('[FACEBOOK_AUTH] Session creation error:', loginErr);
        return res.status(500).json({ message: 'Failed to create session' });
      }
      
      // Force session save
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[FACEBOOK_AUTH] Session save error:', saveErr);
          return res.status(500).json({ message: 'Failed to save session' });
        }
        
        console.log(`[FACEBOOK_AUTH] Login successful: ${user.firstName} ${user.lastName} (${user.email})`);
        res.json({ user });
      });
    });
    
  } catch (error: any) {
    console.error('[FACEBOOK_AUTH] Facebook login failed:', error);
    res.status(500).json({ 
      message: 'Facebook authentication failed',
      error: error.message 
    });
  }
});

// Vérification du statut de session pour le connection manager
router.get('/session-status', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ status: 'authenticated', user: req.user });
  } else {
    res.status(401).json({ status: 'unauthenticated' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    req.logout((err) => {
      if (err) {
        console.error('[AUTH_ERROR] Logout failed');
        return res.status(500).json({ message: 'Logout failed' });
      }
      // Clear user from session cache
      if (userId) {
        clearCachedUser(userId);
      }
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('[AUTH_ERROR] Logout error');
    res.status(500).json({ message: 'Logout error' });
  }
});

// GET /api/auth/check - Check authentication status (alias for status)
router.get('/check', (req, res) => {
  try {
    const isAuthenticated = req.isAuthenticated();
    const user = req.user as any;
    
    res.json({
      success: true,
      authenticated: isAuthenticated,
      user: isAuthenticated ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId
      } : null,
      message: isAuthenticated ? 'User is authenticated' : 'User not authenticated'
    });
  } catch (error) {
    console.error('[AUTH_CHECK] Error checking auth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check authentication'
    });
  }
});

// GET /api/auth/status - Check authentication status
router.get('/status', (req, res) => {
  try {
    const isAuthenticated = req.isAuthenticated();
    const user = req.user as any;
    
    res.json({
      success: true,
      authenticated: isAuthenticated,
      user: isAuthenticated ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId
      } : null,
      message: isAuthenticated ? 'User is authenticated' : 'User not authenticated'
    });
  } catch (error) {
    console.error('[AUTH_STATUS] Error checking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check authentication status'
    });
  }
});

// ============= PASSWORD RESET ENDPOINTS =============

// POST /api/auth/forgot-password - Request password reset via email or WhatsApp
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phoneNumber, method, language = 'fr' } = req.body;
    
    if (!method || !['email', 'whatsapp'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: language === 'fr' 
          ? 'La méthode doit être email ou whatsapp'
          : 'Method must be either email or whatsapp',
        messageFr: 'La méthode doit être email ou whatsapp',
        messageEn: 'Method must be either email or whatsapp'
      });
    }

    let user;
    let identifier;

    if (method === 'email') {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: language === 'fr'
            ? 'Email requis pour la méthode email'
            : 'Email is required for email method',
          messageFr: 'Email requis pour la méthode email',
          messageEn: 'Email is required for email method'
        });
      }
      identifier = email;
      console.log(`[PASSWORD_RESET] Searching for user with email: ${email}`);
      try {
        user = await storage.getUserByEmail(email);
        console.log(`[PASSWORD_RESET] User found:`, user ? `ID ${user.id}, email ${user.email}` : 'NULL');
      } catch (error) {
        console.error(`[PASSWORD_RESET] Error finding user:`, error);
        user = null;
      }
    } else {
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: language === 'fr'
            ? 'Numéro de téléphone requis pour la méthode WhatsApp'
            : 'Phone number is required for WhatsApp method',
          messageFr: 'Numéro de téléphone requis pour la méthode WhatsApp',
          messageEn: 'Phone number is required for WhatsApp method'
        });
      }
      identifier = phoneNumber;
      try {
        // Find user by phone number (WhatsApp number)
        const allUsers = await storage.getAllUsers();
        user = allUsers.find((u: any) => u.phoneNumber === phoneNumber || u.whatsappE164 === phoneNumber) || null;
      } catch (error) {
        user = null;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: language === 'fr'
          ? 'Aucun compte trouvé avec cet identifiant'
          : 'No account found with this identifier',
        messageFr: 'Aucun compte trouvé avec cet identifiant',
        messageEn: 'No account found with this identifier',
        errorCode: 'USER_NOT_FOUND',
        suggestion: 'signup'
      });
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in user (you may want to create a separate table for this)
    await storage.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry
    });

    try {
      if (method === 'email') {
        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL || 'https://educafric.com'}/reset-password/${resetToken}`;
        
        const emailSent = await hostingerMailService.sendEmail({
          to: user.email,
          subject: '🔐 Réinitialisation de votre mot de passe EDUCAFRIC',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0079F2; margin: 0;">EDUCAFRIC</h1>
                <p style="color: #666; margin: 5px 0;">Plateforme Éducative Africaine</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #0079F2;">
                <h2 style="color: #333; margin-top: 0;">🔐 Réinitialisation de mot de passe</h2>
                
                <p style="color: #555; line-height: 1.6;">Bonjour <strong>${user.firstName || user.name}</strong>,</p>
                
                <p style="color: #555; line-height: 1.6;">
                  Vous avez demandé la réinitialisation de votre mot de passe pour votre compte EDUCAFRIC.
                  Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #0079F2, #00A8E8); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold;
                            display: inline-block;">
                    Réinitialiser mon mot de passe
                  </a>
                </div>
                
                <p style="color: #888; font-size: 14px; line-height: 1.6;">
                  Ce lien expirera dans <strong>15 minutes</strong> pour votre sécurité.
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #888; font-size: 12px; text-align: center;">
                  EDUCAFRIC - Plateforme Éducative Africaine<br>
                  support: info@educafric.com | +237 656 200 472
                </p>
              </div>
            </div>
          `
        });

        if (!emailSent) {
          throw new Error('Failed to send email');
        }

      } else {
        // WhatsApp reset
        const resetUrl = `${process.env.FRONTEND_URL || 'https://educafric.com'}/reset-password/${resetToken}`;
        
        // Import WhatsApp service
        const { createWaToken } = await import('../services/waClickToChat');
        const { renderTemplate } = await import('../templates/waTemplates');
        
        // Get user's WhatsApp language preference (default to French)
        const userLang = (user.waLanguage || 'fr') as 'fr' | 'en';
        
        // Create WhatsApp message with password reset link
        const waMessage = renderTemplate('password_reset', userLang, {
          user_name: user.firstName || user.name || 'Utilisateur',
          reset_link: resetUrl
        });
        
        // Create WhatsApp Click-to-Chat token (5 min expiry for security)
        const waToken = await createWaToken({
          recipientId: user.id,
          templateId: 'password_reset',
          templateData: {
            user_name: user.firstName || user.name || 'Utilisateur',
            reset_link: resetUrl
          },
          lang: userLang,
          campaign: 'password_reset',
          ttlSeconds: 300 // 5 minutes
        });
        
        // Return WhatsApp Click-to-Chat URL for frontend to open
        // This is a backend route that redirects to WhatsApp
        const baseUrl = req.protocol + '://' + req.get('host');
        const waClickUrl = `${baseUrl}/wa/${waToken}`;
        
        console.log(`[PASSWORD_RESET] WhatsApp reset initiated for user ${user.id}`);
        
        return res.json({
          success: true,
          message: language === 'fr'
            ? 'Lien WhatsApp généré avec succès'
            : 'WhatsApp link generated successfully',
          messageFr: 'Lien WhatsApp généré avec succès',
          messageEn: 'WhatsApp link generated successfully',
          whatsappUrl: waClickUrl // Frontend will open this URL
        });
      }

      console.log(`[PASSWORD_RESET] Reset ${method} sent successfully to ${identifier}`);
      
      res.json({
        success: true,
        message: language === 'fr'
          ? (method === 'email' ? 'Email de réinitialisation envoyé avec succès' : 'SMS avec code de réinitialisation envoyé avec succès')
          : (method === 'email' ? 'Reset email sent successfully' : 'Reset SMS sent successfully'),
        messageFr: method === 'email' ? 'Email de réinitialisation envoyé avec succès' : 'SMS avec code de réinitialisation envoyé avec succès',
        messageEn: method === 'email' ? 'Reset email sent successfully' : 'Reset SMS sent successfully'
      });

    } catch (sendError) {
      console.error(`[PASSWORD_RESET] Failed to send ${method}:`, sendError);
      res.status(500).json({
        success: false,
        message: language === 'fr'
          ? `Échec de l'envoi de l'${method === 'email' ? 'email' : 'SMS'} de réinitialisation`
          : `Failed to send reset ${method === 'email' ? 'email' : 'SMS'}`,
        messageFr: `Échec de l'envoi de l'${method === 'email' ? 'email' : 'SMS'} de réinitialisation`,
        messageEn: `Failed to send reset ${method === 'email' ? 'email' : 'SMS'}`
      });
    }

  } catch (error) {
    console.error('[PASSWORD_RESET] Forgot password error:', error);
    const requestLanguage = req.body.language || 'fr';
    res.status(500).json({
      success: false,
      message: requestLanguage === 'fr'
        ? 'Erreur lors de la demande de réinitialisation'
        : 'Error during password reset request',
      messageFr: 'Erreur lors de la demande de réinitialisation',
      messageEn: 'Error during password reset request'
    });
  }
});

// POST /api/auth/reset-password - Reset password with token or SMS code
router.post('/reset-password', async (req, res) => {
  try {
    const { token, smsCode, newPassword, confirmPassword, language = 'fr' } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: language === 'fr'
          ? 'Nouveau mot de passe et confirmation requis'
          : 'New password and confirmation required',
        messageFr: 'Nouveau mot de passe et confirmation requis',
        messageEn: 'New password and confirmation required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: language === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match',
        messageFr: 'Les mots de passe ne correspondent pas',
        messageEn: 'Passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: language === 'fr'
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : 'Password must be at least 8 characters',
        messageFr: 'Le mot de passe doit contenir au moins 8 caractères',
        messageEn: 'Password must be at least 8 characters'
      });
    }

    let user;

    if (token) {
      // Email reset with token
      user = await storage.getUserByPasswordResetToken(token);
      
      if (!user || !user.passwordResetExpiry || new Date(user.passwordResetExpiry) < new Date()) {
        return res.status(400).json({
          success: false,
          message: language === 'fr'
            ? 'Token de réinitialisation invalide ou expiré'
            : 'Invalid or expired reset token',
          messageFr: 'Token de réinitialisation invalide ou expiré',
          messageEn: 'Invalid or expired reset token'
        });
      }
    } else if (smsCode) {
      // SMS reset with code - find user with matching SMS code
      try {
        const allUsers = await storage.getAllUsers();
        user = allUsers.find((u: any) => u.smsResetCode === smsCode) || null;
        
        if (!user || !user.smsResetExpiry || new Date(user.smsResetExpiry) < new Date()) {
          return res.status(400).json({
            success: false,
            message: 'Code SMS invalide ou expiré'
          });
        }
      } catch (error) {
        user = null;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Token ou code SMS requis'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset tokens
    await storage.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      smsResetCode: null,
      smsResetExpiry: null
    });

    // Clear user from session cache to force fresh fetch
    clearCachedUser(user.id);

    console.log(`[PASSWORD_RESET] Password successfully reset for user ${user.email}`);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('[PASSWORD_RESET] Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
});

// Account deletion request endpoint
router.post('/delete-account', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userRole = req.user.role;
    const userName = req.user.firstName && req.user.lastName 
      ? `${req.user.firstName} ${req.user.lastName}`
      : req.user.email;

    console.log(`[ACCOUNT_DELETION] Deletion request received from user ${userId} (${userEmail}) - Role: ${userRole}`);

    // Students need admin approval, Parents can delete directly
    if (userRole === 'Student') {
      // For students: send request to administrators
      try {
        const schoolAdmins = await storage.getSchoolAdministrators(req.user.schoolId || 0);
        
        const message = `DEMANDE DE SUPPRESSION DE COMPTE (ÉTUDIANT)\n\nÉtudiant: ${userName}\nEmail: ${userEmail}\nDate: ${new Date().toLocaleString('fr-FR')}\n\nCette demande nécessite votre approbation. Veuillez contacter l'étudiant et ses parents pour confirmer la suppression.`;

        // Send email to admins
        for (const admin of schoolAdmins) {
          if (admin.email) {
            await hostingerMailService.sendEmail({
              to: admin.email,
              subject: `⚠️ Demande de suppression de compte étudiant - ${userName}`,
              text: message,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2 style="color: #dc2626;">⚠️ Demande de suppression de compte étudiant</h2>
                  <p><strong>Étudiant:</strong> ${userName}</p>
                  <p><strong>Email:</strong> ${userEmail}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                  <p style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626;">
                    Cette demande nécessite votre approbation. Veuillez contacter l'étudiant et ses parents pour confirmer la suppression.
                  </p>
                </div>
              `
            });
          }
        }

        console.log(`[ACCOUNT_DELETION] Student deletion request sent to ${schoolAdmins.length} administrators`);
      } catch (notificationError) {
        console.error('[ACCOUNT_DELETION] Error sending notifications:', notificationError);
      }

      res.json({
        success: true,
        message: 'Demande de suppression envoyée aux administrateurs'
      });

    } else if (userRole === 'Parent') {
      // For parents: delete account directly (soft delete)
      try {
        // Single atomic database update - all fields updated together or none
        // No external service cleanup needed as we only store references locally
        // PostgreSQL ensures atomicity - either all updates succeed or all fail
        console.log(`[ACCOUNT_DELETION] Starting parent account deletion for userId: ${userId}`);
        
        await storage.updateUser(userId, {
          deletionRequested: true,
          deletionRequestedAt: new Date(),
          deletionApprovedBy: userId, // Self-approved for parents
          deletionApprovedAt: new Date(),
          email: `deleted_${userId}_${userEmail}`, // Prefix email to free it up
          password: null, // Clear password to prevent login
          firebaseUid: null, // Clear Firebase UID
          stripeCustomerId: null // Clear sensitive payment data (reference only)
        });

        console.log(`[ACCOUNT_DELETION] ✅ Parent account ${userId} successfully marked as deleted and cleaned`);

        res.json({
          success: true,
          message: 'Votre compte a été supprimé avec succès'
        });

      } catch (deleteError) {
        console.error('[ACCOUNT_DELETION] ❌ Error deleting parent account:', deleteError);
        throw deleteError;
      }

    } else {
      // For other roles: require admin approval
      res.status(403).json({
        success: false,
        message: 'La suppression de compte n\'est pas disponible pour votre rôle. Veuillez contacter l\'administration.'
      });
    }

  } catch (error) {
    console.error('[ACCOUNT_DELETION] Error processing deletion request:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la demande de suppression'
    });
  }
});

// Export cache utilities for use in other modules
export { clearCachedUser };

export default router;