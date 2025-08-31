import express from 'express';
import { storage } from '../storage';
// Note: Using any type for req to access user property from authentication middleware
import { updateEmailPreferencesSchema, getDefaultEmailPreferences } from '@shared/emailPreferencesSchema';

const router = express.Router();

// Get user's email preferences
router.get('/api/email-preferences', async (req: any, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user.id;
    let preferences = await storage.getEmailPreferences(userId);
    
    // If no preferences exist, create defaults based on user role
    if (!preferences) {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const defaultPrefs = getDefaultEmailPreferences(user.role);
      preferences = await storage.createEmailPreferences({
        userId,
        ...defaultPrefs
      });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    res.status(500).json({ error: 'Failed to fetch email preferences' });
  }
});

// Update user's email preferences
router.patch('/api/email-preferences', async (req: any, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Validate request body
    const result = updateEmailPreferencesSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid email preferences data',
        details: result.error.issues 
      });
    }
    
    // Ensure essential emails cannot be disabled
    const updates = { ...result.data };
    
    // Force essential emails to always be enabled for security
    if ('passwordResetEmails' in updates) updates.passwordResetEmails = true;
    if ('accountDeletionEmails' in updates) updates.accountDeletionEmails = true;
    if ('emergencyNotifications' in updates) updates.emergencyNotifications = true;
    
    // If master toggle is disabled, disable non-essential emails
    if ((updates as any).allEmailsEnabled === false) {
      const nonEssentialFields = [
        'welcomeEmails', 'onboardingTips', 'weeklyProgressReports', 'assignmentNotifications',
        'gradeNotifications', 'attendanceAlerts', 'examSchedules', 'geolocationAlerts',
        'securityUpdates', 'parentTeacherMessages', 'schoolAnnouncements', 'eventInvitations',
        'newsletters', 'paymentConfirmations', 'subscriptionReminders', 'invoiceDelivery',
        'paymentFailures', 'systemMaintenance', 'featureUpdates', 'platformNews',
        'loginAttempts', 'profileChanges', 'promotionalEmails', 'partnerOffers', 'surveyRequests'
      ];
      
      nonEssentialFields.forEach(field => {
        if (field in updates) (updates as any)[field] = false;
      });
    }
    
    const updatedPreferences = await storage.updateEmailPreferences(userId, updates);
    
    console.log(`[EMAIL_PREFERENCES] Updated preferences for user ${userId}`);
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating email preferences:', error);
    res.status(500).json({ error: 'Failed to update email preferences' });
  }
});

// Reset email preferences to defaults
router.post('/api/email-preferences/reset', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const defaultPrefs = getDefaultEmailPreferences(user.role);
    const resetPreferences = await storage.updateEmailPreferences(userId, defaultPrefs);
    
    console.log(`[EMAIL_PREFERENCES] Reset preferences to defaults for user ${userId} (${user.role})`);
    res.json(resetPreferences);
  } catch (error) {
    console.error('Error resetting email preferences:', error);
    res.status(500).json({ error: 'Failed to reset email preferences' });
  }
});

export default router;