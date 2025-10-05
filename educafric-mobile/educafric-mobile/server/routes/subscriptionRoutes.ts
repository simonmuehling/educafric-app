import type { Express } from "express";
import { SubscriptionService } from "../services/subscriptionService";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function registerSubscriptionRoutes(app: Express): void {
  
  /**
   * Obtenir les informations d'abonnement de l'école
   */
  app.get('/api/subscription/info', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const schoolId = req.user.schoolId;
      const subscription = await SubscriptionService.getSchoolSubscription(schoolId);
      const features = await SubscriptionService.getAvailableFeatures(schoolId);

      res.json({
        success: true,
        subscription,
        features,
        isSandbox: SubscriptionService.isSandboxSchool(schoolId)
      });
    } catch (error) {
      console.error('Subscription info error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * Obtenir tous les plans d'abonnement disponibles
   */
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = Object.values(SubscriptionService.SUBSCRIPTION_PLANS)
        .filter(plan => plan.isActive);

      res.json({
        success: true,
        plans,
        freemiumFeatures: SubscriptionService.FREEMIUM_FEATURES
      });
    } catch (error) {
      console.error('Plans fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * Vérifier les limites freemium pour un type de ressource
   */
  app.get('/api/subscription/limits/:resourceType', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { resourceType } = req.params;
      const schoolId = req.user.schoolId;

      // Obtenir le nombre actuel selon le type de ressource
      let currentCount = 0;
      // Vous devriez implémenter la logique pour obtenir le nombre actuel
      // selon le type de ressource depuis votre storage

      const limits = await SubscriptionService.checkFreemiumLimits(schoolId, resourceType, currentCount);

      res.json({
        success: true,
        limits,
        isSandbox: SubscriptionService.isSandboxSchool(schoolId)
      });
    } catch (error) {
      console.error('Limits check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * Créer une session de paiement Stripe pour upgrade
   */
  app.post('/api/subscription/create-upgrade-session', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { planId } = req.body;
      const schoolId = req.user.schoolId;

      if (SubscriptionService.isSandboxSchool(schoolId)) {
        return res.status(400).json({ 
          error: 'Cannot upgrade sandbox school',
          message: 'Les écoles sandbox ne peuvent pas être mises à niveau'
        });
      }

      const plan = SubscriptionService.SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return res.status(400).json({ error: 'Plan not found' });
      }

      // Créer une session Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur', // Convertir XAF en EUR pour Stripe
            product_data: {
              name: plan.name,
              description: `Abonnement ${plan.name} pour Educafric`,
            },
            unit_amount: Math.round(plan.price / 600 * 100), // Conversion approximative XAF vers EUR centimes
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
        cancel_url: `${req.headers.origin}/subscription?canceled=true`,
        metadata: {
          schoolId: schoolId.toString(),
          planId,
          userEmail: req.user.email
        }
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error('Stripe session creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * Webhook Stripe pour confirmer les paiements
   */
  app.post('/api/subscription/stripe-webhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send('Webhook signature verification failed');
      }

      // Gérer l'événement
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const { schoolId, planId } = session.metadata;
          
          // Ici vous devriez mettre à jour l'abonnement dans votre base de données
          console.log(`✅ Payment successful for school ${schoolId}, plan ${planId}`);
          
          // Envoyer notification de confirmation
          // await sendSubscriptionConfirmation(schoolId, planId);
          
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook error' });
    }
  });

  /**
   * Page de statut d'abonnement avec recommandations
   */
  app.get('/api/subscription/status', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const schoolId = req.user.schoolId;
      const subscription = await SubscriptionService.getSchoolSubscription(schoolId);
      const features = await SubscriptionService.getAvailableFeatures(schoolId);

      // Calculer les statistiques d'utilisation
      const usage = {
        students: 0, // À implémenter
        teachers: 0, // À implémenter
        classes: 0,  // À implémenter
        parents: 0   // À implémenter
      };

      // Recommandations d'upgrade
      const recommendations = [];
      
      if (features.isFreemium) {
        if (usage.students > SubscriptionService.FREEMIUM_FEATURES.maxStudents * 0.8) {
          recommendations.push({
            type: 'warning',
            message: 'Vous approchez de la limite d\'élèves en mode freemium',
            action: 'Passez en premium pour plus d\'élèves'
          });
        }
        
        recommendations.push({
          type: 'info',
          message: 'Débloquez toutes les fonctionnalités avec un abonnement premium',
          action: 'Voir les plans premium'
        });
      }

      res.json({
        success: true,
        subscription,
        features,
        usage,
        recommendations,
        isSandbox: SubscriptionService.isSandboxSchool(schoolId)
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  console.log('✅ [SUBSCRIPTION] Subscription routes registered successfully');
}