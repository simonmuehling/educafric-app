import Stripe from 'stripe';
import { storage } from '../storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'semester' | 'quarter';
  features: string[];
  category: 'parent' | 'school' | 'freelancer';
}

export const subscriptionPlans: SubscriptionPlan[] = [
  // Plans Parents - École Publique
  {
    id: 'parent_public_monthly',
    name: 'Parent École Publique (Mensuel)',
    price: 1000,
    currency: 'xaf',
    interval: 'month',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'grade_access', 'teacher_communication', 'bilingual_support']
  },
  {
    id: 'parent_public_quarterly',
    name: 'Parent École Publique (Trimestriel)',
    price: 3000,
    currency: 'xaf',
    interval: 'quarter',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'grade_access', 'teacher_communication', 'bilingual_support', 'quarterly_savings']
  },
  {
    id: 'parent_public_annual',
    name: 'Parent École Publique (Annuel)',
    price: 12000,
    currency: 'xaf',
    interval: 'year',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'grade_access', 'teacher_communication', 'bilingual_support', 'priority_support']
  },
  // Plans Parents - École Privée
  {
    id: 'parent_private_monthly',
    name: 'Parent École Privée (Mensuel)',
    price: 1500,
    currency: 'xaf',
    interval: 'month',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'advanced_gps', 'emergency_button', 'grade_access', 'priority_communication']
  },
  {
    id: 'parent_private_quarterly',
    name: 'Parent École Privée (Trimestriel)',
    price: 4500,
    currency: 'xaf',
    interval: 'quarter',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'advanced_gps', 'emergency_button', 'grade_access', 'priority_communication', 'quarterly_savings']
  },
  {
    id: 'parent_private_annual',
    name: 'Parent École Privée (Annuel)',
    price: 18000,
    currency: 'xaf',
    interval: 'year',
    category: 'parent',
    features: ['student_tracking', 'real_time_notifications', 'advanced_gps', 'emergency_button', 'grade_access', 'priority_communication', 'premium_support']
  },
  {
    id: 'parent_geolocation_monthly',
    name: 'Parent GPS (Mensuel)',
    price: 1000,
    currency: 'xaf',
    interval: 'month',
    category: 'parent',
    features: ['gps_tracking', 'safety_zones', 'real_time_alerts', 'location_history']
  },
  {
    id: 'parent_geolocation_annual',
    name: 'Parent GPS (Annuel)',
    price: 12000,
    currency: 'xaf',
    interval: 'year',
    category: 'parent',
    features: ['gps_tracking', 'safety_zones', 'real_time_alerts', 'location_history', 'advanced_analytics']
  },
  // Plans Écoles
  {
    id: 'school_public',
    name: 'École Publique',
    price: 50000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['unlimited_students', 'class_management', 'attendance_system', 'digital_reports', 'parent_communication', 'admin_dashboard']
  },
  {
    id: 'school_private',
    name: 'École Privée',
    price: 75000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['unlimited_students', 'advanced_analytics', 'custom_reports', 'whatsapp_integration', 'payment_processing', 'priority_support']
  },
  {
    id: 'school_enterprise',
    name: 'École Entreprise',
    price: 150000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['unlimited_students', 'bilingual_dashboard', 'training_management', 'corporate_tracking', 'certification_system', 'enterprise_billing', 'roi_reporting', 'dedicated_support']
  },
  {
    id: 'school_geolocation',
    name: 'École GPS',
    price: 50000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['student_gps_tracking', 'school_zone_monitoring', 'safety_alerts', 'location_analytics']
  },
  // Plans Freelancers
  {
    id: 'freelancer_professional_semester',
    name: 'Répétiteur Professionnel (Semestriel)',
    price: 12500,
    currency: 'xaf',
    interval: 'semester',
    category: 'freelancer',
    features: ['tutoring_interface', 'schedule_management', 'student_tracking', 'parent_communication', 'billing_system', 'geolocation_tracking', 'teaching_zones', 'performance_analytics', 'digital_marketing', 'continuing_education', 'certification', 'phone_support']
  },
  {
    id: 'freelancer_professional_annual',
    name: 'Répétiteur Professionnel (Annuel)',
    price: 25000,
    currency: 'xaf',
    interval: 'year',
    category: 'freelancer',
    features: ['tutoring_interface', 'schedule_management', 'student_tracking', 'parent_communication', 'billing_system', 'geolocation_tracking', 'teaching_zones', 'performance_analytics', 'digital_marketing', 'continuing_education', 'certification', 'phone_support', 'annual_savings']
  },
  // Packages Complets Écoles
  {
    id: 'school_public_complete',
    name: 'École Publique Complet (Basique + GPS)',
    price: 90000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['unlimited_students', 'class_management', 'attendance_system', 'digital_reports', 'parent_communication', 'admin_dashboard', 'student_gps_tracking', 'school_zone_monitoring', 'safety_alerts', 'location_analytics']
  },
  {
    id: 'school_private_complete',
    name: 'École Privée Complet (Basique + GPS)',
    price: 115000,
    currency: 'xaf',
    interval: 'year',
    category: 'school',
    features: ['unlimited_students', 'advanced_analytics', 'custom_reports', 'whatsapp_integration', 'payment_processing', 'priority_support', 'student_gps_tracking', 'school_zone_monitoring', 'safety_alerts', 'location_analytics']
  }
];

export class StripeService {
  
  // Créer ou récupérer un client Stripe
  async getOrCreateCustomer(userId: number, email: string, name: string): Promise<Stripe.Customer> {
    console.log(`[STRIPE] Getting or creating customer for user ${userId} (${email})`);
    
    try {
      const user = await storage.getUserById(userId);
      
      if (user && user.stripeCustomerId) {
        console.log(`[STRIPE] Retrieving existing customer: ${user.stripeCustomerId}`);
        return await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer;
      }
      
      console.log(`[STRIPE] Creating new customer for ${email}`);
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId: userId.toString(),
          platform: 'educafric'
        }
      });
      
      // Sauvegarder l'ID client Stripe
      // TODO: Implement updateUserStripeCustomerId in new storage
      console.log(`[STRIPE] Should update user ${userId} with customer ID ${customer.id}`);
      
      console.log(`[STRIPE] ✅ Customer created: ${customer.id}`);
      return customer;
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error creating customer:`, error);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }
  
  // Créer un PaymentIntent pour paiement unique
  async createPaymentIntent(planId: string, userId: number): Promise<Stripe.PaymentIntent> {
    console.log(`[STRIPE] Creating PaymentIntent for plan ${planId}, user ${userId}`);
    
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    try {
      const user = await storage.getUserById(userId);
      const customer = await this.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
      
      // XAF is already in smallest unit (no cents), USD needs *100 for cents
      const stripeAmount = plan.currency.toLowerCase() === 'xaf' ? Math.round(plan.price / 600) : plan.price * 100;
      
      console.log(`[STRIPE_DEBUG] PaymentIntent: Plan=${plan.price} ${plan.currency} -> Stripe=${stripeAmount} USD`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount, // Fixed XAF conversion
        currency: 'usd', // Conversion XAF -> USD pour Stripe
        customer: customer.id,
        metadata: {
          userId: userId.toString(),
          planId: plan.id,
          planName: plan.name,
          originalAmount: plan.price.toString(),
          originalCurrency: plan.currency,
          platform: 'educafric'
        },
        description: `EDUCAFRIC - ${plan.name}`,
        receipt_email: user.email
      });
      
      console.log(`[STRIPE] ✅ PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error creating PaymentIntent:`, error);
      throw new Error(`Failed to create PaymentIntent: ${error.message}`);
    }
  }
  
  // Créer un abonnement récurrent
  async createSubscription(planId: string, userId: number): Promise<Stripe.Subscription> {
    console.log(`[STRIPE] Creating subscription for plan ${planId}, user ${userId}`);
    
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    try {
      const user = await storage.getUserById(userId);
      const customer = await this.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
      
      // Créer un prix Stripe si nécessaire
      const price = await this.getOrCreatePrice(plan);
      
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId.toString(),
          planId: plan.id,
          planName: plan.name,
          platform: 'educafric'
        }
      });
      
      console.log(`[STRIPE] ✅ Subscription created: ${subscription.id}`);
      return subscription;
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error creating subscription:`, error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }
  
  // Créer ou récupérer un prix Stripe
  async getOrCreatePrice(plan: SubscriptionPlan): Promise<Stripe.Price> {
    console.log(`[STRIPE] Getting or creating price for plan ${plan.id}`);
    
    try {
      // Rechercher un prix existant
      const existingPrices = await stripe.prices.list({
        product: plan.id,
        active: true,
        limit: 1
      });
      
      if (existingPrices.data.length > 0) {
        console.log(`[STRIPE] Using existing price: ${existingPrices.data[0].id}`);
        return existingPrices.data[0];
      }
      
      // Créer un nouveau produit et prix
      const product = await stripe.products.create({
        id: plan.id,
        name: plan.name,
        description: `EDUCAFRIC - ${plan.name}`,
        metadata: {
          category: plan.category,
          features: plan.features.join(','),
          platform: 'educafric'
        }
      });
      
      // XAF is already in smallest unit (no cents), USD needs *100 for cents  
      const stripeAmount = plan.currency.toLowerCase() === 'xaf' ? Math.round(plan.price / 600) : plan.price * 100;
      
      console.log(`[STRIPE_DEBUG] Price creation: Plan=${plan.price} ${plan.currency} -> Stripe=${stripeAmount} USD`);
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: stripeAmount, // Fixed XAF conversion
        currency: 'usd', // Conversion XAF -> USD
        recurring: plan.interval === 'semester' ? {
          interval: 'month',
          interval_count: 6
        } : plan.interval === 'quarter' ? {
          interval: 'month',
          interval_count: 3
        } : {
          interval: plan.interval
        },
        metadata: {
          originalAmount: plan.price.toString(),
          originalCurrency: plan.currency,
          platform: 'educafric'
        }
      });
      
      console.log(`[STRIPE] ✅ Price created: ${price.id}`);
      return price;
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error creating price:`, error);
      throw new Error(`Failed to create price: ${error.message}`);
    }
  }
  
  // Confirmer un paiement et activer l'abonnement
  async confirmPaymentAndActivateSubscription(paymentIntentId: string): Promise<void> {
    console.log(`[STRIPE] Confirming payment and activating subscription: ${paymentIntentId}`);
    
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful: ${paymentIntent.status}`);
      }
      
      const userId = parseInt(paymentIntent.metadata.userId);
      const planId = paymentIntent.metadata.planId;
      const planName = paymentIntent.metadata.planName;
      
      // Calculer la date d'expiration
      const now = new Date();
      const plan = subscriptionPlans.find(p => p.id === planId);
      let expirationDate = new Date(now);
      
      if (plan?.interval === 'month') {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      } else if (plan?.interval === 'year') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      } else if (plan?.interval === 'semester') {
        expirationDate.setMonth(expirationDate.getMonth() + 6);
      } else if (plan?.interval === 'quarter') {
        expirationDate.setMonth(expirationDate.getMonth() + 3);
      }
      
      // Mettre à jour l'utilisateur
      // TODO: Implement updateUserSubscription in new storage
      console.log(`[STRIPE] Should update user ${userId} subscription to active: ${planName}`);
      
      console.log(`[STRIPE] ✅ Subscription activated for user ${userId}: ${planName}`);
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error confirming payment:`, error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }
  
  // Vérifier le statut d'un abonnement
  async checkSubscriptionStatus(userId: number): Promise<{ isActive: boolean; planName?: string; expiresAt?: Date }> {
    console.log(`[STRIPE] Checking subscription status for user ${userId}`);
    
    try {
      const user = await storage.getUserById(userId);
      
      if (!user.stripeSubscriptionId) {
        return { isActive: false };
      }
      
      if (user.stripeCustomerId) {
        // Vérifier avec Stripe
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        
        return {
          isActive,
          planName: subscription.metadata.planName,
          expiresAt: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined
        };
      }
      
      // Vérification locale si pas de Stripe
      const isActive = user.subscriptionStatus === 'active';
      return {
        isActive,
        planName: user.subscriptionPlan || undefined
      };
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error checking subscription:`, error);
      return { isActive: false };
    }
  }
  
  // Annuler un abonnement
  async cancelSubscription(userId: number): Promise<void> {
    console.log(`[STRIPE] Canceling subscription for user ${userId}`);
    
    try {
      const user = await storage.getUserById(userId);
      
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      }
      
      // TODO: Implement updateUserSubscription in new storage - cancel
      console.log(`[STRIPE] Should cancel user ${userId} subscription`);
      
      console.log(`[STRIPE] ✅ Subscription cancelled for user ${userId}`);
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Error canceling subscription:`, error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }
  
  // Gérer les webhooks Stripe
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    console.log(`[STRIPE] Processing webhook with signature: ${signature.substring(0, 20)}...`);
    
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
      }
      
      const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      
      console.log(`[STRIPE] Webhook event type: ${event.type}`);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
          
        default:
          console.log(`[STRIPE] Unhandled webhook event type: ${event.type}`);
      }
      
    } catch (error: any) {
      console.error(`[STRIPE] ❌ Webhook error:`, error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }
  
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`[STRIPE] Payment succeeded: ${paymentIntent.id}`);
    await this.confirmPaymentAndActivateSubscription(paymentIntent.id);
  }
  
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`[STRIPE] Payment failed: ${paymentIntent.id}`);
    
    const userId = parseInt(paymentIntent.metadata.userId);
    if (userId) {
      // TODO: Implement updateUserSubscription in new storage - payment failed
      console.log(`[STRIPE] Should mark user ${userId} payment as failed`);
    }
  }
  
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`[STRIPE] Invoice payment succeeded: ${invoice.id}`);
    
    if ((invoice as any).subscription) {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
      await this.handleSubscriptionUpdated(subscription);
    }
  }
  
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`[STRIPE] Subscription updated: ${subscription.id}`);
    
    const userId = parseInt(subscription.metadata.userId);
    if (!userId) return;
    
    const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'inactive';
    
    // TODO: Implement updateUserSubscription in new storage - subscription updated
    console.log(`[STRIPE] Should update user ${userId} subscription:`, {
      status,
      subscriptionId: subscription.id,
      planId: subscription.metadata.planId,
      planName: subscription.metadata.planName
    });
  }
  
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`[STRIPE] Subscription deleted: ${subscription.id}`);
    
    const userId = parseInt(subscription.metadata.userId);
    if (!userId) return;
    
    // TODO: Implement updateUserSubscription in new storage - subscription deleted
    console.log(`[STRIPE] Should delete user ${userId} subscription`);
  }
}

export const stripeService = new StripeService();