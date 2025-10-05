# How to Get WhatsApp Business API Credentials

## Overview

To enable real WhatsApp messaging in EDUCAFRIC, you need three credentials from Meta (Facebook):

1. **WHATSAPP_ACCESS_TOKEN** - Your API access token
2. **WHATSAPP_PHONE_NUMBER_ID** - Your WhatsApp phone number ID  
3. **WHATSAPP_BUSINESS_ACCOUNT_ID** - Your WhatsApp Business Account ID

## Step-by-Step Guide

### Step 1: Create Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Get Started" (top right)
3. Log in with your Facebook account or create one
4. Complete the developer registration process

### Step 2: Create a New App

1. In Meta Developer Dashboard, click **"Create App"**
2. Select **"Business"** as app type
3. Fill in app details:
   - **App Name**: "EDUCAFRIC WhatsApp Business"
   - **App Contact Email**: Your email (e.g., simonmhling@gmail.com)
   - **Business Account**: Create new or select existing
4. Click **"Create App"**

### Step 3: Add WhatsApp Business API

1. In your app dashboard, scroll to **"Add Products to Your App"**
2. Find **"WhatsApp Business API"** and click **"Set Up"**
3. This will add WhatsApp to your app

### Step 4: Get Your Credentials

#### A) Get WHATSAPP_ACCESS_TOKEN

1. In WhatsApp Business API section, go to **"Getting Started"**
2. Under **"Temporary Access Token"**, you'll see a token
3. Copy this token - this is your **WHATSAPP_ACCESS_TOKEN**

**Note**: This is a temporary token (24 hours). For production, you need a permanent token:
- Go to **"Configuration" > "API Setup"**
- Create a permanent token with proper permissions

#### B) Get WHATSAPP_PHONE_NUMBER_ID

1. In the same **"Getting Started"** section
2. Look for **"From phone number ID"**
3. You'll see a number like `123456789012345`
4. Copy this number - this is your **WHATSAPP_PHONE_NUMBER_ID**

#### C) Get WHATSAPP_BUSINESS_ACCOUNT_ID

1. Go to **"Configuration" > "API Setup"**
2. Look for **"WhatsApp Business Account ID"**
3. Copy the ID (usually starts with numbers)
4. This is your **WHATSAPP_BUSINESS_ACCOUNT_ID**

### Step 5: Configure Phone Number

1. In **"API Setup"**, you'll see your test phone number
2. This is typically a Meta-provided test number
3. To use your own number:
   - Go to **"Phone Numbers"**
   - Click **"Add Phone Number"**
   - Follow verification process for your number (+237657004011)

### Step 6: Add Credentials to Replit

1. In your Replit project, click the **"Secrets"** tab (lock icon)
2. Add three new secrets:

```
Key: WHATSAPP_ACCESS_TOKEN
Value: EAABxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Key: WHATSAPP_PHONE_NUMBER_ID  
Value: 123456789012345

Key: WHATSAPP_BUSINESS_ACCOUNT_ID
Value: 567890123456789
```

3. Click **"Add Secret"** for each one

### Step 7: Verify Setup

After adding credentials, test the integration:

```bash
curl -X GET "http://localhost:5000/api/whatsapp/health"
```

Should return:
```json
{
  "success": true,
  "service": "WhatsApp Business API",
  "status": "configured", 
  "configured": true,
  "connected": true
}
```

## Important Notes

### Test vs Production Tokens

- **Test Environment**: Use temporary tokens (24h expiry)
- **Production**: Create permanent tokens with proper permissions

### Phone Number Requirements

- Must be a business phone number
- Cannot be used with regular WhatsApp app
- Requires verification through Meta
- Your number +237657004011 is perfect for this

### API Limits

- **Test Account**: 1,000 conversations per month
- **Production**: Unlimited (with approved business verification)

### Business Verification

For production use, Meta requires:
1. Business verification
2. App review process
3. Approved message templates

## Troubleshooting

### "Token Invalid" Error
- Check token copied correctly (no extra spaces)
- Token might be expired (get new one)
- Ensure app has WhatsApp permissions

### "Phone Number Not Found"
- Verify WHATSAPP_PHONE_NUMBER_ID is correct
- Check phone number is added to your WhatsApp Business Account

### "Business Account Access"
- Ensure your Facebook account has admin access
- Check WHATSAPP_BUSINESS_ACCOUNT_ID matches your account

## Quick Test Commands

Once configured, test with:

```bash
# Health check
curl -X GET "http://localhost:5000/api/whatsapp/health"

# Send test message
curl -X POST -H "Content-Type: application/json" \
-d '{"phoneNumber":"+237657004011","type":"welcome","data":{"contactName":"Simon"},"language":"fr"}' \
"http://localhost:5000/api/whatsapp/send-commercial-message"
```

## Alternative: WhatsApp Cloud API

If you prefer the newer Cloud API:

1. Go to [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
2. Follow similar steps but use Cloud API endpoints
3. The credentials are the same format

## Support Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/business-management-api)
- [Meta Developer Community](https://developers.facebook.com/community/)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

## Cost Information

- **Conversations**: Free tier includes 1,000 conversations/month
- **Additional**: ~$0.005-0.02 per conversation (varies by country)
- **Templates**: Free to create, charged per message sent

Your WhatsApp integration is ready - just add these three credentials to get it working with real messaging!