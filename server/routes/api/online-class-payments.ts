/**
 * ONLINE CLASS PAYMENTS - STRIPE, MTN MOBILE MONEY & ORANGE MONEY
 * Routes de paiement pour l'achat du module cours en ligne par les enseignants
 */

import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../../middleware/auth';
import { mtnService, ValidationError } from '../../services/mtnMobileMoneyService';
import { orangeMoneyService } from '../../services/orangeMoneyService';
import { onlineClassActivationService } from '../../services/onlineClassActivationService';
import { z } from 'zod';

// Initialize Stripe with safe fallback
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-08-27.basil',
}) : null;

if (!stripe) {
  console.warn('[ONLINE_CLASS_PAYMENTS] ⚠️ STRIPE_SECRET_KEY not configured - Stripe payments disabled');
}

const router = Router();

// Calculate price based on duration
function calculatePrice(durationType: string): number {
  switch (durationType) {
    case 'daily': return 2500;
    case 'weekly': return 10000;
    case 'monthly': return 25000;
    case 'quarterly': return 73000;
    case 'semestral': return 105000;
    case 'yearly': return 150000;
    default: return 150000;
  }
}

// Validation schemas
const createStripeIntentSchema = z.object({
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly'])
});

const createMtnPaymentSchema = z.object({
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly']),
  phoneNumber: z.string()
});

const createOrangePaymentSchema = z.object({
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly']),
  phoneNumber: z.string().min(9, 'Numéro de téléphone invalide')
});

/**
 * POST /api/online-class-payments/create-stripe-intent
 * Create a Stripe PaymentIntent for online class purchase
 */
router.post('/create-stripe-intent',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only teachers can purchase
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les enseignants peuvent acheter ce module'
        });
      }

      const validated = createStripeIntentSchema.parse(req.body);
      const amount = calculatePrice(validated.durationType);

      console.log(`[ONLINE_CLASS_PAYMENT] 💳 Creating Stripe intent for teacher ${user.id}:`, {
        durationType: validated.durationType,
        amount
      });

      // Create PaymentIntent
      // XAF is a zero-decimal currency, no need to multiply by 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'xaf', // XAF = Central African Franc
        metadata: {
          teacherId: user.id.toString(),
          durationType: validated.durationType,
          module: 'online_classes',
          teacherEmail: user.email || '',
          teacherName: `${user.firstName} ${user.lastName}`
        },
        description: `Educafric - Module Cours en Ligne (${validated.durationType})`,
      });

      console.log(`[ONLINE_CLASS_PAYMENT] ✅ Stripe PaymentIntent created: ${paymentIntent.id}`);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: 'XAF',
        durationType: validated.durationType
      });
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ Stripe intent creation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du paiement'
      });
    }
  }
);

/**
 * POST /api/online-class-payments/confirm-stripe-payment
 * Confirm Stripe payment and activate online classes module
 * This is called by the frontend after successful payment (since webhooks don't work well on Replit)
 */
const confirmStripePaymentSchema = z.object({
  paymentIntentId: z.string(),
  durationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semestral', 'yearly'])
});

router.post('/confirm-stripe-payment',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les enseignants peuvent activer ce module'
        });
      }

      const validated = confirmStripePaymentSchema.parse(req.body);
      
      console.log(`[ONLINE_CLASS_PAYMENT] 🔍 Confirming Stripe payment for teacher ${user.id}:`, {
        paymentIntentId: validated.paymentIntentId,
        durationType: validated.durationType
      });

      if (!stripe) {
        return res.status(500).json({
          success: false,
          error: 'Stripe non configuré'
        });
      }

      // Retrieve the payment intent from Stripe to verify it's paid
      const paymentIntent = await stripe.paymentIntents.retrieve(validated.paymentIntentId);
      
      console.log(`[ONLINE_CLASS_PAYMENT] 📄 PaymentIntent status: ${paymentIntent.status}`);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          error: `Paiement non confirmé. Statut: ${paymentIntent.status}`
        });
      }

      // Verify the payment metadata matches
      if (paymentIntent.metadata.teacherId !== user.id.toString()) {
        console.error(`[ONLINE_CLASS_PAYMENT] ❌ TeacherId mismatch:`, {
          expected: user.id.toString(),
          actual: paymentIntent.metadata.teacherId
        });
        return res.status(403).json({
          success: false,
          error: 'Ce paiement ne vous appartient pas'
        });
      }

      // Check if already activated for this payment
      const existingActivation = await onlineClassActivationService.checkTeacherActivation(user.id);
      if (existingActivation && existingActivation.paymentReference === validated.paymentIntentId) {
        console.log(`[ONLINE_CLASS_PAYMENT] ℹ️ Already activated for this payment`);
        return res.json({
          success: true,
          message: 'Module déjà activé',
          activation: existingActivation
        });
      }

      // Activate online class module for teacher
      const amount = calculatePrice(validated.durationType);
      const activation = await onlineClassActivationService.activateForTeacher(
        user.id,
        validated.paymentIntentId,
        'stripe',
        validated.durationType as any,
        amount
      );

      console.log(`[ONLINE_CLASS_PAYMENT] 🎉 Teacher ${user.id} activated successfully via direct confirmation`);
      console.log(`[ONLINE_CLASS_PAYMENT] 📅 Access expires: ${activation.endDate.toISOString()}`);

      res.json({
        success: true,
        message: 'Module cours en ligne activé avec succès!',
        activation: {
          startDate: activation.startDate,
          endDate: activation.endDate,
          durationType: activation.durationType
        }
      });
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ Stripe confirmation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la confirmation du paiement'
      });
    }
  }
);

/**
 * POST /api/online-class-payments/create-mtn-payment
 * Create an MTN Mobile Money payment for online class purchase
 */
router.post('/create-mtn-payment',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only teachers can purchase
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les enseignants peuvent acheter ce module'
        });
      }

      const validated = createMtnPaymentSchema.parse(req.body);
      const amount = calculatePrice(validated.durationType);

      console.log(`[ONLINE_CLASS_PAYMENT] 📱 Creating MTN payment for teacher ${user.id}:`, {
        durationType: validated.durationType,
        amount,
        phoneNumber: validated.phoneNumber
      });

      // Generate unique order ID
      const orderId = `ONLINECLASS_${user.id}_${validated.durationType}_${Date.now()}`;

      // Create MTN payment
      const paymentData = await mtnService.createSubscriptionPayment({
        amount,
        currency: 'XAF',
        planName: `Cours en Ligne (${validated.durationType})`,
        phoneNumber: validated.phoneNumber,
        callbackUrl: `${process.env.BASE_URL}/api/online-class-payments/mtn-webhook`,
        returnUrl: `${process.env.BASE_URL}/teacher`
      });

      if (paymentData.success) {
        console.log(`[ONLINE_CLASS_PAYMENT] ✅ MTN payment created:`, {
          orderId,
          messageId: paymentData.messageId,
          txRef: paymentData.txRef
        });

        res.json({
          success: true,
          transactionId: paymentData.transactionId,
          txRef: paymentData.txRef,
          messageId: paymentData.messageId,
          instructions: paymentData.instructions,
          amount,
          currency: 'XAF',
          durationType: validated.durationType,
          orderId
        });
      } else {
        throw new Error(paymentData.error || 'Erreur lors de la création du paiement MTN');
      }
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ MTN payment creation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          code: error.code,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la création du paiement MTN'
      });
    }
  }
);

/**
 * POST /api/online-class-payments/create-orange-payment
 * Create an Orange Money payment for online class purchase
 */
router.post('/create-orange-payment',
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Only teachers can purchase
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les enseignants peuvent acheter ce module'
        });
      }

      const validated = createOrangePaymentSchema.parse(req.body);
      const amount = calculatePrice(validated.durationType);

      console.log(`[ONLINE_CLASS_PAYMENT] 🍊 Creating Orange Money payment for teacher ${user.id}:`, {
        durationType: validated.durationType,
        amount,
        phoneNumber: validated.phoneNumber
      });

      // Generate unique order ID
      const orderId = `ONLINECLASS_${user.id}_${validated.durationType}_${Date.now()}`;

      // Create Orange Money payment
      const paymentResult = await orangeMoneyService.initiatePayment({
        amount,
        phoneNumber: validated.phoneNumber,
        orderId,
        description: `Educafric - Module Cours en Ligne (${validated.durationType})`,
        metadata: {
          teacherId: user.id.toString(),
          durationType: validated.durationType,
          module: 'online_classes'
        }
      });

      if (paymentResult.success) {
        console.log(`[ONLINE_CLASS_PAYMENT] ✅ Orange Money payment initiated:`, {
          orderId,
          transactionId: paymentResult.transactionId
        });

        res.json({
          success: true,
          transactionId: paymentResult.transactionId,
          ussdCode: paymentResult.ussdCode,
          instructions: paymentResult.instructions,
          amount,
          currency: 'XAF',
          durationType: validated.durationType,
          orderId
        });
      } else {
        throw new Error(paymentResult.error || 'Erreur lors de la création du paiement Orange Money');
      }
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ Orange Money payment creation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la création du paiement Orange Money'
      });
    }
  }
);

/**
 * POST /api/online-class-payments/orange-webhook
 * Orange Money webhook to handle payment confirmations
 */
router.post('/orange-webhook',
  async (req, res) => {
    try {
      console.log('[ONLINE_CLASS_PAYMENT] 🔔 Orange Money webhook received:', req.body);
      
      const { status, orderId, transactionId, amount, txnStatus, data } = req.body;
      const actualStatus = status || txnStatus || data?.status;
      const actualOrderId = orderId || data?.orderId || data?.externalId;
      const actualAmount = amount || data?.amount;
      
      if (actualStatus === 'SUCCESS' || actualStatus === 'SUCCESSFUL' || actualStatus === 'COMPLETED') {
        console.log('[ONLINE_CLASS_PAYMENT] ✅ Orange Money payment successful:', { 
          orderId: actualOrderId, 
          amount: actualAmount, 
          transactionId 
        });
        
        // Extract teacher ID and duration from order_id (format: ONLINECLASS_{teacherId}_{durationType}_{timestamp})
        const match = actualOrderId?.match(/ONLINECLASS_(\d+)_(\w+)_\d+/);
        if (match && actualAmount) {
          const [, teacherId, durationType] = match;
          
          // Verify amount matches expected price
          const expectedAmount = calculatePrice(durationType as any);
          const receivedAmount = parseFloat(actualAmount);
          
          if (Math.abs(receivedAmount - expectedAmount) > 1) {
            console.error('[ONLINE_CLASS_PAYMENT] ❌ Orange amount mismatch:', {
              expected: expectedAmount,
              received: receivedAmount,
              orderId: actualOrderId
            });
            return res.status(400).json({
              success: false,
              message: 'Payment amount mismatch'
            });
          }
          
          console.log(`[ONLINE_CLASS_PAYMENT] 🎯 Activating for teacher ${teacherId}, duration: ${durationType}`);
          
          try {
            const activation = await onlineClassActivationService.activateForTeacher(
              parseInt(teacherId),
              transactionId || actualOrderId,
              'orange',
              durationType as any,
              receivedAmount
            );

            console.log(`[ONLINE_CLASS_PAYMENT] 🎉 Teacher ${teacherId} activated successfully via Orange Money`);
            console.log(`[ONLINE_CLASS_PAYMENT] 📅 Access expires: ${activation.endDate.toISOString()}`);
          } catch (error: any) {
            console.error('[ONLINE_CLASS_PAYMENT] ❌ Activation failed after Orange Money payment:', error);
          }
        } else {
          console.log('[ONLINE_CLASS_PAYMENT] ⚠️ Could not extract teacher info from order_id:', actualOrderId);
        }
        
        res.status(200).json({
          success: true,
          message: 'Webhook processed successfully'
        });
      } else if (actualStatus === 'FAILED' || actualStatus === 'CANCELLED') {
        console.log('[ONLINE_CLASS_PAYMENT] ❌ Orange Money payment failed:', { 
          orderId: actualOrderId, 
          status: actualStatus 
        });
        
        res.status(200).json({
          success: true,
          message: 'Failed payment processed'
        });
      } else {
        console.log('[ONLINE_CLASS_PAYMENT] ⚠️ Unknown Orange Money webhook status:', { status: actualStatus });
        
        res.status(200).json({
          success: true,
          message: 'Webhook received'
        });
      }
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ Error processing Orange Money webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/online-class-payments/stripe-webhook
 * Stripe webhook to handle payment confirmations
 */
router.post('/stripe-webhook',
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('No signature');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature (requires raw body)
      // Note: This route requires express.raw({ type: 'application/json' }) middleware
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[ONLINE_CLASS_PAYMENT] 🔔 Stripe webhook received: ${event.type}`);

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      // Verify amount matches expected price (XAF is zero-decimal)
      const expectedAmount = calculatePrice(metadata.durationType as any);
      if (paymentIntent.amount !== expectedAmount) {
        console.error('[ONLINE_CLASS_PAYMENT] ❌ Amount mismatch:', {
          expected: expectedAmount,
          received: paymentIntent.amount
        });
        return res.status(400).json({ error: 'Payment amount mismatch' });
      }

      console.log(`[ONLINE_CLASS_PAYMENT] ✅ Payment succeeded:`, {
        paymentIntentId: paymentIntent.id,
        teacherId: metadata.teacherId,
        durationType: metadata.durationType,
        amount: paymentIntent.amount
      });

      try {
        // Activate online class module for teacher
        const activation = await onlineClassActivationService.activateForTeacher(
          parseInt(metadata.teacherId),
          paymentIntent.id,
          'stripe',
          metadata.durationType as any,
          paymentIntent.amount
        );

        console.log(`[ONLINE_CLASS_PAYMENT] 🎉 Teacher ${metadata.teacherId} activated successfully via Stripe`);
        console.log(`[ONLINE_CLASS_PAYMENT] 📅 Access expires: ${activation.endDate.toISOString()}`);
      } catch (error: any) {
        console.error('[ONLINE_CLASS_PAYMENT] ❌ Activation failed after payment:', error);
      }
    }

    res.json({ received: true });
  }
);

/**
 * POST /api/online-class-payments/mtn-webhook
 * MTN Mobile Money webhook to handle payment confirmations
 */
router.post('/mtn-webhook',
  async (req, res) => {
    try {
      console.log('[ONLINE_CLASS_PAYMENT] 🔔 MTN webhook received:', req.body);
      
      const { ErrorCode, body, parameters, MessageId, status, Status } = req.body;
      const actualStatus = Status || status;
      
      if (ErrorCode === 200 && (actualStatus === 'SUCCESSFUL' || body?.includes('SUCCESSFUL'))) {
        const { order_id, amount, subscriberMsisdn } = parameters || {};
        
        console.log('[ONLINE_CLASS_PAYMENT] ✅ MTN payment successful:', { 
          orderId: order_id, 
          amount, 
          phone: subscriberMsisdn,
          messageId: MessageId 
        });
        
        // Extract teacher ID and duration from order_id (format: ONLINECLASS_{teacherId}_{durationType}_{timestamp})
        const match = order_id?.match(/ONLINECLASS_(\d+)_(\w+)_\d+/);
        if (match && amount) {
          const [, teacherId, durationType] = match;
          
          // Verify amount matches expected price
          const expectedAmount = calculatePrice(durationType as any);
          const receivedAmount = parseFloat(amount);
          
          if (Math.abs(receivedAmount - expectedAmount) > 1) { // Allow 1 CFA tolerance for rounding
            console.error('[ONLINE_CLASS_PAYMENT] ❌ MTN amount mismatch:', {
              expected: expectedAmount,
              received: receivedAmount,
              orderId: order_id
            });
            return res.status(400).json({
              success: false,
              message: 'Payment amount mismatch',
              messageId: MessageId
            });
          }
          
          console.log(`[ONLINE_CLASS_PAYMENT] 🎯 Activating for teacher ${teacherId}, duration: ${durationType}`);
          
          try {
            const activation = await onlineClassActivationService.activateForTeacher(
              parseInt(teacherId),
              MessageId,
              'mtn',
              durationType as any,
              receivedAmount
            );

            console.log(`[ONLINE_CLASS_PAYMENT] 🎉 Teacher ${teacherId} activated successfully via MTN`);
            console.log(`[ONLINE_CLASS_PAYMENT] 📅 Access expires: ${activation.endDate.toISOString()}`);
          } catch (error: any) {
            console.error('[ONLINE_CLASS_PAYMENT] ❌ Activation failed after MTN payment:', error);
          }
        } else {
          console.log('[ONLINE_CLASS_PAYMENT] ⚠️ Could not extract teacher info from order_id:', order_id);
        }
        
        res.status(200).json({
          success: true,
          message: 'Webhook processed successfully',
          messageId: MessageId
        });
      } else if (ErrorCode === 200 && actualStatus === 'FAILED') {
        const { order_id, Reason } = req.body;
        
        console.log('[ONLINE_CLASS_PAYMENT] ❌ MTN payment failed:', { 
          orderId: order_id, 
          reason: Reason,
          messageId: MessageId 
        });
        
        res.status(200).json({
          success: true,
          message: 'Failed payment processed',
          messageId: MessageId
        });
      } else {
        console.log('[ONLINE_CLASS_PAYMENT] ⚠️ Unknown MTN webhook status:', { ErrorCode, status: actualStatus });
        
        res.status(200).json({
          success: true,
          message: 'Webhook received',
          messageId: MessageId
        });
      }
    } catch (error: any) {
      console.error('[ONLINE_CLASS_PAYMENT] ❌ Error processing MTN webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }
);

export default router;
