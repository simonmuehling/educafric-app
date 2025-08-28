// Script to configure your WhatsApp Business account with Meta certificate
const updateWhatsAppAccount = async () => {
  console.log('🔧 Configuring WhatsApp Business Account with Meta Certificate');
  console.log('Account: 41783044077 (Findusthere)');
  
  // Meta base64 certificate from WhatsApp Manager
  const metaCertificate = 'CmkKJQi4keWNu8ywAxIGZW50OndhIgxNUyBTb2x1dGlvbnNQ8tjAxQYaQHRyFPJUQqNUYTV2Zvskd3N3gT11sGBDn9YtZ2VHvspyPcqIZBtJhB2U51oKGzjTe6nLwKXdGG2hCpyX/j7bvQMSLm1UWeTijJiZ81q1tpmrZSqVXuDlW8LY754MRE6tPHX06KQe1w64lTU5ZL/fVWg=';
  
  const response = await fetch('https://api.nexmo.com/beta/chatapp-accounts/whatsapp/41783044077', {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cert: metaCertificate,
      name: 'Findusthere'
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ WhatsApp account configured successfully!');
    console.log('Account details:', result);
  } else {
    console.error('❌ Failed to configure account:', await response.text());
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

// Run the configuration now
updateWhatsAppAccount();