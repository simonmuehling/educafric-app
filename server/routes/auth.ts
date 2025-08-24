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
    console.log('[AUTH_DEBUG] Serializing user:', { id: user?.id, email: user?.email, role: user?.role });
    
    // Validate user object exists and has required properties
    if (!user || typeof user !== 'object' || !user.id) {
      console.error('[AUTH_ERROR] Invalid user object for serialization:', user);
      return done(new Error('Invalid user object for serialization'));
    }
    
    const serializedId = user.sandboxMode ? `sandbox:${user.id}` : user.id;
    console.log('[AUTH_DEBUG] Serialized user ID:', serializedId);
    done(null, serializedId);
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
    // Debug cookie and session info
    console.log('[COOKIE_DEBUG] Request cookies:', req.headers.cookie);
    console.log('[SESSION_DEBUG] Session ID:', req.sessionID);
    console.log('[SESSION_DEBUG] Session exists:', !!req.session);
    console.log('[SESSION_DEBUG] Authenticated:', req.isAuthenticated());
    console.log('[SESSION_DEBUG] Session passport:', req.session?.passport);
    
    if (!req.isAuthenticated()) {
      console.log(`[AUTH_FAIL] No authentication for session: ${req.sessionID}`);
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[AUTH_SUCCESS] User authenticated: ${req.user?.email}`);
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

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      console.error('[AUTH_ERROR] Login authentication error:', err);
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }
    
    // Manually log in the user to establish session
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('[AUTH_ERROR] Session creation error:', loginErr);
        return res.status(500).json({ message: 'Failed to create session' });
      }
      
      // Debug session creation
      console.log('[AUTH_DEBUG] User logged in, session ID:', req.sessionID);
      console.log('[AUTH_DEBUG] Session after login:', {
        authenticated: req.isAuthenticated(),
        userId: req.user?.id,
        userRole: req.user?.role
      });
      
      // Force session save
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[AUTH_ERROR] Session save error:', saveErr);
          return res.status(500).json({ message: 'Failed to save session' });
        }
        
        // Successfully authenticated and session created
        console.log('[AUTH_SUCCESS] Session saved successfully');
        res.json({ user: user });
      });
    });
  })(req, res, next);
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