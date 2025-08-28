// Script to update your WhatsApp Business account with Meta access token
const updateWhatsAppAccount = async () => {
  console.log('🔧 Updating WhatsApp Business Account with Meta Access Token');
  console.log('Account: 41783044077 (Findusthere)');
  
  // Replace YOUR_META_ACCESS_TOKEN with the token from your Conversions API System User
  const accessToken = 'YOUR_META_ACCESS_TOKEN'; // Paste your token here
  
  const response = await fetch('https://api.nexmo.com/beta/chatapp-accounts/whatsapp/41783044077', {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_token: accessToken,
      name: 'Findusthere'
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ WhatsApp account updated successfully!');
    console.log('Account details:', result);
  } else {
    console.error('❌ Failed to update account:', await response.text());
  }
};

// Instructions
console.log('📋 To enable WhatsApp messaging:');
console.log('1. Go to System Users → Conversions API System User');
console.log('2. Generate New Token with whatsapp_business_messaging permission');
console.log('3. Replace YOUR_META_ACCESS_TOKEN in this script');
console.log('4. Uncomment updateWhatsAppAccount() and run script');
console.log('');
console.log('🔗 Meta Business Manager: https://business.facebook.com');
console.log('📱 Your WhatsApp number: 41783044077');
console.log('👤 System User: Conversions API System User (has full control)');

// Uncomment to run the update (after adding your token)
// updateWhatsAppAccount();