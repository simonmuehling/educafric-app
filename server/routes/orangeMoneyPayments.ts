/**
 * Routes Orange Money Cameroun
 * API PayNote pour paiements mobile Orange Money
 */

import { Router, Request, Response } from 'express';
import { orangeMoneyService } from '../services/orangeMoneyService';
import { db } from '../db';
import { payments } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/status', (req: Request, res: Response) => {
  const isEnabled = orangeMoneyService.isServiceEnabled();
  res.json({
    service: 'Orange Money Cameroun',
    provider: 'PayNote',
    enabled: isEnabled,
    status: isEnabled ? 'active' : 'disabled',
    message: isEnabled 
      ? 'Service Orange Money opérationnel' 
      : 'Service Orange Money non configuré - credentials manquants'
  });
});

router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, description, userId, paymentType, metadata } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Numéro de téléphone et montant requis'
      });
    }

    const result = await orangeMoneyService.initiatePayment({
      phoneNumber,
      amount: parseInt(amount, 10),
      description: description || 'Paiement Educafric',
      metadata: {
        userId,
        paymentType,
        ...metadata
      }
    });

    if (result.success) {
      try {
        await db.insert(payments).values({
          studentId: userId || null,
          amount: amount.toString(),
          paymentMethod: 'orange_money',
          orderId: result.orderId,
          transactionId: result.transactionId,
          phoneNumber: phoneNumber,
          status: 'pending',
          metadata: {
            payToken: result.payToken,
            paymentType,
            provider: 'paynote',
            currency: 'XAF',
            ...metadata
          }
        });
      } catch (dbError) {
        console.error('[ORANGE_MONEY] Database insert error:', dbError);
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error('[ORANGE_MONEY] Initiate error:', error);
    
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'initiation du paiement Orange Money'
    });
  }
});

router.get('/check/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID requis'
      });
    }

    const result = await orangeMoneyService.checkPaymentStatus(orderId);

    if (result.status === 'SUCCESSFULL') {
      try {
        await db.update(payments)
          .set({ status: 'completed' })
          .where(eq(payments.orderId, orderId));
      } catch (dbError) {
        console.error('[ORANGE_MONEY] Database update error:', dbError);
      }
    }

    res.json({
      success: result.status === 'SUCCESSFULL',
      ...result
    });
  } catch (error: any) {
    console.error('[ORANGE_MONEY] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('[ORANGE_MONEY] Webhook received:', JSON.stringify(req.body));

    const signature = req.headers['x-signature'] as string || '';
    
    const result = await orangeMoneyService.processWebhook(req.body);

    if (result.success && result.orderId) {
      try {
        await db.update(payments)
          .set({ 
            status: 'completed',
            transactionId: result.transactionId
          })
          .where(eq(payments.orderId, result.orderId));
        
        console.log(`[ORANGE_MONEY] ✅ Payment ${result.orderId} marked as completed`);
      } catch (dbError) {
        console.error('[ORANGE_MONEY] Database update error:', dbError);
      }
    } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
      try {
        await db.update(payments)
          .set({ 
            status: 'failed',
            failureReason: result.status
          })
          .where(eq(payments.orderId, result.orderId));
      } catch (dbError) {
        console.error('[ORANGE_MONEY] Database update error:', dbError);
      }
    }

    res.status(200).json({ received: true, processed: result.success });
  } catch (error: any) {
    console.error('[ORANGE_MONEY] Webhook error:', error);
    res.status(200).json({ received: true, error: error.message });
  }
});

router.post('/validate-phone', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      valid: false,
      error: 'Numéro de téléphone requis'
    });
  }

  const result = orangeMoneyService.validatePhoneNumber(phoneNumber);
  res.json(result);
});

export default router;
