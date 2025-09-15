import { Router } from 'express';

const router = Router();

// Currency detection service
router.get('/detect', async (req, res) => {
  try {
    // Session debugging removed for security and performance
    
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`[CURRENCY_API] Currency detection request from IP: ${userIP}`);
    
    console.log(`[CURRENCY_SERVICE] Detecting location for IP: ${userIP}`);
    
    // For local development, default to Cameroon
    let countryCode = 'CM';
    let country = 'Cameroon';
    
    if (userIP === 'localhost' || userIP === '127.0.0.1' || userIP.startsWith('10.') || userIP.startsWith('192.168.')) {
      console.log(`[CURRENCY_SERVICE] Local IP detected, using Cameroon default`);
    } else {
      // In production, you would use a real IP geolocation service
      // For now, we'll use Cameroon as default for African users
      console.log(`[CURRENCY_SERVICE] External IP detected, using Cameroon default`);
    }

    // Map country to currency
    const currencyMap: Record<string, any> = {
      'CM': {
        currency: 'XAF',
        symbol: 'CFA',
        locale: 'fr-CM',
        exchangeRate: 1
      },
      'NG': {
        currency: 'NGN',
        symbol: '₦',
        locale: 'en-NG',
        exchangeRate: 0.0014 // Example rate to XAF
      },
      'GH': {
        currency: 'GHS',
        symbol: '₵',
        locale: 'en-GH',
        exchangeRate: 0.11 // Example rate to XAF
      },
      'SN': {
        currency: 'XOF',
        symbol: 'CFA',
        locale: 'fr-SN',
        exchangeRate: 1
      },
      'CI': {
        currency: 'XOF',
        symbol: 'CFA',
        locale: 'fr-CI',
        exchangeRate: 1
      },
      'KE': {
        currency: 'KES',
        symbol: 'KSh',
        locale: 'en-KE',
        exchangeRate: 5.5 // Example rate to XAF
      }
    };

    const currencyInfo = currencyMap[countryCode] || currencyMap['CM'];

    const response = {
      success: true,
      userIP,
      countryCode,
      country,
      ...currencyInfo,
      detectionTime: new Date().toISOString()
    };

    console.log(`[CURRENCY_API] ✅ Currency detected:`, {
      countryCode: response.countryCode,
      country: response.country,
      currency: response.currency,
      symbol: response.symbol,
      locale: response.locale,
      exchangeRate: response.exchangeRate
    });

    console.log(`[SECURITY_BYPASS] Event ignored: authentication from ${userIP}`);
    
    res.json(response);
  } catch (error) {
    console.error('[CURRENCY_API] Error detecting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect currency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get exchange rates
router.get('/rates', async (req, res) => {
  try {
    // In a real application, you would fetch from a currency API
    const rates = {
      XAF: { name: 'Central African CFA Franc', symbol: 'CFA', rate: 1 },
      XOF: { name: 'West African CFA Franc', symbol: 'CFA', rate: 1 },
      NGN: { name: 'Nigerian Naira', symbol: '₦', rate: 0.0014 },
      GHS: { name: 'Ghanaian Cedi', symbol: '₵', rate: 0.11 },
      KES: { name: 'Kenyan Shilling', symbol: 'KSh', rate: 5.5 },
      USD: { name: 'US Dollar', symbol: '$', rate: 0.0017 },
      EUR: { name: 'Euro', symbol: '€', rate: 0.0015 }
    };

    res.json({
      success: true,
      baseCurrency: 'XAF',
      rates,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CURRENCY_API] Error fetching exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exchange rates'
    });
  }
});

// Convert currency
router.post('/convert', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: amount, fromCurrency, toCurrency'
      });
    }

    // Simplified conversion rates (in production, use real exchange rate API)
    const rates: Record<string, number> = {
      'XAF': 1,
      'XOF': 1,
      'NGN': 0.0014,
      'GHS': 0.11,
      'KES': 5.5,
      'USD': 0.0017,
      'EUR': 0.0015
    };

    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported currency'
      });
    }

    // Convert to XAF first, then to target currency
    const xafAmount = amount / fromRate;
    const convertedAmount = xafAmount * toRate;

    res.json({
      success: true,
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      exchangeRate: toRate / fromRate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CURRENCY_API] Error converting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency'
    });
  }
});

export default router;