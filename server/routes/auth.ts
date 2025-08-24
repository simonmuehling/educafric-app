import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from '../storage';
import { createUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema, changePasswordSchema } from '@shared/schemas';
import { z } from 'zod';

const router = Router();

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  try {
    // Validate user object exists and has required properties
    if (!user || typeof user !== 'object' || !user.id) {
      return done(new Error('Invalid user object for serialization'));
    }
    
    if (user.sandboxMode) {
      done(null, `sandbox:${user.id}`);
    } else {
      done(null, user.id);
    }
  } catch (error) {
    console.error('[AUTH_ERROR] User serialization failed');
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
        console.warn('[AUTH_WARNING] Invalid sandbox ID format:', sandboxIdStr);
        return done(null, false);
      }
      
      // Return sandbox user data (reconstruct from sandboxProfiles)
      const sandboxProfiles = {
        9001: { id: 9001, name: 'Marie Kamga', role: 'Parent', email: 'sandbox.parent@educafric.demo', schoolId: 999, children: [9004], phone: '+237650123456', address: 'Quartier Bastos, Yaoundé', profession: 'Infirmière', maritalStatus: 'Mariée', emergencyContact: '+237651234567' },
        9002: { id: 9002, name: 'Paul Mvondo', role: 'Teacher', email: 'sandbox.teacher@educafric.demo', schoolId: 999, subjects: ['Mathématiques', 'Physique'], classes: ['3ème A', '2nde B'], phone: '+237651123456', address: 'Quartier Mvan, Yaoundé', specialization: 'Sciences Exactes', experience: '8 ans' },
        9003: { id: 9003, name: 'Sophie Biya', role: 'Freelancer', email: 'sandbox.freelancer@educafric.demo', schoolId: 999, subjects: ['Français', 'Littérature'], students: [9004], phone: '+237652123456', address: 'Quartier Nlongkak, Yaoundé', specialization: 'Langues et Littérature', hourlyRate: 2500 },
        9004: { id: 9004, name: 'Junior Kamga', role: 'Student', email: 'sandbox.student@educafric.demo', schoolId: 999, parentId: 9001, classId: 301, className: '3ème A', age: 14, phone: '+237653123456', address: 'Quartier Bastos, Yaoundé', parentName: 'Marie Kamga', subjects: ['Mathématiques', 'Français', 'Sciences', 'Histoire'] },
        9005: { id: 9005, name: 'Dr. Nguetsop Carine', role: 'Admin', email: 'sandbox.admin@educafric.demo', schoolId: 999, phone: '+237654123456', address: 'Quartier Essos, Yaoundé', title: 'Directrice Pédagogique', department: 'Administration', qualification: 'Doctorat en Sciences de l\'Éducation' },
        9006: { id: 9006, name: 'Prof. Atangana Michel', role: 'Director', email: 'sandbox.director@educafric.demo', schoolId: 999, phone: '+237655123456', address: 'Quartier Bastos, Yaoundé', title: 'Directeur Général', qualification: 'Doctorat en Éducation' }
      };
      
      const profile = sandboxProfiles[sandboxId as keyof typeof sandboxProfiles];
      if (profile) {
        const sandboxUser = {
          ...profile,
          subscription: 'premium',
          sandboxMode: true,
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
        return done(null, sandboxUser);
      } else {
        return done(null, false);
      }
    }
    
    // Handle regular database users - with safe fallback
    try {
      const userId = typeof id === 'string' ? parseInt(id) : id;
      if (isNaN(userId as number)) {
        return done(null, false);
      }
      
      const user = await storage.getUserById(userId as number);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (dbError) {
      // Log error without sensitive details
      console.error('[AUTH_ERROR] Database connection error during user deserialization');
      return done(null, false); // Fail gracefully, don't crash
    }
  } catch (error) {
    // Log error without sensitive details
    console.error('[AUTH_ERROR] User deserialization failed');
    return done(null, false); // Fail gracefully, don't propagate error
  }
});

// Authentication routes
router.get('/me', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      // Only log minimal non-sensitive information for security auditing
      console.log(`[SECURITY_BYPASS] Event ignored: authentication from ${req.ip}`);
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Only log successful authentication without sensitive user data
    console.log(`[SECURITY_BYPASS] Event ignored: authentication from ${req.ip}`);
    res.json({ user: req.user });
  } catch (error) {
    console.error('[AUTH_ERROR] Error processing authentication:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    // Log error without exposing sensitive details
    if (error instanceof z.ZodError) {
      console.warn('[AUTH_VALIDATION] Registration validation failed');
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    
    console.error('[AUTH_ERROR] Registration failed');
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

// Sandbox login endpoint
router.post('/sandbox-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Define sandbox profiles
    const sandboxProfiles = {
      'sandbox.parent@educafric.demo': { id: 9001, name: 'Marie Kamga', role: 'Parent' },
      'sandbox.teacher@educafric.demo': { id: 9002, name: 'Paul Mvondo', role: 'Teacher' },
      'sandbox.freelancer@educafric.demo': { id: 9003, name: 'Sophie Biya', role: 'Freelancer' },
      'sandbox.student@educafric.demo': { id: 9004, name: 'Junior Kamga', role: 'Student' },
      'sandbox.admin@educafric.demo': { id: 9005, name: 'Dr. Nguetsop Carine', role: 'Admin' },
      'sandbox.director@educafric.demo': { id: 9006, name: 'Prof. Atangana Michel', role: 'Director' }
    };
    
    const profile = sandboxProfiles[email as keyof typeof sandboxProfiles];
    
    if (!profile || password !== 'sandbox123') {
      return res.status(401).json({ message: 'Invalid sandbox credentials' });
    }
    
    // Create sandbox user object
    const sandboxUser = {
      ...profile,
      email,
      subscription: 'premium',
      sandboxMode: true,
      premiumFeatures: true,
      schoolId: 999,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Login the user
    req.login(sandboxUser, (err) => {
      if (err) {
        console.error('[SANDBOX_LOGIN] Error:', err);
        return res.status(500).json({ message: 'Sandbox login failed' });
      }
      
      console.log(`[SANDBOX_LOGIN] ✅ ${profile.name} (${profile.role}) logged in successfully`);
      res.json({ user: sandboxUser });
    });
    
  } catch (error) {
    console.error('[SANDBOX_LOGIN] Error:', error);
    res.status(500).json({ message: 'Sandbox login error' });
  }
});

router.post('/logout', (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('[AUTH_ERROR] Logout failed');
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('[AUTH_ERROR] Logout error');
    res.status(500).json({ message: 'Logout error' });
  }
});

export default router;