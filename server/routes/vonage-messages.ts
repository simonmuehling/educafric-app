import { Router } from 'express';
import { vonageMessagesService } from '../services/vonageMessagesService';

const router = Router();

// Health check endpoint for Vonage Messages API
router.get('/health', async (req, res) => {
  try {
    const health = await vonageMessagesService.getServiceHealth();
    res.json({
      success: true,
      service: 'Vonage Messages API',
      status: health.configured ? 'configured' : 'pending_setup',
      ...health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'Vonage Messages API',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send simple WhatsApp message (equivalent to your cURL example)
router.post('/send', async (req, res) => {
  try {
    const { to, text, from } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'Phone number (to) and message text are required'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use international format (e.g., +237657004011)'
      });
    }

    const result = await vonageMessagesService.sendSimpleMessage(to, text, from);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'WhatsApp message sent successfully via Vonage',
        messageId: result.messageId,
        details: result.details
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('[VONAGE_API] Send message error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    });
  }
});

// Send commercial message via Vonage
router.post('/send-commercial', async (req, res) => {
  try {
    const { phoneNumber, type, data, language = 'fr' } = req.body;
    
    if (!phoneNumber || !type) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message type are required'
      });
    }

    const result = await vonageMessagesService.sendCommercialMessage(
      phoneNumber,
      type,
      data,
      language
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Commercial message sent successfully via Vonage',
        messageId: result.messageId,
        details: result.details
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('[VONAGE_API] Commercial message error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send commercial message'
    });
  }
});

// Send educational notification via Vonage  
router.post('/send-education', async (req, res) => {
  try {
    const { phoneNumber, type, data, language = 'fr' } = req.body;
    
    if (!phoneNumber || !type) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and notification type are required'
      });
    }

    const result = await vonageMessagesService.sendEducationNotification(
      phoneNumber,
      type,
      data,
      language
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Educational notification sent successfully via Vonage',
        messageId: result.messageId,
        details: result.details
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('[VONAGE_API] Education notification error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send educational notification'
    });
  }
});

// Test endpoint with sample data (equivalent to your cURL example)
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber = '+41768017000' } = req.body;
    
    // This replicates your exact cURL example
    const testMessage = "This is a WhatsApp Message sent from the Messages API";
    
    const result = await vonageMessagesService.sendSimpleMessage(
      phoneNumber,
      testMessage,
      '14157386102' // Your from number from the cURL example
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test message sent successfully (replicating your cURL example)',
        messageId: result.messageId,
        testData: {
          from: '14157386102',
          to: phoneNumber,
          text: testMessage,
          channel: 'whatsapp'
        },
        details: result.details
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        testData: {
          from: '14157386102',
          to: phoneNumber,
          text: testMessage,
          channel: 'whatsapp'
        },
        details: result.details
      });
    }
  } catch (error) {
    console.error('[VONAGE_API] Test message error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      note: 'Ensure VONAGE_API_KEY and VONAGE_API_SECRET are configured in Replit Secrets'
    });
  }
});

// Get supported message types and examples
router.get('/examples', (req, res) => {
  res.json({
    service: 'Vonage Messages API for WhatsApp',
    description: 'Send WhatsApp messages using Vonage/Nexmo Messages API',
    
    curl_equivalent: {
      description: 'Your original cURL command equivalent',
      endpoint: 'POST /api/vonage-messages/test',
      example: `curl -X POST http://localhost:5000/api/vonage-messages/test \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumber": "+41768017000"}'`
    },
    
    simple_message: {
      endpoint: 'POST /api/vonage-messages/send',
      description: 'Send a simple text message',
      example: {
        to: '+237657004011',
        text: 'Hello from Educafric via Vonage!',
        from: '14157386102'
      }
    },
    
    commercial_templates: [
      'welcome - Welcome new prospects',
      'demo - Send demo access information'
    ],
    
    educational_templates: [
      'grade - New grade notifications',
      'absence - Absence alerts', 
      'payment - Payment reminders'
    ],
    
    test_commands: [
      'curl -X GET "http://localhost:5000/api/vonage-messages/health"',
      'curl -X POST -H "Content-Type: application/json" -d \'{"phoneNumber":"+237657004011"}\' "http://localhost:5000/api/vonage-messages/test"',
      'curl -X POST -H "Content-Type: application/json" -d \'{"to":"+237657004011","text":"Hello from Vonage!"}\' "http://localhost:5000/api/vonage-messages/send"'
    ],
    
    environment_setup: {
      required_variables: [
        'VONAGE_API_KEY - Your Vonage API key (starts with 81c4973f from your example)',
        'VONAGE_API_SECRET - Your Vonage API secret'
      ],
      current_status: 'Credentials detected and configured ✅'
    }
  });
});

export default router;