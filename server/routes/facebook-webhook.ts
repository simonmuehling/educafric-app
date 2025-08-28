import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// Token de vérification Facebook - à configurer dans les variables d'environnement
const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'educafric_facebook_webhook_2024';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const CONVERSION_API_TOKEN = process.env.CONVERSION_API_TOKEN || '';

// Log the configuration on startup
console.log('[FACEBOOK_WEBHOOK] Configuration loaded:', {
  hasVerifyToken: !!FACEBOOK_VERIFY_TOKEN,
  verifyToken: FACEBOOK_VERIFY_TOKEN,
  hasAppSecret: !!FACEBOOK_APP_SECRET,
  hasWhatsAppToken: !!WHATSAPP_ACCESS_TOKEN,
  hasConversionToken: !!CONVERSION_API_TOKEN
});

// Endpoint de vérification du webhook Facebook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[FACEBOOK_WEBHOOK] Verification request received:', {
    mode,
    token,
    challenge,
    expectedToken: FACEBOOK_VERIFY_TOKEN,
    fullQuery: req.query
  });

  // Vérifier le mode et le token
  if (mode === 'subscribe' && token === FACEBOOK_VERIFY_TOKEN) {
    console.log('[FACEBOOK_WEBHOOK] ✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('[FACEBOOK_WEBHOOK] ❌ Webhook verification failed:', {
      mode,
      tokenProvided: token,
      tokenExpected: FACEBOOK_VERIFY_TOKEN,
      tokenMatch: token === FACEBOOK_VERIFY_TOKEN
    });
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

// Fonction pour envoyer des événements à l'API Conversions
async function sendConversionEvent(eventName: string, eventData: any) {
  if (!CONVERSION_API_TOKEN) {
    console.warn('[CONVERSION_API] Token not configured, skipping event tracking');
    return;
  }

  try {
    const conversionData = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: 'https://www.educafric.com',
        user_data: {
          client_ip_address: eventData.ip,
          client_user_agent: eventData.userAgent,
          em: eventData.email ? crypto.createHash('sha256').update(eventData.email).digest('hex') : undefined,
          ph: eventData.phone ? crypto.createHash('sha256').update(eventData.phone).digest('hex') : undefined
        },
        custom_data: {
          currency: 'XAF',
          value: eventData.value || 0,
          content_name: eventData.contentName || 'Educafric Platform',
          content_category: eventData.category || 'Education'
        }
      }]
    };

    console.log(`[CONVERSION_API] 📊 Sending ${eventName} event:`, {
      eventName,
      value: eventData.value,
      category: eventData.category
    });

    // Ici, vous pourrez ajouter l'appel HTTP vers l'API Conversions
    // Pour l'instant, on log l'événement pour le développement
    
  } catch (error) {
    console.error('[CONVERSION_API] Error sending conversion event:', error);
  }
}

// Route pour envoyer manuellement des événements de conversion depuis l'application
router.post('/conversion', async (req, res) => {
  try {
    const { eventName, eventData } = req.body;
    
    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    await sendConversionEvent(eventName, eventData || {});
    
    res.json({ 
      success: true, 
      message: `Conversion event '${eventName}' sent successfully` 
    });
    
  } catch (error) {
    console.error('[CONVERSION_API] Error in conversion endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;