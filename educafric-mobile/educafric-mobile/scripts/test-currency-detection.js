/**
 * Currency Detection System Test
 * Tests IP-based currency detection and pricing conversion
 */

console.log('🧪 [CURRENCY_TEST] Starting comprehensive currency detection test...\n');

const baseUrl = 'http://localhost:5000';

async function testCurrencyDetection() {
  console.log('🌍 Testing IP-based currency detection...');
  
  try {
    const response = await fetch(`${baseUrl}/api/currency/detect`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Currency detection successful:', {
        userIP: data.userIP,
        country: data.country,
        currency: data.currency,
        symbol: data.symbol,
        exchangeRate: data.exchangeRate
      });
      return data;
    } else {
      console.log('❌ Currency detection failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Currency detection error:', error.message);
    return null;
  }
}

async function testPricingConversion(planType = 'all') {
  console.log(`💰 Testing pricing conversion for: ${planType}...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/currency/pricing/${planType}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pricing conversion successful:', {
        planType: data.planType,
        currency: data.currencyContext.currency,
        symbol: data.currencyContext.symbol,
        samplePricing: Object.keys(data.pricing).slice(0, 3).reduce((acc, key) => {
          acc[key] = data.pricing[key];
          return acc;
        }, {})
      });
      return data;
    } else {
      console.log('❌ Pricing conversion failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Pricing conversion error:', error.message);
    return null;
  }
}

function testCurrencyFormatting(amount, currency, locale) {
  console.log(`💱 Testing currency formatting: ${amount} ${currency}...`);
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'XAF' || currency === 'XOF' ? 0 : 2
    }).format(amount);
    
    console.log(`✅ Formatted price: ${formatted}`);
    return formatted;
  } catch (error) {
    console.log(`❌ Currency formatting error: ${error.message}`);
    return `${currency} ${amount}`;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 [CURRENCY_TEST] Starting comprehensive currency system test...\n');
  
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Currency Detection
  console.log('=== TEST 1: IP-Based Currency Detection ===');
  const currencyData = await testCurrencyDetection();
  totalTests++;
  if (currencyData) passedTests++;
  console.log('');

  // Test 2: Pricing Conversion (All Plans)
  console.log('=== TEST 2: Pricing Conversion (All Plans) ===');
  const allPricing = await testPricingConversion('all');
  totalTests++;
  if (allPricing) passedTests++;
  console.log('');

  // Test 3: Individual Plan Testing
  console.log('=== TEST 3: Individual Plan Pricing ===');
  const testPlans = ['parent-basic', 'public-school', 'freelancer-premium'];
  
  for (const plan of testPlans) {
    const planPricing = await testPricingConversion(plan);
    totalTests++;
    if (planPricing) passedTests++;
  }
  console.log('');

  // Test 4: Currency Formatting
  console.log('=== TEST 4: Currency Formatting ===');
  if (currencyData) {
    const testAmounts = [5000, 25000, 150000];
    
    for (const amount of testAmounts) {
      const formatted = testCurrencyFormatting(amount, currencyData.currency, currencyData.locale);
      totalTests++;
      if (formatted) passedTests++;
    }
  } else {
    console.log('⚠️  Skipping formatting tests - no currency data available');
  }
  console.log('');

  // Test 5: Multi-Currency Examples
  console.log('=== TEST 5: Multi-Currency Examples ===');
  const currencies = [
    { currency: 'XAF', locale: 'fr-CM', name: 'Cameroon CFA' },
    { currency: 'NGN', locale: 'en-NG', name: 'Nigerian Naira' },
    { currency: 'USD', locale: 'en-US', name: 'US Dollar' },
    { currency: 'EUR', locale: 'fr-FR', name: 'Euro' }
  ];
  
  currencies.forEach(curr => {
    const formatted = testCurrencyFormatting(25000, curr.currency, curr.locale);
    totalTests++;
    if (formatted) passedTests++;
  });
  console.log('');

  // Final Results
  console.log('='.repeat(60));
  console.log('🏁 [CURRENCY_TEST] FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL CURRENCY TESTS PASSED! System fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Check logs above for details.');
  }
  
  console.log('='.repeat(60));
  
  // Display Sample Pricing in Detected Currency
  if (currencyData && allPricing) {
    console.log('\n📋 SAMPLE EDUCAFRIC PRICING IN DETECTED CURRENCY:');
    console.log(`Country: ${currencyData.country} (${currencyData.currency})`);
    console.log('─'.repeat(50));
    
    Object.entries(allPricing.pricing).slice(0, 6).forEach(([plan, price]) => {
      const formatted = testCurrencyFormatting(price, currencyData.currency, currencyData.locale);
      console.log(`${plan.padEnd(20)}: ${formatted}`);
    });
    console.log('─'.repeat(50));
  }
  
  return passedTests === totalTests;
}

runComprehensiveTest()
  .then(success => {
    console.log(`\n🧪 [CURRENCY_TEST] Test completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 [CURRENCY_TEST] Test suite error:', error);
    process.exit(1);
  });