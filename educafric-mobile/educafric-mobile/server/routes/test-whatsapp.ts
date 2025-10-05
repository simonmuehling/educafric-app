import { Router } from 'express';
import { whatsappService } from '../services/whatsappService';

const router = Router();

// Test endpoint for WhatsApp functionality
router.get('/whatsapp-demo', async (req, res) => {
  try {
    const health = await whatsappService.getServiceHealth();
    
    const testData = {
      service_status: health,
      available_endpoints: [
        'GET /api/whatsapp/health - Service health check',
        'POST /api/whatsapp/send-commercial-message - Send commercial messages',
        'POST /api/whatsapp/send-education-notification - Send educational notifications',
        'GET /api/whatsapp/stats - Get message statistics',
        'GET /api/whatsapp/conversations/:phoneNumber - Get conversation history',
        'POST /api/whatsapp/verify-number - Verify phone number',
        'GET /api/whatsapp/webhook - Webhook verification',
        'POST /api/whatsapp/webhook - Receive webhook messages'
      ],
      commercial_templates: [
        'welcome - Welcome new prospects',
        'demo - Send demo access information',
        'pricing - Share pricing information', 
        'follow_up - Follow up with prospects',
        'support - Technical support messages'
      ],
      educational_templates: [
        'grade - New grade notifications',
        'absence - Absence alerts',
        'payment - Payment reminders',
        'announcement - School announcements',
        'meeting - Meeting invitations',
        'emergency - Emergency alerts'
      ],
      test_examples: {
        commercial_message: {
          endpoint: 'POST /api/whatsapp/send-commercial-message',
          payload: {
            phoneNumber: '+237600000000',
            type: 'welcome',
            data: {
              contactName: 'Simon',
              companyName: 'Test School'
            },
            language: 'fr'
          }
        },
        educational_notification: {
          endpoint: 'POST /api/whatsapp/send-education-notification',
          payload: {
            phoneNumber: '+237600000000',
            type: 'grade',
            data: {
              studentName: 'Jean Dupont',
              subjectName: 'Mathématiques',
              grade: '16',
              teacherName: 'Mme Martin',
              classAverage: '12',
              trend: 'En progression',
              comment: 'Excellent travail!',
              schoolName: 'École Primaire Yaoundé'
            },
            language: 'fr'
          }
        }
      },
      environment_setup: {
        required_variables: [
          'WHATSAPP_ACCESS_TOKEN - Your Meta WhatsApp Business API token',
          'WHATSAPP_PHONE_NUMBER_ID - Your WhatsApp phone number ID',
          'WHATSAPP_BUSINESS_ACCOUNT_ID - Your WhatsApp Business Account ID',
          'WHATSAPP_WEBHOOK_TOKEN - Webhook verification token (optional)'
        ],
        setup_instructions: 'See WHATSAPP_BUSINESS_SETUP_GUIDE.md for detailed setup instructions'
      }
    };

    res.json({
      title: 'EDUCAFRIC WhatsApp Business API - Test Dashboard',
      description: 'Complete WhatsApp Business integration for commercial communications and educational notifications',
      status: 'Integration Ready - Awaiting API Credentials',
      ...testData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate test dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test commercial message endpoint
router.post('/test-commercial-message', async (req, res) => {
  try {
    const { phoneNumber = '+237600000000', messageType = 'welcome', language = 'fr' } = req.body;
    
    const testData = {
      contactName: 'Simon Muehling',
      companyName: 'EDUCAFRIC Test School',
      demoLink: 'https://www.educafric.com/demo',
      daysSince: '3',
      issueType: 'Platform Integration',
      ticketId: '2025001'
    };

    const result = await whatsappService.sendCommercialMessage(
      phoneNumber,
      messageType,
      testData,
      language as 'fr' | 'en'
    );

    res.json({
      test_type: 'Commercial Message',
      message_type: messageType,
      target_phone: phoneNumber,
      language: language,
      test_data: testData,
      result: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      note: 'This is expected if WhatsApp API credentials are not configured'
    });
  }
});

// Test educational notification endpoint
router.post('/test-education-notification', async (req, res) => {
  try {
    const { phoneNumber = '+237600000000', notificationType = 'grade', language = 'fr' } = req.body;
    
    const testData = {
      studentName: 'Jean Dupont',
      subjectName: 'Mathématiques',
      grade: '16',
      teacherName: 'Mme Martin',
      classAverage: '12',
      trend: 'En progression',
      comment: 'Excellent travail!',
      schoolName: 'École Primaire Yaoundé',
      date: '24/01/2025',
      period: 'Morning',
      reason: 'Medical appointment',
      monthlyTotal: '2',
      amount: '15000',
      dueDate: '31/01/2025',
      paymentType: 'School fees',
      title: 'Important Announcement',
      message: 'Parent-teacher meeting scheduled',
      audience: 'All parents',
      meetingSubject: 'Academic progress review',
      meetingDate: '30/01/2025',
      meetingTime: '10:00 AM',
      location: 'School auditorium',
      participants: 'Parents and homeroom teacher',
      emergencyMessage: 'Student needs immediate pickup',
      actionRequired: 'Come to school office',
      emergencyContact: '+237656200472',
      schoolPhone: '+237656200472'
    };

    const result = await whatsappService.sendEducationNotification(
      phoneNumber,
      notificationType,
      testData,
      language as 'fr' | 'en'
    );

    res.json({
      test_type: 'Educational Notification',
      notification_type: notificationType,
      target_phone: phoneNumber,
      language: language,
      test_data: testData,
      result: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      note: 'This is expected if WhatsApp API credentials are not configured'
    });
  }
});

// Get sample message templates
router.get('/message-templates', async (req, res) => {
  try {
    const { language = 'fr' } = req.query;
    
    // Sample commercial message in French
    const commercialSample = `🎓 Bienvenue chez Educafric!

Bonjour Simon Muehling,

Merci de votre intérêt pour la plateforme éducative africaine Educafric. Nous sommes ravis de vous accompagner dans la transformation numérique de EDUCAFRIC Test School.

🌟 Nos solutions incluent:
• Gestion complète d'école
• Suivi académique intelligent
• Communication parents-école
• Géolocalisation sécurisée
• Support multilingue (Français/Anglais)

📱 Démo personnalisée: https://www.educafric.com/demo
💬 Questions? Répondez à ce message

Cordialement,
L'équipe Educafric
+237 656 200 472`;

    // Sample educational notification in French
    const educationalSample = `📚 Nouvelle Note - Jean Dupont

Mathématiques: 16/20
Professeur: Mme Martin

📊 Moyenne classe: 12/20
📈 Évolution: En progression

💬 Commentaire: "Excellent travail!"

Consultez tous les détails sur Educafric:
https://www.educafric.com/grades

École Primaire Yaoundé`;

    res.json({
      language: language,
      commercial_template_sample: commercialSample,
      educational_template_sample: educationalSample,
      available_commercial_types: ['welcome', 'demo', 'pricing', 'follow_up', 'support'],
      available_educational_types: ['grade', 'absence', 'payment', 'announcement', 'meeting', 'emergency'],
      template_features: [
        'Bilingual support (French/English)',
        'Variable interpolation with {{placeholder}} syntax',
        'African educational context optimization',
        'CFA currency formatting',
        'Professional business tone',
        'Mobile-optimized message length'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate template samples'
    });
  }
});

export default router;