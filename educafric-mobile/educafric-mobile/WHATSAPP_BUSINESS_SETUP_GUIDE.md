# WhatsApp Business API Integration Guide - EDUCAFRIC

## Overview
This guide explains how to set up and configure the WhatsApp Business API integration for EDUCAFRIC platform. The integration enables automated messaging for both commercial communications and educational notifications.

## Prerequisites
1. **WhatsApp Business Account**: A verified WhatsApp Business account
2. **Meta Developer Account**: Access to Meta for Developers platform
3. **Phone Number**: A dedicated phone number for business communications
4. **Webhook URL**: A publicly accessible webhook endpoint

## Environment Variables Required

Add the following environment variables to your `.env` file:

```bash
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_TOKEN=educafric_whatsapp_webhook_2025
```

## Step-by-Step Setup

### 1. Create WhatsApp Business Account
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "WhatsApp Business" product to your app
4. Follow the setup wizard to verify your business

### 2. Get Required Credentials

#### Access Token
1. In your Meta app dashboard, go to WhatsApp > Getting Started
2. Generate a permanent access token (not temporary)
3. Copy the token and add to `WHATSAPP_ACCESS_TOKEN`

#### Phone Number ID
1. In WhatsApp settings, go to API Setup
2. Find your phone number in the list
3. Copy the Phone Number ID and add to `WHATSAPP_PHONE_NUMBER_ID`

#### Business Account ID  
1. In your app dashboard, note the WhatsApp Business Account ID
2. Add this to `WHATSAPP_BUSINESS_ACCOUNT_ID`

### 3. Configure Webhook

#### Set Webhook URL
Your webhook URL should be: `https://your-domain.com/api/whatsapp/webhook`

For Replit deployment: `https://your-repl-name.username.replit.app/api/whatsapp/webhook`

#### Webhook Configuration
1. In Meta dashboard, go to WhatsApp > Configuration
2. Set Webhook URL to your endpoint
3. Set Verify Token to: `educafric_whatsapp_webhook_2025`
4. Subscribe to these webhook fields:
   - `messages`
   - `message_deliveries`
   - `message_reads`

### 4. Test Integration

#### Health Check
```bash
curl -X GET "https://your-domain.com/api/whatsapp/health"
```

Expected response when configured:
```json
{
  "success": true,
  "service": "WhatsApp Business API",
  "status": "configured",
  "configured": true,
  "connected": true,
  "phoneNumber": "+237xxxxxxxxx",
  "message": "WhatsApp Business API connected successfully"
}
```

#### Send Test Message
```bash
curl -X POST "https://your-domain.com/api/whatsapp/send-commercial-message" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+237657004011",
    "type": "welcome",
    "data": {
      "contactName": "Simon",
      "companyName": "Test School"
    },
    "language": "fr"
  }'
```

## Available Message Types

### Commercial Messages (Commercial Dashboard)
- `welcome`: Welcome new prospects
- `demo`: Send demo access information  
- `pricing`: Share pricing information
- `follow_up`: Follow up with prospects
- `support`: Technical support messages

### Educational Notifications (Parent Dashboard)
- `grade`: New grade notifications
- `absence`: Absence alerts
- `payment`: Payment reminders
- `announcement`: School announcements
- `meeting`: Meeting invitations
- `emergency`: Emergency alerts

## Usage in Dashboards

### Commercial Dashboard
Located in: `client/src/components/commercial/modules/WhatsAppManager.tsx`

Features:
- Send commercial messages
- View message statistics
- Manage conversation history
- Template selection
- Bilingual support

### Parent Dashboard  
Located in: `client/src/components/parent/modules/WhatsAppNotifications.tsx`

Features:
- Educational notifications
- Phone number verification
- Message preferences
- Notification history
- Test notifications

## API Endpoints

### Health Check
- **GET** `/api/whatsapp/health`
- Returns service status and configuration

### Webhook
- **GET** `/api/whatsapp/webhook` - Webhook verification
- **POST** `/api/whatsapp/webhook` - Receive messages

### Send Messages
- **POST** `/api/whatsapp/send-commercial-message`
- **POST** `/api/whatsapp/send-education-notification`

### Statistics & History
- **GET** `/api/whatsapp/stats`
- **GET** `/api/whatsapp/conversations/:phoneNumber`

### Verification
- **POST** `/api/whatsapp/verify-number`

## Message Templates

All templates are bilingual (French/English) and optimized for African educational context. Templates include:

- Professional business communication
- Educational notifications with student names
- Emergency alerts with immediate action items
- Payment reminders with CFA amounts
- Automated responses for common queries

## Auto-Reply Features

The system automatically responds to:
- Demo requests ("demo", "démo")
- Pricing inquiries ("prix", "price", "tarif")
- General messages with welcome response

## Error Handling

The service includes comprehensive error handling:
- API connection failures
- Invalid phone numbers
- Rate limiting
- Webhook processing errors
- Template interpolation errors

## Security Features

- Webhook token verification
- Environment variable validation
- Request body validation  
- Rate limiting protection
- Error logging and monitoring

## Monitoring and Logging

All WhatsApp activities are logged with prefixes:
- `[WhatsApp]` - General operations
- `[WhatsApp] Message sent` - Successful sends
- `[WhatsApp] Webhook verified` - Webhook events
- `[WhatsApp] Incoming message` - Received messages

## Troubleshooting

### Common Issues

#### "WhatsApp service not configured"
- Check all environment variables are set
- Verify tokens are correct and not expired

#### "Webhook verification failed"  
- Verify webhook token matches exactly
- Check webhook URL is publicly accessible

#### "Failed to send message"
- Verify phone number format (+237xxxxxxxxx)
- Check API token permissions
- Verify recipient has WhatsApp account

#### Health check shows "pending_setup"
- Add required environment variables
- Restart the application
- Verify Meta app permissions

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG_WHATSAPP=true
```

## Production Deployment

### Replit Deployment
1. Add environment variables in Replit Secrets
2. Deploy your repl  
3. Update webhook URL in Meta dashboard
4. Test all endpoints

### Custom Domain
If using custom domain:
1. Update webhook URL to use your domain
2. Ensure SSL certificate is valid
3. Test webhook connectivity

## Support Contacts

For technical support with EDUCAFRIC WhatsApp integration:
- **Owner**: Simon Muehling
- **Primary Phone**: +237657004011 (Cameroon)
- **Secondary Phone**: +41768017000 (Switzerland)
- **Email**: simonmhling@gmail.com, simonpmuehling@gmail.com

## Integration Status

✅ **COMPLETED FEATURES:**
- WhatsApp Business API service class
- Commercial messaging system
- Educational notifications
- Webhook handling
- Message statistics
- Conversation history
- Bilingual templates
- Auto-reply functionality
- Health monitoring
- Error handling

The WhatsApp Business integration for EDUCAFRIC is production-ready and awaits only the configuration of environment variables for full operation.