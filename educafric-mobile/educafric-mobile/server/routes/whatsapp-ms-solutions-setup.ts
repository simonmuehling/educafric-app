import { Router } from 'express';
import { whatsappService } from '../services/whatsappService.js';

const router = Router();

// Guide pour la configuration du certificat MS Solutions
router.get('/ms-solutions-guide', async (req, res) => {
  try {
    res.json({
      success: true,
      title: "Configuration WhatsApp Business - MS Solutions",
      certificate: {
        displayName: "MS Solutions",
        status: "Approuvé ✅",
        certificateCode: "CmkKJQij6v+BsaCoAxIGZW50OndhIgxNUyBTb2x1dGlvbnNQ98XCxQYaQGDzw9m22Swm728Pts0iIwNG/9TvsPtWd+lpeGnyQl4O0bButL1BwwYv27bvjd5Sc9TGIWht490FzjGAj3Q/EwoSLm1UWeTijJiZ81q1tpmrZSqVXuDlW8LY6oMORE6tPPXdHvGVuvr/NOXflcmmPzA="
      },
      instructions: {
        step1: {
          title: "Accéder à Meta for Developers",
          description: "Connectez-vous à https://developers.facebook.com avec le compte associé à MS Solutions",
          action: "Trouver votre application WhatsApp Business existante"
        },
        step2: {
          title: "Récupérer l'Access Token",
          description: "Dans WhatsApp Business API > Getting Started ou Configuration",
          action: "Générer un token d'accès permanent (commence par EAA...)",
          variable: "WHATSAPP_ACCESS_TOKEN"
        },
        step3: {
          title: "Récupérer le Phone Number ID",
          description: "Dans API Setup, trouvez votre numéro associé à MS Solutions",
          action: "Copier l'ID du numéro (série de chiffres)",
          variable: "WHATSAPP_PHONE_NUMBER_ID"
        },
        step4: {
          title: "Récupérer le Business Account ID",
          description: "Dans Configuration > API Setup",
          action: "Noter l'ID du compte Business",
          variable: "WHATSAPP_BUSINESS_ACCOUNT_ID"
        }
      },
      nextSteps: [
        "Une fois que vous avez ces 3 informations, utilisez l'endpoint /configure pour les sauvegarder",
        "Testez la configuration avec /test-ms-solutions",
        "Activez l'envoi de messages depuis vos dashboards Commercial et Parent"
      ],
      support: {
        owner: "Simon Muehling",
        phone_primary: "+237657004011",
        phone_secondary: "+41768017000",
        email: "simonmhling@gmail.com"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du guide de configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Configuration des credentials MS Solutions
router.post('/configure-ms-solutions', async (req, res) => {
  try {
    const { accessToken, phoneNumberId, businessAccountId } = req.body;

    // Validation des données requises
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Informations manquantes',
        required: ['accessToken', 'phoneNumberId', 'businessAccountId'],
        message: 'Veuillez fournir tous les credentials WhatsApp Business'
      });
    }

    // Note: Dans un environnement de production, ces credentials seraient stockés
    // de manière sécurisée (variables d'environnement, vault, etc.)
    console.log('[WhatsApp MS Solutions] Configuration reçue:');
    console.log('- Access Token:', accessToken.substring(0, 20) + '...');
    console.log('- Phone Number ID:', phoneNumberId);
    console.log('- Business Account ID:', businessAccountId);

    // Instructions pour ajouter les variables d'environnement
    const envInstructions = `
Ajoutez ces variables à vos secrets Replit :

WHATSAPP_ACCESS_TOKEN=${accessToken}
WHATSAPP_PHONE_NUMBER_ID=${phoneNumberId}
WHATSAPP_BUSINESS_ACCOUNT_ID=${businessAccountId}
WHATSAPP_WEBHOOK_TOKEN=educafric_whatsapp_webhook_2025
`;

    res.json({
      success: true,
      message: 'Configuration MS Solutions reçue avec succès',
      displayName: 'MS Solutions',
      nextSteps: {
        title: 'Prochaines étapes',
        instructions: envInstructions,
        actions: [
          '1. Ajoutez ces 4 variables aux secrets Replit',
          '2. Redémarrez l\'application',
          '3. Testez avec /api/whatsapp-setup/test-ms-solutions',
          '4. Commencez à envoyer des messages depuis vos dashboards'
        ]
      },
      testEndpoint: '/api/whatsapp-setup/test-ms-solutions',
      dashboards: [
        'Dashboard Commercial : Envoi de messages commerciaux',
        'Dashboard Parent : Notifications éducatives automatiques'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Test de la configuration MS Solutions
router.get('/test-ms-solutions', async (req, res) => {
  try {
    // Vérifier la santé du service WhatsApp
    const health = await whatsappService.getServiceHealth();
    
    res.json({
      success: true,
      title: 'Test de Configuration MS Solutions',
      whatsappService: health,
      certificateInfo: {
        displayName: 'MS Solutions',
        status: 'Approuvé',
        integration: health.configured ? 'Prêt' : 'Configuration manquante'
      },
      availableFeatures: {
        commercialMessages: health.configured,
        educationNotifications: health.configured,
        autoReplies: health.configured,
        messageStats: health.configured,
        conversationHistory: health.configured
      },
      testMessage: health.configured ? 
        'Votre intégration MS Solutions est prête ! Vous pouvez maintenant envoyer des messages WhatsApp.' :
        'Configuration manquante. Ajoutez les variables d\'environnement WhatsApp.',
      recommendations: health.configured ? [
        'Testez l\'envoi d\'un message depuis le Dashboard Commercial',
        'Configurez les notifications automatiques dans le Dashboard Parent',
        'Vérifiez les statistiques de messages dans WhatsApp Manager'
      ] : [
        'Ajoutez WHATSAPP_ACCESS_TOKEN aux secrets Replit',
        'Ajoutez WHATSAPP_PHONE_NUMBER_ID aux secrets Replit', 
        'Ajoutez WHATSAPP_BUSINESS_ACCOUNT_ID aux secrets Replit',
        'Redémarrez l\'application après ajout des secrets'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test de configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Envoi d'un message de test avec MS Solutions
router.post('/send-test-message', async (req, res) => {
  try {
    const { phoneNumber, language = 'fr' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Numéro de téléphone requis',
        format: 'Format attendu: +237XXXXXXXXX'
      });
    }

    // Envoyer un message de test avec MS Solutions
    const result = await whatsappService.sendCommercialMessage(
      phoneNumber,
      'welcome',
      {
        contactName: 'Test User',
        companyName: 'MS Solutions - EDUCAFRIC'
      },
      language as 'fr' | 'en'
    );

    res.json({
      success: result.success,
      message: result.success ? 
        'Message de test envoyé avec succès depuis MS Solutions' :
        'Échec de l\'envoi du message de test',
      result,
      sentFrom: 'MS Solutions',
      platform: 'EDUCAFRIC WhatsApp Business',
      messageType: 'Welcome/Test Message'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message de test',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;