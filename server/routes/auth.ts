import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { createUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema, changePasswordSchema } from '@shared/schemas';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const router = Router();

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

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValidPassword = await storage.verifyPassword(user, password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

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
        if (process.env.NODE_ENV === 'development') {
          console.log('[AUTH_DEBUG] Invalid user ID format:', id);
        }
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
      console.error('[AUTH_ERROR] Database connection error during user deserialization:', dbError);
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
      return res.status(401).json({ message: 'Authentication required' });
    }
    
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

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      phone: validatedData.phoneNumber, // Map phoneNumber to phone field
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
      
      // Session creation successful
      
      // Force session save
      req.session.save(async (saveErr) => {
        if (saveErr) {
          console.error('[AUTH_ERROR] Session save error:', saveErr);
          return res.status(500).json({ message: 'Failed to save session' });
        }
        
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
        
        // Successfully authenticated and session created
        res.json({ user: user });
      });
    });
  })(req, res, next);
});

// Sandbox login endpoint for demo users
router.post('/sandbox-login', sandboxLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate sandbox credentials
    if (password !== 'sandbox123') {
      return res.status(401).json({ message: 'Invalid sandbox credentials' });
    }
    
    // Define sandbox users with same structure as regular users
    const sandboxUsers = {
      'sandbox.parent@educafric.demo': { 
        id: 9001, name: 'Marie Kamga', role: 'Parent', email: 'sandbox.parent@educafric.demo', 
        schoolId: 999, children: [9004], phone: '+237650123456', sandboxMode: true 
      },
      'sandbox.student@educafric.demo': { 
        id: 9004, name: 'Junior Kamga', role: 'Student', email: 'sandbox.student@educafric.demo', 
        schoolId: 999, parentId: 9001, classId: 301, phone: '+237653123456', sandboxMode: true 
      },
      'sandbox.teacher@educafric.demo': { 
        id: 9002, name: 'Paul Mvondo', role: 'Teacher', email: 'sandbox.teacher@educafric.demo', 
        schoolId: 999, subjects: ['Mathématiques', 'Physique'], phone: '+237651123456', sandboxMode: true 
      },
      'sandbox.freelancer@educafric.demo': { 
        id: 9003, name: 'Sophie Biya', role: 'Freelancer', email: 'sandbox.freelancer@educafric.demo', 
        schoolId: 999, subjects: ['Français'], phone: '+237652123456', sandboxMode: true 
      },
      'sandbox.admin@educafric.demo': { 
        id: 9005, name: 'Dr. Nguetsop Carine', role: 'Admin', email: 'sandbox.admin@educafric.demo', 
        schoolId: 999, phone: '+237654123456', sandboxMode: true 
      },
      'sandbox.director@educafric.demo': { 
        id: 9006, name: 'Dr. Christiane Fouda', role: 'Director', email: 'sandbox.director@educafric.demo', 
        schoolId: 999, phone: '+237655123456', sandboxMode: true 
      },
      'sandbox.commercial@educafric.demo': { 
        id: 9007, name: 'Paul Kamga', role: 'Commercial', email: 'sandbox.commercial@educafric.demo', 
        schoolId: 999, phone: '+237656123456', sandboxMode: true 
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

export default router;