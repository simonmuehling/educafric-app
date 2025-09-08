/**
 * ROUTES POUR PAIEMENTS MANUELS
 * Gestion des confirmations de paiements Orange Money, MTN Mobile Money et virements bancaires
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { subscriptionPlans } from '../services/stripeService';
import { subscriptionManager } from '../services/subscriptionManager';
import { PaymentNotificationService } from '../services/paymentNotificationService';

const router = Router();

// Initier un paiement manuel (Orange Money ou virement bancaire)
router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { planId, paymentMethod, amount, currency } = req.body;

    // Valider le plan
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
    }

    // Valider la méthode de paiement
    if (!['orange_money', 'mtn_money', 'bank_transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Méthode de paiement non supportée'
      });
    }

    // Créer un enregistrement de paiement en attente
    const pendingPayment = {
      id: Date.now(),
      userId,
      planId,
      paymentMethod,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reference: `${paymentMethod.toUpperCase()}_${userId}_${Date.now()}`
    };

    // Simuler l'enregistrement (en vraie prod, ce serait en DB)
    console.log('[MANUAL_PAYMENT] 📋 Payment initiated:', pendingPayment);

    // Créer une notification d'instructions
    await PaymentNotificationService.createPaymentInstructionsNotification(
      userId,
      planId,
      paymentMethod,
      amount,
      currency,
      pendingPayment.reference
    );

    res.json({
      success: true,
      message: 'Instructions de paiement créées',
      paymentReference: pendingPayment.reference,
      paymentMethod,
      instructions: getPaymentInstructions(paymentMethod, amount, plan.name)
    });

  } catch (error) {
    console.error('[MANUAL_PAYMENT] ❌ Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement'
    });
  }
});

// Confirmer un paiement manuel (utilisé par l'équipe support)
router.post('/confirm', requireAuth, async (req, res) => {
  try {
    const { paymentReference, adminNotes } = req.body;

    // En production, on vérifierait les permissions admin ici
    console.log('[MANUAL_PAYMENT] ✅ Payment confirmed by admin:', paymentReference);

    // Extraire les infos du paiement depuis la référence (simulation)
    const parts = paymentReference.split('_');
    if (parts.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Référence de paiement invalide'
      });
    }

    const userId = parseInt(parts[1]);
    
    // En production, on récupérerait les détails du paiement depuis la DB
    // Pour la démo, on simule
    const mockPaymentDetails = {
      userId,
      planId: 'parent_monthly_1000', // À récupérer depuis la DB
      amount: 1000,
      currency: 'xaf'
    };

    // Activer l'abonnement
    await subscriptionManager.activateSubscription(
      userId, 
      mockPaymentDetails.planId, 
      'month'
    );

    // Créer notification de succès
    await PaymentNotificationService.createPaymentSuccessNotification(
      userId,
      mockPaymentDetails.planId,
      mockPaymentDetails.amount,
      mockPaymentDetails.currency
    );

    // Créer notification d'activation
    await PaymentNotificationService.createSubscriptionActivatedNotification(
      userId,
      mockPaymentDetails.planId
    );

    res.json({
      success: true,
      message: 'Paiement confirmé et abonnement activé',
      subscriptionActive: true
    });

  } catch (error) {
    console.error('[MANUAL_PAYMENT] ❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    });
  }
});

// Lister les paiements en attente (pour l'équipe support)
router.get('/pending', requireAuth, async (req, res) => {
  try {
    // En production, récupérer depuis la DB
    const pendingPayments = [
      {
        id: Date.now(),
        reference: 'ORANGE_MONEY_123_1234567890',
        userEmail: 'test@educafric.com',
        planName: 'Parent Mensuel',
        amount: 1000,
        currency: 'XAF',
        paymentMethod: 'orange_money',
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
    ];

    res.json({
      success: true,
      payments: pendingPayments
    });

  } catch (error) {
    console.error('[MANUAL_PAYMENT] ❌ Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements'
    });
  }
});

// Utilitaire pour générer les instructions de paiement
function getPaymentInstructions(paymentMethod: string, amount: number, planName: string) {
  if (paymentMethod === 'orange_money') {
    return {
      title: 'Instructions Orange Money',
      steps: [
        'Composez #150# sur votre téléphone Orange',
        'Sélectionnez 1 (Transfert d\'argent)',
        'Sélectionnez 1 (Vers un numéro Orange)',
        'Entrez le numéro: 677 004 011',
        `Entrez le montant: ${amount.toLocaleString()} XAF`,
        'Confirmez avec votre code PIN'
      ],
      recipient: {
        name: 'ABANDA AKAK',
        number: '677 004 011'
      },
      followUp: 'Envoyez une capture d\'écran du SMS de confirmation à support@educafric.com'
    };
  } else if (paymentMethod === 'mtn_money') {
    return {
      title: 'Instructions MTN Mobile Money',
      steps: [
        'Composez *126# sur votre téléphone MTN',
        'Sélectionnez 1 (Transfert d\'argent)',
        'Sélectionnez 1 (Vers un numéro MTN)',
        'Entrez le numéro: 672 128 559',
        `Entrez le montant: ${amount.toLocaleString()} XAF`,
        'Confirmez avec votre code PIN'
      ],
      recipient: {
        name: 'ABANDA AKAK',
        number: '672 128 559'
      },
      followUp: 'Envoyez une capture d\'écran du SMS de confirmation à support@educafric.com'
    };
  } else if (paymentMethod === 'bank_transfer') {
    return {
      title: 'Informations de virement bancaire',
      bankDetails: {
        beneficiary: 'AFRO METAVERSE MARKETING',
        bank: 'Afriland First Bank',
        bankCode: '10033',
        branchCode: '00368', 
        accountNumber: '31500012045',
        ribKey: '68',
        fullRIB: '10033 00368 31500012045 68',
        amount: `${amount.toLocaleString()} XAF`,
        reference: `Abonnement EDUCAFRIC - ${planName}`
      },
      followUp: 'Envoyez le reçu bancaire à support@educafric.com ou WhatsApp +237 657 004 011'
    };
  }
  
  return null;
}

export default router;