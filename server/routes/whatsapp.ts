import { Router } from 'express';
import { whatsappService } from '../services/whatsappService';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await whatsappService.getServiceHealth();
    res.json({
      success: true,
      service: 'WhatsApp Business API',
      status: health.configured ? 'configured' : 'pending_setup',
      ...health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'WhatsApp Business API',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook verification (Meta requirement)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify webhook token
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
    console.log('[WhatsApp] Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('[WhatsApp] Webhook verification failed');
    res.status(403).send('Verification failed');
  }
});

// Webhook endpoint for receiving messages
router.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;
    
    if (entry && entry[0] && entry[0].changes) {
      const changes = entry[0].changes[0];
      
      if (changes.field === 'messages') {
        const { messages, statuses } = changes.value;
        
        // Process incoming messages
        if (messages) {
          for (const message of messages) {
            await whatsappService.handleIncomingMessage(message);
          }
        }
        
        // Process message status updates
        if (statuses) {
          for (const status of statuses) {
            await whatsappService.handleMessageStatus(status);
          }
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('[WhatsApp] Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// Send commercial message (for Commercial Dashboard)
router.post('/send-commercial-message', async (req, res) => {
  try {
    const { phoneNumber, type, data, language = 'fr' } = req.body;
    
    if (!phoneNumber || !type) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message type are required'
      });
    }
    
    const result = await whatsappService.sendCommercialMessage(
      phoneNumber,
      type,
      data,
      language
    );
    
    res.json(result);
  } catch (error) {
    console.error('[WhatsApp] Commercial message error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    });
  }
});

// Send educational notification (for Parent Dashboard)
router.post('/send-education-notification', async (req, res) => {
  try {
    const { phoneNumber, type, data, language = 'fr' } = req.body;
    
    if (!phoneNumber || !type) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and notification type are required'
      });
    }
    
    const result = await whatsappService.sendEducationNotification(
      phoneNumber,
      type,
      data,
      language
    );
    
    res.json(result);
  } catch (error) {
    console.error('[WhatsApp] Education notification error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    });
  }
});

// Verify phone number
router.post('/verify-number', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // In a real implementation, you would send a verification code
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Verification code sent',
      phoneNumber
    });
  } catch (error) {
    console.error('[WhatsApp] Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify phone number'
    });
  }
});

// Get message statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await whatsappService.getMessageStats(
      startDate as string,
      endDate as string
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[WhatsApp] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// Get conversation history
router.get('/conversations/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { limit = 50 } = req.query;
    
    const conversations = await whatsappService.getConversationHistory(
      phoneNumber,
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('[WhatsApp] Conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history'
    });
  }
});

// Register account with certificate/registration code
router.post('/register-account', async (req, res) => {
  try {
    const { phoneNumber, certificate, pin } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!certificate) {
      return res.status(400).json({
        success: false,
        error: 'Certificate/registration code is required'
      });
    }
    
    const result = await whatsappService.registerAccount(
      phoneNumber,
      certificate,
      pin
    );
    
    res.json(result);
  } catch (error) {
    console.error('[WhatsApp] Account registration error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register account'
    });
  }
});

// Request registration code
router.post('/request-code', async (req, res) => {
  try {
    const { phoneNumber, method = 'sms' } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    const result = await whatsappService.requestRegistrationCode(
      phoneNumber,
      method
    );
    
    res.json(result);
  } catch (error) {
    console.error('[WhatsApp] Code request error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request registration code'
    });
  }
});

export default router;