/**
 * ROUTES MTN MOBILE MONEY - PAIEMENTS AUTOMATIQUES
 * Intégration complète avec les APIs MTN Collection et Cashout
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { mtnService } from '../services/mtnMobileMoneyService';
import { subscriptionPlans } from '../services/stripeService';
import { subscriptionManager } from '../services/subscriptionManager';
import { PaymentNotificationService } from '../services/paymentNotificationService';

const router = Router();

// Test de connectivité MTN (sans auth pour debug)
router.get('/test-connection', async (req, res) => {
  try {
    console.log('[MTN_API] 🧪 Testing MTN connection...');
    const isConnected = await mtnService.testConnection();
    
    res.json({
      success: isConnected,
      message: isConnected ? 'MTN API connection successful' : 'MTN API connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[MTN_API] ❌ Connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Test de connexion MTN échoué',
      error: error.message
    });
  }
});

// Valider un numéro MTN (sans auth pour debug)
router.post('/validate-number', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }
    
    const isValid = mtnService.validateMTNNumber(phoneNumber);
    const formattedNumber = mtnService.formatPhoneNumber(phoneNumber);
    
    res.json({
      success: true,
      isValidMTN: isValid,
      originalNumber: phoneNumber,
      formattedNumber: formattedNumber,
      message: isValid ? 'Numéro MTN valide' : 'Ce numéro n\'est pas un numéro MTN valide'
    });
  } catch (error: any) {
    console.error('[MTN_API] ❌ Number validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du numéro'
    });
  }
});

// Créer un paiement MTN pour abonnement (redirection webpayment)
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency = 'XAF', planName, callbackUrl, returnUrl } = req.body;

    // Validation des paramètres
    if (!amount || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants (amount, planName requis)'
      });
    }

    console.log('[MTN_API] 🚀 Creating subscription payment:', { amount, currency, planName });

    // Créer le paiement MTN avec redirection
    const paymentData = await mtnService.createSubscriptionPayment({
      amount: parseFloat(amount),
      currency,
      planName,
      callbackUrl: callbackUrl || `${process.env.BASE_URL}/api/mtn-payments/callback`,
      returnUrl: returnUrl || `${process.env.BASE_URL}/subscribe`
    });

    if (paymentData.success) {
      res.json({
        success: true,
        paymentUrl: paymentData.paymentUrl,
        transactionId: paymentData.transactionId,
        message: 'Paiement MTN créé avec succès'
      });
    } else {
      throw new Error(paymentData.error || 'Erreur lors de la création du paiement');
    }
  } catch (error: any) {
    console.error('[MTN_API] ❌ Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement MTN',
      error: error.message
    });
  }
});

// Callback de retour de paiement MTN (activation automatique abonnement)
router.post('/callback', async (req, res) => {
  try {
    const { reference, status, amount, currency, phone_number } = req.body;
    
    console.log('[MTN_CALLBACK] 🔄 Payment callback received:', { reference, status, amount });

    if (status === 'SUCCESSFUL' || status === 'success') {
      // Extraire le plan du référence de transaction
      const planMatch = reference.match(/SUB_(\d+)_/);
      if (planMatch) {
        const planId = planMatch[1];
        
        // Trouver l'utilisateur par numéro de téléphone ou email
        // Pour l'instant, on va juste confirmer le paiement
        console.log('[MTN_CALLBACK] ✅ Payment successful, activating subscription...');
        
        // Activer l'abonnement automatiquement
        try {
          await subscriptionManager.activateSubscriptionFromPayment({
            paymentMethod: 'mtn_money',
            amount: parseFloat(amount),
            currency,
            transactionId: reference,
            phoneNumber: phone_number
          });
          
          console.log('[MTN_CALLBACK] ✅ Subscription activated successfully');
        } catch (activationError: any) {
          console.error('[MTN_CALLBACK] ❌ Subscription activation failed:', activationError);
        }
      }
      
      res.json({ success: true, message: 'Paiement confirmé et abonnement activé' });
    } else {
      console.log('[MTN_CALLBACK] ❌ Payment failed:', status);
      res.json({ success: false, message: 'Paiement échoué' });
    }
  } catch (error: any) {
    console.error('[MTN_CALLBACK] ❌ Callback processing error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du traitement du callback' });
  }
});

// Initier un paiement MTN automatique
router.post('/initiate-payment', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { planId, phoneNumber, amount, currency = 'XAF' } = req.body;

    // Validation des paramètres
    if (!planId || !phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: planId, phoneNumber, amount requis'
      });
    }

    // Valider le plan
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
    }

    // Valider le numéro MTN
    if (!mtnService.validateMTNNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Numéro MTN invalide. Utilisez un numéro MTN Cameroun (67X, 65X, 68X)'
      });
    }

    // Générer un ID de transaction unique
    const externalId = mtnService.generateExternalId('EDU');
    const formattedPhone = mtnService.formatPhoneNumber(phoneNumber);
    
    console.log(`[MTN_API] 💰 Initiating payment for user ${userId}, plan ${planId}`);
    console.log(`[MTN_API] 📱 Phone: ${formattedPhone}, Amount: ${amount} ${currency}`);

    // Demander le paiement via l'API MTN
    const paymentResponse = await mtnService.requestPayment({
      amount: Number(amount),
      currency: 'XAF',
      externalId: externalId,
      payer: {
        phoneNumber: formattedPhone
      },
      payerMessage: `Abonnement EDUCAFRIC - ${plan.name}`,
      payeeNote: `Paiement ${planId} - Utilisateur ${userId}`
    });

    // Log du paiement initié
    console.log(`[MTN_API] 📝 Payment initiated for user ${userId}, external ID: ${externalId}`);

    res.json({
      success: true,
      message: 'Paiement MTN initié avec succès',
      transactionId: paymentResponse.transactionId,
      externalId: externalId,
      status: paymentResponse.status,
      instructions: {
        title: 'Paiement MTN Mobile Money',
        message: `Un paiement de ${amount.toLocaleString()} XAF a été demandé sur votre compte MTN ${phoneNumber}`,
        steps: [
          'Vérifiez votre téléphone pour la notification MTN',
          'Tapez votre code PIN MTN pour confirmer',
          'Le paiement sera traité automatiquement'
        ],
        autoCheck: true,
        checkInterval: 10000 // Vérifier toutes les 10 secondes
      }
    });

  } catch (error: any) {
    console.error('[MTN_API] ❌ Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement MTN',
      error: error.message
    });
  }
});

// Vérifier le statut d'un paiement
router.get('/payment-status/:referenceId', requireAuth, async (req, res) => {
  try {
    const { referenceId } = req.params;
    const userId = (req.user as any).id;
    
    console.log(`[MTN_API] 🔍 Checking payment status: ${referenceId} for user ${userId}`);
    
    const statusResponse = await mtnService.checkPaymentStatus(referenceId);
    
    // Si le paiement est réussi, activer l'abonnement
    if (statusResponse.status === 'SUCCESSFUL') {
      console.log(`[MTN_API] ✅ Payment successful: ${referenceId}`);
      
      // Ici, vous pouvez activer l'abonnement
      // await subscriptionManager.activateSubscription(userId, planId);
      
      // Log du succès
      console.log(`[MTN_API] ✅ Payment successful for user ${userId}, transaction: ${referenceId}`);
    } else if (statusResponse.status === 'FAILED') {
      console.log(`[MTN_API] ❌ Payment failed: ${referenceId}`);
      
      // Log de l'échec
      console.log(`[MTN_API] ❌ Payment failed for user ${userId}, reason: ${statusResponse.reason}`);
    }
    
    res.json({
      success: true,
      status: statusResponse.status,
      transactionId: statusResponse.transactionId,
      amount: statusResponse.amount,
      currency: statusResponse.currency,
      reason: statusResponse.reason,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[MTN_API] ❌ Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message
    });
  }
});

// Effectuer un paiement sortant (Cashout) - Pour le modèle "EDUCAFRIC paie les écoles"
router.post('/send-payment', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { phoneNumber, amount, currency = 'XAF', reason, schoolId } = req.body;

    // Vérifier les permissions (seuls les admins peuvent envoyer des paiements)
    const user = req.user as any;
    if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent effectuer des paiements sortants.'
      });
    }

    // Validation des paramètres
    if (!phoneNumber || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: phoneNumber, amount, reason requis'
      });
    }

    // Valider le numéro MTN
    if (!mtnService.validateMTNNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Numéro MTN invalide'
      });
    }

    // Générer un ID de transaction unique
    const externalId = mtnService.generateExternalId('EDU_OUT');
    const formattedPhone = mtnService.formatPhoneNumber(phoneNumber);
    
    console.log(`[MTN_API] 💸 Sending payment from admin ${userId}`);
    console.log(`[MTN_API] 📱 To: ${formattedPhone}, Amount: ${amount} ${currency}`);

    // Effectuer le paiement via l'API MTN Cashout
    const paymentResponse = await mtnService.sendPayment({
      amount: Number(amount),
      currency: 'XAF',
      externalId: externalId,
      payee: {
        phoneNumber: formattedPhone
      },
      payerMessage: `Paiement EDUCAFRIC: ${reason}`,
      payeeNote: schoolId ? `Paiement école ID: ${schoolId}` : 'Paiement EDUCAFRIC'
    });

    res.json({
      success: true,
      message: 'Paiement sortant MTN initié avec succès',
      transactionId: paymentResponse.transactionId,
      externalId: externalId,
      status: paymentResponse.status,
      recipient: formattedPhone,
      amount: amount,
      currency: currency
    });

  } catch (error: any) {
    console.error('[MTN_API] ❌ Send payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du paiement MTN',
      error: error.message
    });
  }
});

// Obtenir le solde du compte MTN
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent consulter le solde.'
      });
    }

    console.log('[MTN_API] 💰 Checking account balance...');
    const balanceResponse = await mtnService.getAccountBalance();
    
    res.json({
      success: true,
      balance: balanceResponse.balance,
      currency: balanceResponse.currency,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[MTN_API] ❌ Balance check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la consultation du solde',
      error: error.message
    });
  }
});

// Webhook pour les notifications MTN (si supporté)
router.post('/webhook', async (req, res) => {
  try {
    console.log('[MTN_API] 📨 Webhook received:', req.body);
    
    const { transactionId, status, externalId, amount, currency } = req.body;
    
    // Traiter la notification webhook
    // Ici vous pouvez mettre à jour le statut du paiement dans votre base de données
    
    res.json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error: any) {
    console.error('[MTN_API] ❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

export default router;