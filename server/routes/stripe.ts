import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { stripeService, subscriptionPlans } from '../services/stripeService';
import { subscriptionManager } from '../services/subscriptionManager';

const router = Router();

// Only initialize Stripe if the secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}

// Middleware to require authentication (with sandbox bypass)
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    // Check if this is a sandbox test request
    if (req.body?.sandbox && req.body?.userId) {
      console.log('[STRIPE_AUTH] 🧪 Sandbox bypass detected for testing');
      // Create a mock user for sandbox testing using the provided userId
      req.user = {
        id: req.body.userId,
        sandboxMode: true,
        role: 'Parent'
      };
      return next();
    }
    
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: subscriptionPlans
    });
  } catch (error) {
    console.error('[STRIPE_API] Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// Create payment intent
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    const { planId, currency = 'xaf', sandbox = false } = req.body;
    
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }

    // For sandbox testing, use USD and convert price appropriately
    const finalCurrency = sandbox ? 'usd' : currency.toLowerCase();
    
    // XAF is already in smallest unit (1 franc), USD/EUR need *100 for cents
    let finalAmount: number;
    if (sandbox) {
      // Convert XAF to USD for sandbox testing (1 USD ≈ 600 XAF)
      finalAmount = Math.round(plan.price / 600) * 100; // Convert to USD cents
    } else if (finalCurrency === 'xaf') {
      // XAF is already in smallest unit - no conversion needed
      finalAmount = plan.price;
    } else {
      // Other currencies (USD, EUR) need *100 for cents
      finalAmount = plan.price * 100;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: finalCurrency,
      metadata: {
        planId,
        userId: (req.user as any).id,
        sandbox: sandbox ? 'true' : 'false'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('[STRIPE_API] Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// Confirm payment and activate subscription
router.post('/confirm-payment', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = (req.user as any).id;

    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const planId = paymentIntent.metadata.planId;
      
      // Activate subscription using subscription manager
      await subscriptionManager.activateSubscription(userId, planId, paymentIntentId);

      res.json({
        success: true,
        message: 'Payment confirmed and subscription activated',
        subscriptionActive: true
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('[STRIPE_API] Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// Get user subscription status
router.get('/subscription-status', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const status = await subscriptionManager.getSubscriptionStatus(userId);

    res.json({
      success: true,
      subscription: status
    });
  } catch (error) {
    console.error('[STRIPE_API] Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    await subscriptionManager.cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('[STRIPE_API] Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Webhook to handle Stripe events  
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[STRIPE_WEBHOOK] Payment succeeded:', paymentIntent.id);
        // Handle successful payment
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('[STRIPE_WEBHOOK] Payment failed:', failedPayment.id);
        // Handle failed payment
        break;

      default:
        console.log('[STRIPE_WEBHOOK] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK] Error processing webhook:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;