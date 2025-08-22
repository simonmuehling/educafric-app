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
  if (user.sandboxMode) {
    done(null, `sandbox:${user.id}`);
  } else {
    done(null, user.id);
  }
});

passport.deserializeUser(async (id: string | number, done) => {
  try {
    // Handle sandbox users
    if (typeof id === 'string' && id.startsWith('sandbox:')) {
      const sandboxId = parseInt(id.replace('sandbox:', ''));
      
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
        done(null, sandboxUser);
        return;
      } else {
        done(null, false);
        return;
      }
    }
    
    // Handle regular database users - optimized for 3500+ users
    const user = await storage.getUserById(id as number);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

// Authentication routes
router.get('/me', async (req, res) => {
  console.log(`[AUTH_LOG] GET /api/auth/me from ${req.ip}`);
  console.log(`[SESSION_DEBUG] GET /api/auth/me`);
  console.log(`[SESSION_DEBUG] Session ID: ${req.sessionID}`);
  
  const cookieHeader = req.headers.cookie || 'NONE';
  console.log(`[SESSION_DEBUG] Cookies received: ${cookieHeader}`);
  console.log(`[SESSION_DEBUG] Session data:`, req.session);
  
  if (!req.isAuthenticated()) {
    console.log(`[AUTH_FAIL] GET /api/auth/me - No valid session found`);
    console.log(`[AUTH_DEBUG] isAuthenticated: ${req.isAuthenticated()}`);
    console.log(`[AUTH_DEBUG] user: ${!!req.user}`);
    console.log(`[AUTH_DEBUG] session: ${!!req.session}`);
    console.log(`[AUTH_DEBUG] sessionID: ${req.sessionID}`);
    
    console.log(`[SECURITY_BYPASS] Event ignored: authentication from ${req.ip}`);
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log(`[AUTH_SUCCESS] GET /api/auth/me - User authenticated: ${(req.user as any).email || (req.user as any).name}`);
  console.log(`[SECURITY_BYPASS] Event ignored: authentication from ${req.ip}`);
  res.json({ user: req.user });
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
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;