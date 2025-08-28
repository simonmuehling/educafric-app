import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// Token de vérification Facebook - à configurer dans les variables d'environnement
const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'educafric_facebook_webhook_2024';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

// Endpoint de vérification du webhook Facebook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[FACEBOOK_WEBHOOK] Verification request received:', {
    mode,
    token: token ? 'provided' : 'missing',
    challenge: challenge ? 'provided' : 'missing'
  });

  // Vérifier le mode et le token
  if (mode === 'subscribe' && token === FACEBOOK_VERIFY_TOKEN) {
    console.log('[FACEBOOK_WEBHOOK] ✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('[FACEBOOK_WEBHOOK] ❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Fonction pour vérifier la signature Facebook
function verifyRequestSignature(req: any, res: any, buf: Buffer) {
  if (!FACEBOOK_APP_SECRET) {
    console.warn('[FACEBOOK_WEBHOOK] No app secret configured, skipping signature verification');
    return;
  }

  const signature = req.get('X-Hub-Signature-256');
  if (!signature) {
    console.error('[FACEBOOK_WEBHOOK] No signature provided');
    throw new Error('No signature provided');
  }

  const expectedSignature = crypto
    .createHmac('sha256', FACEBOOK_APP_SECRET)
    .update(buf)
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    console.error('[FACEBOOK_WEBHOOK] Invalid signature');
    throw new Error('Invalid signature');
  }
}

// Endpoint pour recevoir les événements Facebook
router.post('/webhook', (req, res) => {
  try {
    console.log('[FACEBOOK_WEBHOOK] Event received:', JSON.stringify(req.body, null, 2));

    const body = req.body;

    // Vérifier que c'est un événement de page
    if (body.object === 'page') {
      body.entry?.forEach((entry: any) => {
        // Traiter les événements de messages
        if (entry.messaging) {
          entry.messaging.forEach((event: any) => {
            handleMessagingEvent(event);
          });
        }

        // Traiter les changements de statut des messages
        if (entry.changes) {
          entry.changes.forEach((change: any) => {
            handleStatusChange(change);
          });
        }
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('[FACEBOOK_WEBHOOK] Unknown object type:', body.object);
      res.status(404).send('Unknown object type');
    }
  } catch (error: any) {
    console.error('[FACEBOOK_WEBHOOK] Error processing event:', error);
    res.status(500).send('Internal server error');
  }
});

// Gérer les événements de messages
function handleMessagingEvent(event: any) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const timestamp = event.timestamp;

  console.log(`[FACEBOOK_WEBHOOK] Message event from ${senderId} to ${recipientId} at ${timestamp}`);

  if (event.message) {
    handleMessage(event.message, senderId, timestamp);
  }

  if (event.delivery) {
    handleDeliveryConfirmation(event.delivery, senderId);
  }

  if (event.read) {
    handleMessageRead(event.read, senderId);
  }
}

// Gérer les messages entrants
function handleMessage(message: any, senderId: string, timestamp: number) {
  const messageText = message.text;
  const messageId = message.mid;

  console.log(`[FACEBOOK_WEBHOOK] 📨 New message from ${senderId}: "${messageText}" (ID: ${messageId})`);

  // Ici vous pouvez ajouter la logique pour:
  // 1. Sauvegarder le message dans la base de données
  // 2. Notifier les utilisateurs concernés
  // 3. Déclencher des réponses automatiques si nécessaire
  
  // Exemple de réponse automatique pour les messages Educafric
  if (messageText && messageText.toLowerCase().includes('educafric')) {
    console.log('[FACEBOOK_WEBHOOK] 🤖 Educafric keyword detected, potential auto-response trigger');
    // Implémenter la logique de réponse automatique ici
  }
}

// Gérer les confirmations de livraison
function handleDeliveryConfirmation(delivery: any, senderId: string) {
  const messageIds = delivery.mids;
  const watermark = delivery.watermark;

  console.log(`[FACEBOOK_WEBHOOK] ✅ Message delivery confirmed from ${senderId}:`, {
    messageIds,
    watermark: new Date(watermark).toISOString()
  });

  // Mettre à jour le statut des messages dans la base de données
}

// Gérer les confirmations de lecture
function handleMessageRead(read: any, senderId: string) {
  const watermark = read.watermark;

  console.log(`[FACEBOOK_WEBHOOK] 👁️ Message read confirmation from ${senderId}:`, {
    watermark: new Date(watermark).toISOString()
  });

  // Mettre à jour le statut des messages dans la base de données
}

// Gérer les changements de statut
function handleStatusChange(change: any) {
  console.log('[FACEBOOK_WEBHOOK] 🔄 Status change:', change);
  
  // Traiter les changements de statut des messages
  if (change.field === 'messages') {
    console.log('[FACEBOOK_WEBHOOK] Message status change detected');
  }
}

export default router;