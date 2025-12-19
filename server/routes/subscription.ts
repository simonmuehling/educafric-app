import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { storage } from '../storage';
// Simplified logger for subscription routes
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[SUBSCRIPTION] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[SUBSCRIPTION ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[SUBSCRIPTION WARN] ${message}`, ...args)
};

const router = Router();

// Initialize Stripe with safe fallback
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-08-27.basil',
}) : null;

// Helper to check if Stripe is available
const requireStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY.');
  }
  return stripe;
};

// Validation schemas
const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  planId: z.string(),
  childrenCount: z.number().optional(),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  geolocationEnabled: z.boolean().optional(),
  language: z.enum(['fr', 'en']).optional(),
  paymentMethod: z.enum(['stripe', 'orange_money', 'bank_transfer']).optional()
});

const activateSubscriptionSchema = z.object({
  planId: z.string(),
  paymentIntentId: z.string(),
  duration: z.enum(['monthly', 'annual', 'semester'])
});

const paymentConfirmationSchema = z.object({
  userId: z.number(),
  amount: z.number().positive(),
  paymentMethod: z.string(),
  transactionReference: z.string(),
  notes: z.string().optional()
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  // Parent plans
  parent_basic: {
    name: 'Parent Basic',
    category: 'parent',
    monthlyPrice: 1000,
    annualPrice: 12000,
    features: ['basic_tracking', 'parent_communication', 'sms_notifications', 'attendance_tracking']
  },
  parent_geolocation: {
    name: 'Parent Geolocation',
    category: 'parent',
    monthlyPrice: 1000,
    annualPrice: 12000,
    features: ['geolocation', 'real_time_grades', 'advanced_analytics', 'safety_zones']
  },
  // School plans
  school_public: {
    name: 'Public School',
    category: 'school',
    annualPrice: 50000,
    features: ['class_management', 'report_generation', 'student_database', 'basic_analytics']
  },
  school_private: {
    name: 'Private School',
    category: 'school',
    annualPrice: 75000,
    features: ['premium_features', 'advanced_analytics', 'priority_support', 'custom_branding']
  },
  // Freelancer plans
  freelancer_semester: {
    name: 'Freelancer Semester',
    category: 'freelancer',
    semesterPrice: 12500,
    features: ['class_management', 'grade_tracking', 'parent_communication', 'lesson_planning']
  },
  freelancer_annual: {
    name: 'Freelancer Annual',
    category: 'freelancer',
    annualPrice: 25000,
    features: ['class_management', 'advanced_analytics', 'payment_tracking', 'calendar_integration']
  },
  freelancer_geolocation: {
    name: 'Freelancer Geolocation',
    category: 'freelancer',
    annualPrice: 15000,
    features: ['geolocation', 'student_tracking', 'safety_monitoring', 'parent_alerts']
  }
};

// Get available subscription plans
router.get('/plans', (req, res) => {
  try {
    res.json(SUBSCRIPTION_PLANS);
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Middleware to check authentication (simplified)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Create payment intent for Stripe
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const validatedData = createPaymentIntentSchema.parse(req.body);
    const { amount, planId, childrenCount = 1, billingCycle, geolocationEnabled, language = 'fr', paymentMethod = 'stripe' } = validatedData;

    // Calculate final amount with discounts
    let finalAmount = amount;
    
    // Apply family discount for parent plans
    if (planId.startsWith('parent_') && childrenCount > 1) {
      if (childrenCount === 2) {
        finalAmount = Math.round(finalAmount * 0.8); // 20% discount
      } else if (childrenCount >= 3) {
        finalAmount = Math.round(finalAmount * 0.6); // 40% discount
      }
    }

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount), // Amount in CFA centimes (Stripe expects smallest currency unit)
        currency: "xaf", // Central African CFA Franc
        metadata: {
          userId: req.user!.id.toString(),
          planId: planId,
          childrenCount: childrenCount.toString(),
          billingCycle: billingCycle || 'monthly',
          geolocationEnabled: geolocationEnabled?.toString() || 'false',
          language: language,
          platform: "EduConnect Africa"
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: finalAmount
      });
    } else {
      // Handle alternative payment methods
      const reference = `EDU${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // For now, just return the reference and instructions
      // In a real implementation, you would store this in the database

      res.json({
        reference: reference,
        amount: finalAmount,
        paymentMethod: paymentMethod,
        instructions: getPaymentInstructions(paymentMethod, finalAmount, reference, language)
      });
    }

    logger.info(`Payment intent created for user ${req.user!.id}, plan ${planId}, amount ${finalAmount} CFA`);
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Activate subscription after successful payment
router.post('/activate', requireAuth, async (req, res) => {
  try {
    const validatedData = activateSubscriptionSchema.parse(req.body);
    const { planId, paymentIntentId, duration } = validatedData;

    const userId = req.user!.id;

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    
    switch (duration) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'semester':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
    }

    // For now, just respond with success
    // In a real implementation, this would be stored in the database
    res.json({
      success: true,
      subscription: {
        planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active'
      }
    });

    logger.info(`Subscription activated for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error activating subscription:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// Check subscription status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // For demo purposes, return a basic subscription status
    res.json({
      hasActiveSubscription: false,
      message: 'No active subscription found'
    });
  } catch (error) {
    logger.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Manual payment confirmation (for commercial team)
router.post('/create-payment-confirmation', requireAuth, async (req, res) => {
  try {
    // Check if user has commercial role
    if (!['commercial', 'site_admin', 'admin'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = paymentConfirmationSchema.parse(req.body);
    const { userId, amount, paymentMethod, transactionReference, notes } = validatedData;

    // For now, just log and respond with success
    // In a real implementation, this would be stored in the database
    res.json({
      success: true,
      message: 'Payment confirmation recorded successfully'
    });

    logger.info(`Payment confirmation created by ${req.user!.email} for user ${userId}`);
  } catch (error) {
    logger.error('Error creating payment confirmation:', error);
    res.status(500).json({ error: 'Failed to create payment confirmation' });
  }
});

// Subscription renewal
router.post('/renew', requireAuth, async (req, res) => {
  try {
    const { planId, duration = 'annual' } = req.body;
    const userId = req.user!.id;

    // Calculate new dates
    const renewalStartDate = new Date();
    const renewalEndDate = new Date(renewalStartDate);
    
    switch (duration) {
      case 'monthly':
        renewalEndDate.setMonth(renewalEndDate.getMonth() + 1);
        break;
      case 'annual':
        renewalEndDate.setFullYear(renewalEndDate.getFullYear() + 1);
        break;
      case 'semester':
        renewalEndDate.setMonth(renewalEndDate.getMonth() + 6);
        break;
    }

    res.json({
      success: true,
      renewal: {
        planId,
        startDate: renewalStartDate.toISOString(),
        endDate: renewalEndDate.toISOString(),
        status: 'active'
      }
    });

    logger.info(`Subscription renewed for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error renewing subscription:', error);
    res.status(500).json({ error: 'Failed to renew subscription' });
  }
});

// Create manual payment request (Orange Money / Bank Transfer)
router.post('/create-manual-payment', requireAuth, async (req, res) => {
  try {
    const { planId, amount, paymentMethod, childrenCount } = req.body;
    const user = req.user!;

    // Store pending payment status
    // In real implementation, you would update the database
    
    // Payment instructions based on method
    const paymentInstructions = {
      orange_money: {
        method: 'Orange Money',
        number: '+237 600 000 000',
        beneficiary: 'EDUCAFRIC SUPPORT',
        reference: `EDUCAFRIC-${user.id}-${planId}`,
        instructions: [
          'Composez #144# sur votre téléphone Orange',
          'Sélectionnez "Transfert d\'argent"',
          `Numéro: +237 600 000 000`,
          'Bénéficiaire: EDUCAFRIC SUPPORT',
          `Montant: ${amount} CFA`,
          'Notez le numéro de transaction SMS'
        ]
      },
      bank_transfer: {
        method: 'Virement Bancaire',
        bank: 'Afriland First Bank',
        beneficiary: 'EDUCAFRIC PAYMENT SERVICES',
        reference: `EDUCAFRIC-${user.id}-${planId}`,
        instructions: [
          'Rendez-vous dans votre banque ou utilisez votre app bancaire',
          'Banque: Afriland First Bank',
          'Bénéficiaire: EDUCAFRIC PAYMENT SERVICES',
          `Montant: ${amount} CFA`,
          `Référence: EDUCAFRIC-${user.id}-${planId}`,
          'Conservez votre reçu de virement'
        ]
      }
    };

    const instructions = paymentInstructions[paymentMethod as keyof typeof paymentInstructions];

    logger.info(`Manual payment created for user ${user.id}:`, {
      planId,
      amount,
      paymentMethod,
      instructions
    });

    res.json({
      success: true,
      paymentReference: `EDUCAFRIC-${user.id}-${planId}`,
      instructions: instructions,
      message: 'Payment instructions sent. Your subscription will be activated within 24-48 hours after payment confirmation.'
    });

  } catch (error) {
    logger.error('Manual payment creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual payment'
    });
  }
});

// Helper function to get payment instructions
function getPaymentInstructions(paymentMethod: string, amount: number, reference: string, language: string) {
  const instructions = {
    fr: {
      orange_money: `
        Instructions Orange Money:
        Numéro: +237 600 000 000
        Bénéficiaire: EDUCAFRIC SUPPORT
        Montant: ${amount} CFA
        Référence: ${reference}
        
        Composez #144# et suivez les instructions.
      `,
      bank_transfer: `
        Virement Bancaire - EDUCAFRIC PAYMENT SERVICES:
        Banque: Afriland First Bank
        IBAN: CM21 10005 00024 08750211001-91
        Code SWIFT/BIC: CCEICMCX
        Code Banque: 10005
        Code Guichet: 00024
        Numéro de compte: 08750211001
        Clé RIB: 91
        Montant: ${amount} CFA
        Motif: educafric
        Pays: Cameroun
        
        Conservez votre reçu de virement.
      `
    },
    en: {
      orange_money: `
        Orange Money Instructions:
        Number: +237 600 000 000
        Beneficiary: EDUCAFRIC SUPPORT
        Amount: ${amount} CFA
        Reference: ${reference}
        
        Dial #144# and follow instructions.
      `,
      bank_transfer: `
        Bank Transfer - EDUCAFRIC PAYMENT SERVICES:
        Bank: Afriland First Bank
        IBAN: CM21 10005 00024 08750211001-91
        SWIFT/BIC Code: CCEICMCX
        Bank Code: 10005
        Branch Code: 00024
        Account Number: 08750211001
        RIB Key: 91
        Amount: ${amount} CFA
        Reference: educafric
        Country: Cameroon
        
        Keep your transfer receipt.
      `
    }
  };

  return instructions[language as keyof typeof instructions]?.[paymentMethod as keyof typeof instructions.fr] || '';
}

export default router;