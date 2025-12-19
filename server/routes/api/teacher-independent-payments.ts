/**
 * TEACHER INDEPENDENT ACTIVATION PAYMENTS - STRIPE & MTN MOBILE MONEY
 * Routes de paiement pour l'activation du mode répétiteur indépendant (25,000 CFA/an)
 */

import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../../middleware/auth';
import { mtnService, ValidationError } from '../../services/mtnMobileMoneyService';
import { db } from '../../db';
import { teacherIndependentActivations, users } from '../../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { z } from 'zod';

// Initialize Stripe with safe fallback
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-08-27.basil',
}) : null;

if (!stripe) {
  console.warn('[TEACHER_INDEPENDENT_PAYMENTS] ⚠️ STRIPE_SECRET_KEY not configured - Stripe payments disabled');
}

const router = Router();

// Fixed price for yearly activation
const ACTIVATION_PRICE = 25000; // 25,000 XAF

// Validation schemas
const createMtnPaymentSchema = z.object({
  phoneNumber: z.string()
});

/**
 * POST /api/teacher-independent-payments/create-stripe-intent
 * Create a Stripe PaymentIntent for teacher independent activation (25,000 CFA)
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
          error: 'Seuls les enseignants peuvent acheter cette activation'
        });
      }

      // Check if already has active activation
      const existingActivation = await db
        .select()
        .from(teacherIndependentActivations)
        .where(
          and(
            eq(teacherIndependentActivations.teacherId, user.id),
            eq(teacherIndependentActivations.status, 'active'),
            gte(teacherIndependentActivations.endDate, new Date())
          )
        )
        .limit(1);

      if (existingActivation.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Vous avez déjà une activation active'
        });
      }

      console.log(`[INDEPENDENT_PAYMENT] 💳 Creating Stripe intent for teacher ${user.id}:`, {
        amount: ACTIVATION_PRICE,
        type: 'yearly_activation'
      });

      // Create PaymentIntent
      // XAF is a zero-decimal currency, no need to multiply by 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount: ACTIVATION_PRICE,
        currency: 'xaf', // XAF = Central African Franc
        metadata: {
          teacherId: user.id.toString(),
          activationType: 'independent_teacher',
          teacherEmail: user.email || '',
          teacherName: `${user.firstName} ${user.lastName}`,
          durationType: 'yearly'
        },
        description: `Educafric - Activation Répétiteur Indépendant (25,000 CFA/an)`,
      });

      console.log(`[INDEPENDENT_PAYMENT] ✅ Stripe PaymentIntent created: ${paymentIntent.id}`);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: ACTIVATION_PRICE,
        currency: 'XAF'
      });
    } catch (error: any) {
      console.error('[INDEPENDENT_PAYMENT] ❌ Stripe intent creation error:', error);

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du paiement'
      });
    }
  }
);

/**
 * POST /api/teacher-independent-payments/create-mtn-payment
 * Create an MTN Mobile Money payment for teacher independent activation
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
          error: 'Seuls les enseignants peuvent acheter cette activation'
        });
      }

      // Check if already has active activation
      const existingActivation = await db
        .select()
        .from(teacherIndependentActivations)
        .where(
          and(
            eq(teacherIndependentActivations.teacherId, user.id),
            eq(teacherIndependentActivations.status, 'active'),
            gte(teacherIndependentActivations.endDate, new Date())
          )
        )
        .limit(1);

      if (existingActivation.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Vous avez déjà une activation active'
        });
      }

      const validated = createMtnPaymentSchema.parse(req.body);

      console.log(`[INDEPENDENT_PAYMENT] 📱 Creating MTN payment for teacher ${user.id}:`, {
        amount: ACTIVATION_PRICE,
        phoneNumber: validated.phoneNumber
      });

      // Generate unique order ID
      const orderId = `TEACHER_IND_${user.id}_${Date.now()}`;

      // Create MTN payment
      const paymentData = await mtnService.createSubscriptionPayment({
        amount: ACTIVATION_PRICE,
        currency: 'XAF',
        planName: 'Activation Répétiteur Indépendant (1 an)',
        phoneNumber: validated.phoneNumber,
        callbackUrl: `${process.env.BASE_URL}/api/teacher-independent-payments/mtn-webhook`,
        returnUrl: `${process.env.BASE_URL}/teacher/independent`
      });

      if (paymentData.success) {
        console.log(`[INDEPENDENT_PAYMENT] ✅ MTN payment created:`, {
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
          amount: ACTIVATION_PRICE,
          currency: 'XAF',
          orderId
        });
      } else {
        throw new Error(paymentData.error || 'Erreur lors de la création du paiement MTN');
      }
    } catch (error: any) {
      console.error('[INDEPENDENT_PAYMENT] ❌ MTN payment creation error:', error);
      
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
 * POST /api/teacher-independent-payments/stripe-webhook
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
      console.error('[INDEPENDENT_PAYMENT] ❌ STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature (requires raw body)
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[INDEPENDENT_PAYMENT] ⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const teacherId = parseInt(paymentIntent.metadata.teacherId);
      const amountReceived = paymentIntent.amount;

      console.log(`[INDEPENDENT_PAYMENT] 💰 Payment succeeded:`, {
        paymentIntentId: paymentIntent.id,
        teacherId,
        amount: amountReceived,
        currency: paymentIntent.currency
      });

      // Verify amount matches expected price
      if (amountReceived !== ACTIVATION_PRICE) {
        console.error(`[INDEPENDENT_PAYMENT] ❌ Amount mismatch: expected ${ACTIVATION_PRICE}, got ${amountReceived}`);
        return res.status(400).send('Amount mismatch');
      }

      try {
        // IDEMPOTENCY CHECK: Verify payment hasn't been processed already
        const existingActivation = await db
          .select()
          .from(teacherIndependentActivations)
          .where(
            and(
              eq(teacherIndependentActivations.teacherId, teacherId),
              eq(teacherIndependentActivations.notes, `Paiement Stripe confirmé - PaymentIntent: ${paymentIntent.id}`)
            )
          )
          .limit(1);

        if (existingActivation.length > 0) {
          console.log(`[INDEPENDENT_PAYMENT] ℹ️ Payment already processed (PaymentIntent: ${paymentIntent.id})`);
          return res.json({ received: true, alreadyProcessed: true });
        }

        // Verify teacher exists and is valid
        const [teacher] = await db
          .select()
          .from(users)
          .where(eq(users.id, teacherId))
          .limit(1);

        if (!teacher || teacher.role !== 'Teacher') {
          console.error(`[INDEPENDENT_PAYMENT] ❌ Invalid teacher: ${teacherId}`);
          return res.status(400).send('Invalid teacher');
        }

        // Create activation
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now

        await db.insert(teacherIndependentActivations).values({
          teacherId,
          durationType: 'yearly',
          startDate,
          endDate,
          status: 'active',
          activatedBy: 'self_purchase',
          paymentMethod: 'stripe',
          amountPaid: amountReceived,
          notes: `Paiement Stripe confirmé - PaymentIntent: ${paymentIntent.id}`
        });

        // Update user's work_mode to hybrid if needed
        if (teacher.workMode === 'school') {
          await db
            .update(users)
            .set({ workMode: 'hybrid' })
            .where(eq(users.id, teacherId));
        }

        console.log(`[INDEPENDENT_PAYMENT] ✅ Activation created for teacher ${teacherId}`);
      } catch (dbError) {
        console.error('[INDEPENDENT_PAYMENT] ❌ Database error:', dbError);
        return res.status(500).send('Database error');
      }
    }

    res.json({ received: true });
  }
);

/**
 * POST /api/teacher-independent-payments/mtn-webhook
 * MTN Mobile Money webhook to handle payment confirmations
 */
router.post('/mtn-webhook',
  async (req, res) => {
    try {
      console.log('[INDEPENDENT_PAYMENT] 📱 MTN webhook received:', req.body);

      const { order_id, amount, status } = req.body;

      // Validate required fields
      if (!order_id || !amount || !status) {
        console.error('[INDEPENDENT_PAYMENT] ❌ Missing required webhook fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (status === 'successful' || status === 'completed') {
        // Extract teacherId from order_id (format: TEACHER_IND_{teacherId}_{timestamp})
        const parts = order_id.split('_');
        const teacherId = parseInt(parts[2]);
        const amountReceived = parseInt(amount);

        // Validate parsing results
        if (isNaN(teacherId) || teacherId <= 0) {
          console.error(`[INDEPENDENT_PAYMENT] ❌ Invalid teacherId from order_id: ${order_id}`);
          return res.status(400).json({ error: 'Invalid order_id format' });
        }

        if (isNaN(amountReceived) || amountReceived <= 0) {
          console.error(`[INDEPENDENT_PAYMENT] ❌ Invalid amount: ${amount}`);
          return res.status(400).json({ error: 'Invalid amount' });
        }

        console.log(`[INDEPENDENT_PAYMENT] 💰 MTN Payment successful:`, {
          orderId: order_id,
          teacherId,
          amount: amountReceived
        });

        // Verify amount matches expected price
        if (amountReceived !== ACTIVATION_PRICE) {
          console.error(`[INDEPENDENT_PAYMENT] ❌ Amount mismatch: expected ${ACTIVATION_PRICE}, got ${amountReceived}`);
          return res.status(400).json({ error: 'Amount mismatch' });
        }

        // IDEMPOTENCY CHECK: Verify payment hasn't been processed already
        const existingActivation = await db
          .select()
          .from(teacherIndependentActivations)
          .where(
            and(
              eq(teacherIndependentActivations.teacherId, teacherId),
              eq(teacherIndependentActivations.notes, `Paiement MTN Mobile Money confirmé - Order: ${order_id}`)
            )
          )
          .limit(1);

        if (existingActivation.length > 0) {
          console.log(`[INDEPENDENT_PAYMENT] ℹ️ Payment already processed (Order: ${order_id})`);
          return res.json({ success: true, alreadyProcessed: true });
        }

        // Verify teacher exists and is valid
        const [teacher] = await db
          .select()
          .from(users)
          .where(eq(users.id, teacherId))
          .limit(1);

        if (!teacher || teacher.role !== 'Teacher') {
          console.error(`[INDEPENDENT_PAYMENT] ❌ Invalid teacher: ${teacherId}`);
          return res.status(400).json({ error: 'Invalid teacher' });
        }

        // Create activation
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now

        await db.insert(teacherIndependentActivations).values({
          teacherId,
          durationType: 'yearly',
          startDate,
          endDate,
          status: 'active',
          activatedBy: 'self_purchase',
          paymentMethod: 'mtn',
          amountPaid: amountReceived,
          notes: `Paiement MTN Mobile Money confirmé - Order: ${order_id}`
        });

        // Update user's work_mode to hybrid if needed
        if (teacher.workMode === 'school') {
          await db
            .update(users)
            .set({ workMode: 'hybrid' })
            .where(eq(users.id, teacherId));
        }

        console.log(`[INDEPENDENT_PAYMENT] ✅ Activation created for teacher ${teacherId}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('[INDEPENDENT_PAYMENT] ❌ MTN webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
