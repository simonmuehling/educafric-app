/**
 * Payment Method Service - Country-specific payment options
 * Provides localized payment methods based on user location
 * 
 * PAYMENT POLICY:
 * - Cameroon (CM): Full payment options (Mobile Money, Bank Transfer, Credit Card)
 * - All Other Countries: Credit Card only for international consistency
 */

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'card' | 'cash' | 'crypto';
  provider: string;
  icon: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  currency: string;
  enabled: boolean;
  instructions?: string;
}

interface CountryPaymentConfig {
  country: string;
  countryCode: string;
  currency: string;
  methods: PaymentMethod[];
  preferredMethods: string[];
  notes?: string;
}

class PaymentMethodService {
  private countryConfigs: CountryPaymentConfig[] = [
    // Cameroon (XAF)
    {
      country: 'Cameroon',
      countryCode: 'CM',
      currency: 'XAF',
      preferredMethods: ['orange-money', 'afriland-bank', 'express-union'],
      methods: [
        {
          id: 'orange-money',
          name: 'Orange Money',
          type: 'mobile_money',
          provider: 'Orange',
          icon: '🟠',
          fees: { percentage: 0.5, fixed: 0 },
          processingTime: 'Instantané',
          currency: 'XAF',
          enabled: true,
          instructions: 'Composez #150# → Paiement → Marchand → Code: EDUCAFRIC'
        },

        {
          id: 'afriland-bank',
          name: 'Afriland First Bank',
          type: 'bank_transfer',
          provider: 'Afriland First Bank',
          icon: '🏦',
          fees: { percentage: 0, fixed: 1000 },
          processingTime: '1-2 jours ouvrables',
          currency: 'XAF',
          enabled: true,
          instructions: 'RIB: CM21 10005 00001 12365478901 28'
        },
        {
          id: 'express-union',
          name: 'Express Union',
          type: 'mobile_money',
          provider: 'Express Union',
          icon: '💰',
          fees: { percentage: 1.0, fixed: 0 },
          processingTime: 'Instantané',
          currency: 'XAF',
          enabled: true
        },
        {
          id: 'stripe-card',
          name: 'Carte Bancaire',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 2.9, fixed: 0 },
          processingTime: 'Instantané',
          currency: 'XAF',
          enabled: true
        }
      ]
    },

    // Nigeria (NGN) - Credit Card Only
    {
      country: 'Nigeria',
      countryCode: 'NG',
      currency: 'NGN',
      preferredMethods: ['stripe-card'],
      methods: [
        {
          id: 'stripe-card',
          name: 'Credit/Debit Card',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 3.9, fixed: 0 },
          processingTime: 'Instant',
          currency: 'NGN',
          enabled: true,
          instructions: 'Secure international card payment via Stripe'
        }
      ]
    },

    // Ghana (GHS) - Credit Card Only
    {
      country: 'Ghana',
      countryCode: 'GH',
      currency: 'GHS',
      preferredMethods: ['stripe-card'],
      methods: [
        {
          id: 'stripe-card',
          name: 'Credit/Debit Card',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 3.9, fixed: 0 },
          processingTime: 'Instant',
          currency: 'GHS',
          enabled: true,
          instructions: 'Secure international card payment via Stripe'
        }
      ]
    },

    // Kenya (KES) - Credit Card Only
    {
      country: 'Kenya',
      countryCode: 'KE',
      currency: 'KES',
      preferredMethods: ['stripe-card'],
      methods: [
        {
          id: 'stripe-card',
          name: 'Credit/Debit Card',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 3.9, fixed: 0 },
          processingTime: 'Instant',
          currency: 'KES',
          enabled: true,
          instructions: 'Secure international card payment via Stripe'
        }
      ]
    },

    // South Africa (ZAR) - Credit Card Only
    {
      country: 'South Africa',
      countryCode: 'ZA',
      currency: 'ZAR',
      preferredMethods: ['stripe-card'],
      methods: [
        {
          id: 'stripe-card',
          name: 'Credit/Debit Card',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 3.9, fixed: 0 },
          processingTime: 'Instant',
          currency: 'ZAR',
          enabled: true,
          instructions: 'Secure international card payment via Stripe'
        }
      ]
    },

    // International/Default (USD/EUR)
    {
      country: 'International',
      countryCode: 'INTL',
      currency: 'USD',
      preferredMethods: ['stripe-card', 'paypal', 'crypto'],
      methods: [
        {
          id: 'stripe-card',
          name: 'Credit/Debit Card',
          type: 'card',
          provider: 'Stripe',
          icon: '💳',
          fees: { percentage: 2.9, fixed: 0.30 },
          processingTime: 'Instant',
          currency: 'USD',
          enabled: true
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'card',
          provider: 'PayPal',
          icon: '🅿️',
          fees: { percentage: 3.49, fixed: 0.49 },
          processingTime: 'Instant',
          currency: 'USD',
          enabled: true
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          type: 'crypto',
          provider: 'Various',
          icon: '₿',
          fees: { percentage: 1.0, fixed: 0 },
          processingTime: '10-60 minutes',
          currency: 'USD',
          enabled: false,
          instructions: 'Bitcoin, Ethereum, USDC accepted'
        }
      ]
    }
  ];

  /**
   * Get payment methods for a specific country
   */
  getPaymentMethodsByCountry(countryCode: string): CountryPaymentConfig | null {
    const config = this.countryConfigs.find(
      config => config.countryCode === countryCode
    );
    
    if (!config) {
      // Return international options as fallback
      return this.countryConfigs.find(config => config.countryCode === 'INTL') || null;
    }
    
    return config;
  }

  /**
   * Get payment methods by currency
   */
  getPaymentMethodsByCurrency(currency: string): PaymentMethod[] {
    const allMethods: PaymentMethod[] = [];
    
    this.countryConfigs.forEach(config => {
      if (config.currency === currency) {
        allMethods.push(...config.methods);
      }
    });
    
    return allMethods;
  }

  /**
   * Get preferred payment methods for a country
   */
  getPreferredMethods(countryCode: string): PaymentMethod[] {
    const config = this.getPaymentMethodsByCountry(countryCode);
    if (!config) return [];
    
    return config.methods.filter(method => 
      config.preferredMethods.includes(method.id) && method.enabled
    );
  }

  /**
   * Calculate fees for a payment method
   */
  calculateFees(methodId: string, amount: number, currency: string): {
    amount: number;
    fees: number;
    total: number;
  } {
    const allMethods = this.countryConfigs.flatMap(config => config.methods);
    const method = allMethods.find(m => m.id === methodId);
    
    if (!method) {
      return { amount, fees: 0, total: amount };
    }
    
    const percentageFee = (amount * method.fees.percentage) / 100;
    const totalFees = percentageFee + method.fees.fixed;
    
    return {
      amount,
      fees: totalFees,
      total: amount + totalFees
    };
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): { code: string; name: string; currency: string }[] {
    return this.countryConfigs
      .filter(config => config.countryCode !== 'INTL')
      .map(config => ({
        code: config.countryCode,
        name: config.country,
        currency: config.currency
      }));
  }

  /**
   * Check if a payment method is available in a country
   */
  isMethodAvailable(methodId: string, countryCode: string): boolean {
    const config = this.getPaymentMethodsByCountry(countryCode);
    if (!config) return false;
    
    const method = config.methods.find(m => m.id === methodId);
    return method ? method.enabled : false;
  }

  /**
   * Get method-specific instructions
   */
  getPaymentInstructions(methodId: string, countryCode: string): string | null {
    const config = this.getPaymentMethodsByCountry(countryCode);
    if (!config) return null;
    
    const method = config.methods.find(m => m.id === methodId);
    return method?.instructions || null;
  }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;