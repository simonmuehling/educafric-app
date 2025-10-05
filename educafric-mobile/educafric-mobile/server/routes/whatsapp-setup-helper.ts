import { Router } from 'express';

const router = Router();

// Helper endpoint to guide users through WhatsApp setup
router.get('/setup-guide', (req, res) => {
  res.json({
    title: 'WhatsApp Business API Setup Guide',
    description: 'Step-by-step instructions to get your WhatsApp Business API credentials',
    
    quick_links: {
      meta_developers: 'https://developers.facebook.com/',
      whatsapp_business_api: 'https://developers.facebook.com/docs/whatsapp/business-management-api',
      cloud_api_docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api'
    },
    
    required_credentials: [
      {
        name: 'WHATSAPP_ACCESS_TOKEN',
        description: 'Your Meta WhatsApp Business API access token',
        where_to_find: 'Meta Developer Dashboard > Your App > WhatsApp > Getting Started > Temporary Access Token',
        example_format: 'EAABxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        notes: 'This is a temporary token (24h). For production, create a permanent token.'
      },
      {
        name: 'WHATSAPP_PHONE_NUMBER_ID',
        description: 'Your WhatsApp phone number ID',
        where_to_find: 'Meta Developer Dashboard > Your App > WhatsApp > Getting Started > From phone number ID',
        example_format: '123456789012345',
        notes: 'This is NOT your actual phone number, but the ID Meta assigns to your number.'
      },
      {
        name: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        description: 'Your WhatsApp Business Account ID',
        where_to_find: 'Meta Developer Dashboard > Your App > WhatsApp > Configuration > API Setup > WhatsApp Business Account ID',
        example_format: '567890123456789',
        notes: 'This identifies your WhatsApp Business Account in Meta\'s system.'
      }
    ],
    
    setup_steps: [
      {
        step: 1,
        title: 'Create Meta Developer Account',
        action: 'Go to developers.facebook.com and create/login to your account',
        url: 'https://developers.facebook.com/'
      },
      {
        step: 2,
        title: 'Create New App',
        action: 'Click "Create App" → Select "Business" → Fill app details → Create',
        details: {
          app_name: 'EDUCAFRIC WhatsApp Business',
          contact_email: 'simonmhling@gmail.com',
          app_type: 'Business'
        }
      },
      {
        step: 3,
        title: 'Add WhatsApp Business API',
        action: 'In app dashboard → Add Products → WhatsApp Business API → Set Up'
      },
      {
        step: 4,
        title: 'Get Access Token',
        action: 'WhatsApp section → Getting Started → Copy "Temporary Access Token"',
        important: 'Save this as WHATSAPP_ACCESS_TOKEN'
      },
      {
        step: 5,
        title: 'Get Phone Number ID',
        action: 'Same Getting Started page → Copy "From phone number ID"',
        important: 'Save this as WHATSAPP_PHONE_NUMBER_ID'
      },
      {
        step: 6,
        title: 'Get Business Account ID',
        action: 'Configuration → API Setup → Copy "WhatsApp Business Account ID"',
        important: 'Save this as WHATSAPP_BUSINESS_ACCOUNT_ID'
      },
      {
        step: 7,
        title: 'Add to Replit Secrets',
        action: 'In Replit → Secrets tab → Add all three credentials',
        verification: 'Test with: curl http://localhost:5000/api/whatsapp/health'
      }
    ],
    
    phone_number_setup: {
      current_test_number: 'Meta provides a test number initially',
      add_your_number: {
        target_number: '+237657004011',
        process: [
          'Go to Phone Numbers section in Meta dashboard',
          'Click "Add Phone Number"',
          'Enter +237657004011',
          'Complete verification process',
          'Wait for approval (usually 24-48 hours)'
        ],
        requirements: [
          'Must be a business phone number',
          'Cannot be used with regular WhatsApp app',
          'Requires SMS/call verification'
        ]
      }
    },
    
    testing_instructions: {
      after_setup: [
        'Add credentials to Replit Secrets',
        'Restart your application',
        'Test health endpoint: GET /api/whatsapp/health', 
        'Send test message: POST /api/whatsapp/send-commercial-message',
        'Check message delivery in WhatsApp'
      ],
      test_commands: [
        'curl -X GET "http://localhost:5000/api/whatsapp/health"',
        'curl -X POST -H "Content-Type: application/json" -d \'{"phoneNumber":"+237657004011","type":"welcome","data":{"contactName":"Simon"},"language":"fr"}\' "http://localhost:5000/api/whatsapp/send-commercial-message"'
      ]
    },
    
    troubleshooting: {
      common_issues: [
        {
          problem: 'Token Invalid Error',
          solutions: [
            'Check token copied correctly (no spaces)',
            'Token might be expired (get new one)',
            'Ensure app has WhatsApp permissions'
          ]
        },
        {
          problem: 'Phone Number Not Found',
          solutions: [
            'Verify WHATSAPP_PHONE_NUMBER_ID is correct',
            'Check phone number is added to Business Account',
            'Ensure number verification is complete'
          ]
        },
        {
          problem: 'Business Account Access',
          solutions: [
            'Ensure Facebook account has admin access',
            'Check WHATSAPP_BUSINESS_ACCOUNT_ID matches',
            'Verify business verification status'
          ]
        }
      ]
    },
    
    production_notes: {
      business_verification: 'Required for production use and unlimited messaging',
      message_templates: 'Must be approved by Meta for marketing messages',
      pricing: 'Free tier: 1,000 conversations/month, then ~$0.005-0.02 per conversation',
      limits: {
        test: '1,000 conversations per month',
        production: 'Unlimited with approved business verification'
      }
    },
    
    next_steps: [
      'Follow the setup steps above to get your credentials',
      'Add credentials to Replit Secrets',
      'Test the integration with provided commands',
      'Configure your phone number (+237657004011)',
      'Apply for business verification for production use'
    ]
  });
});

// Endpoint to validate credentials format
router.post('/validate-credentials', (req, res) => {
  const { accessToken, phoneNumberId, businessAccountId } = req.body;
  
  const validation = {
    accessToken: {
      provided: !!accessToken,
      format_valid: accessToken && accessToken.startsWith('EAA') && accessToken.length > 20,
      notes: 'Should start with "EAA" and be quite long'
    },
    phoneNumberId: {
      provided: !!phoneNumberId,
      format_valid: phoneNumberId && /^\d{15,17}$/.test(phoneNumberId),
      notes: 'Should be 15-17 digits, numbers only'
    },
    businessAccountId: {
      provided: !!businessAccountId,
      format_valid: businessAccountId && /^\d{15,17}$/.test(businessAccountId),
      notes: 'Should be 15-17 digits, numbers only'
    }
  };
  
  const allValid = validation.accessToken.format_valid && 
                  validation.phoneNumberId.format_valid && 
                  validation.businessAccountId.format_valid;
  
  res.json({
    success: allValid,
    message: allValid ? 'All credentials appear to have correct format' : 'Some credentials have format issues',
    validation: validation,
    next_steps: allValid ? [
      'Add these credentials to Replit Secrets',
      'Restart your application', 
      'Test with: curl http://localhost:5000/api/whatsapp/health'
    ] : [
      'Check credential formats against examples above',
      'Verify you copied complete values from Meta dashboard',
      'Ensure no extra spaces or characters'
    ]
  });
});

export default router;