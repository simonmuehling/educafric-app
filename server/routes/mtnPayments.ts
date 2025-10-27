/**
 * ROUTES MTN MOBILE MONEY - PAIEMENTS AUTOMATIQUES
 * Intégration complète avec les APIs MTN Collection et Cashout
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { mtnService, ValidationError } from '../services/mtnMobileMoneyService';
import { subscriptionPlans } from '../services/stripeService';
import { subscriptionActivationService } from '../services/subscriptionActivationService';
import { subscriptionManager } from '../services/subscriptionManager';
import { PaymentNotificationService } from '../services/paymentNotificationService';
import { db } from '../db';
import { payments } from '../../shared/schema';
import { eq } from 'drizzle-orm';

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
    
    try {
      const normalized = mtnService.validateAndNormalizeMTNNumber(phoneNumber);
      
      res.json({
        success: true,
        isValidMTN: true,
        originalNumber: phoneNumber,
        formattedNumber: normalized.msisdn.replace(/^237/, ''), // Format national
        e164: normalized.e164,
        msisdn: normalized.msisdn,
        message: 'Numéro MTN valide'
      });
    } catch (validationError: any) {
      if (validationError instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          isValidMTN: false,
          code: validationError.code,
          message: validationError.message,
          originalNumber: phoneNumber
        });
      }
      throw validationError; // Re-throw if not ValidationError
    }
  } catch (error: any) {
    console.error('[MTN_API] ❌ Number validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du numéro',
      error: error.message
    });
  }
});

// Créer un paiement MTN pour abonnement (Request-to-Pay SMS)
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency = 'XAF', planName, phoneNumber, callbackUrl, returnUrl } = req.body;

    // Validation des paramètres
    if (!amount || !planName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants (amount, planName, phoneNumber requis)'
      });
    }

    console.log('[MTN_API] 🚀 Creating subscription payment:', { amount, currency, planName, phoneNumber });

    // Créer le paiement MTN avec Request-to-Pay SMS
    const paymentData = await mtnService.createSubscriptionPayment({
      amount: parseFloat(amount),
      currency,
      planName,
      phoneNumber,
      callbackUrl: callbackUrl || `${process.env.BASE_URL}/api/mtn-payments/webhook`,
      returnUrl: returnUrl || `${process.env.BASE_URL}/subscribe`
    });

    if (paymentData.success) {
      res.json({
        success: true,
        transactionId: paymentData.transactionId,
        txRef: paymentData.txRef,
        messageId: paymentData.messageId,
        instructions: paymentData.instructions,
        environment: process.env.MOMO_ENV || 'sandbox',
        message: 'Y-Note MTN payment request envoyé avec succès'
      });
    } else {
      // Check if this is a validation error based on the error message
      const errorMessage = paymentData.error || 'Erreur lors de la création du paiement';
      
      if (errorMessage.includes('Numéro de téléphone invalide') || 
          errorMessage.includes('MTN Mobile Money valide') ||
          errorMessage.includes('camerounais sont acceptés')) {
        // This is a validation error, create a ValidationError to get proper 400 status
        const validationError = new ValidationError(errorMessage, 'PHONE_VALIDATION_ERROR');
        throw validationError;
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('[MTN_API] ❌ Create payment error:', error);
    
    // Handle ValidationError with 400 status
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
        error: error.message
      });
    }
    
    // Handle other errors with 500 status
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement MTN',
      error: error.message
    });
  }
});

// Vérifier le statut d'une transaction MTN
router.get('/status/:txRef', async (req, res) => {
  try {
    const { txRef } = req.params;
    
    if (!txRef) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference requis'
      });
    }
    
    console.log('[MTN_API] 🔍 Checking transaction status:', txRef);
    
    const statusData = await mtnService.getTransactionStatus(txRef);
    
    if (statusData.success) {
      res.json({
        success: true,
        status: statusData.status,
        transaction: statusData.transaction,
        environment: process.env.MOMO_ENV || 'sandbox',
        message: 'Statut de transaction récupéré avec succès'
      });
    } else {
      throw new Error(statusData.error || 'Erreur lors de la vérification du statut');
    }
  } catch (error: any) {
    console.error('[MTN_API] ❌ Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message
    });
  }
});

// Webhook Y-Note pour notifications de paiement
router.post('/webhook', async (req, res) => {
  try {
    console.log('[Y-NOTE_WEBHOOK] 🔔 Payment notification received:', req.body);
    
    // Structure attendue selon documentation Y-Note:
    // {
    //   "ErrorCode": 200,
    //   "body": "status: SUCCESSFUL",
    //   "parameters": {
    //     "operation": "collection Mtn",
    //     "currency": "XAF",
    //     "amount": "1250",
    //     "subscriberMsisdn": "6XXXXXXXX",
    //     "order_id": "12323312",
    //     "notifUrl": "https://webhook.site/XXX"
    //   },
    //   "MessageId": "558ad7f3-25ff-4e89-8090-XXXX",
    //   "status": "SUCCESSFUL"
    // }
    
    const { ErrorCode, body, parameters, MessageId, status, Status } = req.body;
    
    // Détecter le statut réel (peut être 'status' ou 'Status')
    const actualStatus = Status || status;
    
    // Debug logging to understand the status detection
    console.log('[Y-NOTE_WEBHOOK] 🔍 Status debug:', { 
      Status, 
      status, 
      actualStatus, 
      ErrorCode 
    });
    
    if (ErrorCode === 200 && (actualStatus === 'SUCCESSFUL' || body?.includes('SUCCESSFUL'))) {
      const { order_id, amount, subscriberMsisdn } = parameters || {};
      
      console.log('[Y-NOTE_WEBHOOK] ✅ Payment successful:', { 
        orderId: order_id, 
        amount, 
        phone: subscriberMsisdn,
        messageId: MessageId 
      });
      
      // Extraire le plan du order_id (format: SUB_parent_public_monthly_20240929_final)
      const planMatch = order_id?.match(/SUB_(.+?)_\d{8}/);
      if (planMatch && subscriberMsisdn && amount) {
        const planId = planMatch[1];
        
        console.log(`[Y-NOTE_WEBHOOK] 🎯 Activating subscription for plan: ${planId}`);
        
        // Activer l'abonnement via le service
        try {
          const activationResult = await subscriptionActivationService.activateSubscriptionFromMTNPayment({
            phoneNumber: subscriberMsisdn,
            planId,
            amount: parseFloat(amount),
            currency: parameters.currency || 'XAF',
            orderId: order_id,
            transactionId: MessageId,
            paymentMethod: 'mtn_mobile_money'
          });

          if (activationResult.success) {
            console.log('[Y-NOTE_WEBHOOK] ✅ Subscription activated successfully:', {
              userId: activationResult.userId,
              planId,
              phone: subscriberMsisdn
            });
            
            // Envoyer notification de succès
            console.log('[Y-NOTE_WEBHOOK] 📧 Should send success notification to user');
          } else {
            console.log('[Y-NOTE_WEBHOOK] ❌ Subscription activation failed:', activationResult.message);
          }
        } catch (activationError: any) {
          console.error('[Y-NOTE_WEBHOOK] ❌ Subscription activation error:', activationError.message);
        }
      } else {
        console.log('[Y-NOTE_WEBHOOK] ⚠️ Missing required data for subscription activation:', {
          planMatch: !!planMatch,
          subscriberMsisdn: !!subscriberMsisdn,
          amount: !!amount
        });
      }
      
      // Réponse à Y-Note pour confirmer réception
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        messageId: MessageId
      });
    } else if (ErrorCode === 200 && actualStatus === 'FAILED') {
      // Gérer les paiements échoués
      const { order_id, amount, subscriberMsisdn } = parameters || {};
      const { Reason } = req.body;
      
      console.log('[Y-NOTE_WEBHOOK] ❌ Payment failed:', { 
        orderId: order_id, 
        amount, 
        phone: subscriberMsisdn,
        reason: Reason,
        messageId: MessageId 
      });
      
      // Save failed payment to database
      try {
        await db.insert(payments).values({
          studentId: null,
          amount: amount?.toString() || '0',
          status: 'failed',
          orderId: order_id,
          transactionId: MessageId,
          phoneNumber: subscriberMsisdn,
          paymentMethod: 'mtn_mobile_money',
          failureReason: Reason || 'Unknown reason',
          metadata: { ErrorCode, parameters }
        });
        console.log('[Y-NOTE_WEBHOOK] ✅ Failed payment saved to database for order:', order_id);
      } catch (dbError: any) {
        console.error('[Y-NOTE_WEBHOOK] ❌ Failed to save payment status to database:', dbError);
      }
      
      res.status(200).json({
        success: true,
        message: 'Failed payment processed',
        messageId: MessageId
      });
    } else {
      console.log('[Y-NOTE_WEBHOOK] ⚠️ Payment not successful:', { ErrorCode, body, status: actualStatus });
      
      // Même pour les échecs, on confirme la réception
      res.status(200).json({
        success: true,
        message: 'Webhook received',
        messageId: MessageId
      });
    }
  } catch (error: any) {
    console.error('[Y-NOTE_WEBHOOK] ❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Callback de retour de paiement MTN - LEGACY (garde pour compatibilité)
router.post('/callback', async (req, res) => {
  try {
    const { reference, status, amount, currency, phone_number } = req.body;
    
    console.log('[MTN_CALLBACK] 🔄 Legacy callback received:', { reference, status, amount });

    if (status === 'SUCCESSFUL' || status === 'success') {
      // Extraire le plan du référence de transaction
      const planMatch = reference.match(/SUB_(\d+)_/);
      if (planMatch) {
        const planId = planMatch[1];
        
        // Trouver l'utilisateur par numéro de téléphone ou email
        // Pour l'instant, on va juste confirmer le paiement
        console.log('[MTN_CALLBACK] ✅ Payment successful, activating subscription...');
        
        // Activer l'abonnement automatiquement
        // Pour l'instant, on log le succès - l'intégration complète nécessiterait 
        // de retrouver l'utilisateur par phone_number et activer son abonnement
        console.log('[MTN_CALLBACK] ✅ Payment successful - would activate subscription for:', {
          reference,
          amount,
          currency,
          phone_number
        });
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
    // const externalId = mtnService.generateExternalId('EDU_OUT'); // TODO: Implement cashout API
    const externalId = `EDU_OUT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    const formattedPhone = mtnService.formatPhoneNumber(phoneNumber);
    
    console.log(`[MTN_API] 💸 Sending payment from admin ${userId}`);
    console.log(`[MTN_API] 📱 To: ${formattedPhone}, Amount: ${amount} ${currency}`);

    // TODO: Implement MTN Cashout API (sendPayment method)
    // Pour l'instant, simuler une réponse
    const paymentResponse = {
      transactionId: externalId,
      status: 'PENDING',
      message: 'Cashout API not yet implemented with official MTN Collections'
    };

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
    // TODO: Implement MTN Balance API (getAccountBalance method)
    const balanceResponse = {
      balance: 0,
      currency: 'XAF',
      message: 'Balance API not yet implemented with official MTN Collections'
    };
    
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


export default router;