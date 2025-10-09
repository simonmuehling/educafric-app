import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { createUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema, changePasswordSchema } from '@shared/schemas';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { hostingerMailService } from '../services/hostingerMailService.js';

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

      // Check if account has been deleted
      if (user.deletionRequested || user.deletionApprovedAt) {
        console.log(`[AUTH_STRATEGY] Blocked login attempt for deleted account: ${email}`);
        return done(null, false, { message: 'Ce compte a été supprimé' });
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
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.json({ user: req.user });
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

// ============= PASSWORD RESET ENDPOINTS =============

// POST /api/auth/forgot-password - Request password reset via email or WhatsApp
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phoneNumber, method } = req.body;
    
    if (!method || !['email', 'whatsapp'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Method must be either email or whatsapp'
      });
    }

    let user;
    let identifier;

    if (method === 'email') {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for email method'
        });
      }
      identifier = email;
      try {
        user = await storage.getUserByEmail(email);
      } catch (error) {
        user = null;
      }
    } else {
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for WhatsApp method'
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
        message: 'Aucun compte trouvé avec cet identifiant'
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
          message: 'Lien WhatsApp généré avec succès',
          whatsappUrl: waClickUrl // Frontend will open this URL
        });
      }

      console.log(`[PASSWORD_RESET] Reset ${method} sent successfully to ${identifier}`);
      
      res.json({
        success: true,
        message: method === 'email' 
          ? 'Email de réinitialisation envoyé avec succès'
          : 'SMS avec code de réinitialisation envoyé avec succès'
      });

    } catch (sendError) {
      console.error(`[PASSWORD_RESET] Failed to send ${method}:`, sendError);
      res.status(500).json({
        success: false,
        message: `Échec de l'envoi de l'${method === 'email' ? 'email' : 'SMS'} de réinitialisation`
      });
    }

  } catch (error) {
    console.error('[PASSWORD_RESET] Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
});

// POST /api/auth/reset-password - Reset password with token or SMS code
router.post('/reset-password', async (req, res) => {
  try {
    const { token, smsCode, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nouveau mot de passe et confirmation requis'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    let user;

    if (token) {
      // Email reset with token
      user = await storage.getUserByPasswordResetToken(token);
      
      if (!user || !user.passwordResetExpiry || new Date(user.passwordResetExpiry) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Token de réinitialisation invalide ou expiré'
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

export default router;