// ===== PAYMENT CONFIGURATION FOR MULTI-COUNTRY SUPPORT =====
// Supports: Mobile Money (Orange, MTN, Wave), Stripe

import { type CountryCode } from './countryConfig';

export type PaymentProvider = 'stripe' | 'orange_money' | 'mtn_mobile_money' | 'wave';

export interface PaymentMethodConfig {
  id: PaymentProvider;
  name: { fr: string; en: string };
  icon: string;
  available: boolean;
  description: { fr: string; en: string };
  fees: string;
  processingTime: { fr: string; en: string };
}

export interface CountryPaymentConfig {
  currency: string;
  currencySymbol: string;
  methods: PaymentMethodConfig[];
}

// Payment methods available per country
export const PAYMENT_CONFIGS: Record<CountryCode, CountryPaymentConfig> = {
  CM: {
    currency: 'XAF',
    currencySymbol: 'FCFA',
    methods: [
      {
        id: 'orange_money',
        name: { fr: 'Orange Money', en: 'Orange Money' },
        icon: '🟠',
        available: true,
        description: { 
          fr: 'Paiement mobile via Orange Money Cameroun', 
          en: 'Mobile payment via Orange Money Cameroon' 
        },
        fees: '1.5%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'mtn_mobile_money',
        name: { fr: 'MTN Mobile Money', en: 'MTN Mobile Money' },
        icon: '🟡',
        available: true,
        description: { 
          fr: 'Paiement mobile via MTN MoMo', 
          en: 'Mobile payment via MTN MoMo' 
        },
        fees: '1.5%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'stripe',
        name: { fr: 'Carte Bancaire', en: 'Credit Card' },
        icon: '💳',
        available: true,
        description: { 
          fr: 'Visa, Mastercard, American Express', 
          en: 'Visa, Mastercard, American Express' 
        },
        fees: '2.9% + 0.30€',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      }
    ]
  },
  CI: {
    currency: 'XOF',
    currencySymbol: 'FCFA',
    methods: [
      {
        id: 'orange_money',
        name: { fr: 'Orange Money', en: 'Orange Money' },
        icon: '🟠',
        available: true,
        description: { 
          fr: 'Paiement mobile via Orange Money CI', 
          en: 'Mobile payment via Orange Money CI' 
        },
        fees: '1.5%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'mtn_mobile_money',
        name: { fr: 'MTN Mobile Money', en: 'MTN Mobile Money' },
        icon: '🟡',
        available: true,
        description: { 
          fr: 'Paiement mobile via MTN MoMo CI', 
          en: 'Mobile payment via MTN MoMo CI' 
        },
        fees: '1.5%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'wave',
        name: { fr: 'Wave', en: 'Wave' },
        icon: '🌊',
        available: true,
        description: { 
          fr: 'Paiement mobile via Wave (sans frais)', 
          en: 'Mobile payment via Wave (no fees)' 
        },
        fees: '0%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'stripe',
        name: { fr: 'Carte Bancaire', en: 'Credit Card' },
        icon: '💳',
        available: true,
        description: { 
          fr: 'Visa, Mastercard, American Express', 
          en: 'Visa, Mastercard, American Express' 
        },
        fees: '2.9% + 0.30€',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      }
    ]
  },
  SN: {
    currency: 'XOF',
    currencySymbol: 'FCFA',
    methods: [
      {
        id: 'wave',
        name: { fr: 'Wave', en: 'Wave' },
        icon: '🌊',
        available: true,
        description: { 
          fr: 'Paiement mobile via Wave - Le plus populaire au Sénégal', 
          en: 'Mobile payment via Wave - Most popular in Senegal' 
        },
        fees: '0%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'orange_money',
        name: { fr: 'Orange Money', en: 'Orange Money' },
        icon: '🟠',
        available: true,
        description: { 
          fr: 'Paiement mobile via Orange Money Sénégal', 
          en: 'Mobile payment via Orange Money Senegal' 
        },
        fees: '1.5%',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      },
      {
        id: 'stripe',
        name: { fr: 'Carte Bancaire', en: 'Credit Card' },
        icon: '💳',
        available: true,
        description: { 
          fr: 'Visa, Mastercard, American Express', 
          en: 'Visa, Mastercard, American Express' 
        },
        fees: '2.9% + 0.30€',
        processingTime: { fr: 'Instantané', en: 'Instant' }
      }
    ]
  }
};

export function getPaymentConfig(countryCode: CountryCode): CountryPaymentConfig {
  return PAYMENT_CONFIGS[countryCode] || PAYMENT_CONFIGS['CM'];
}

export function getAvailablePaymentMethods(countryCode: CountryCode): PaymentMethodConfig[] {
  return getPaymentConfig(countryCode).methods.filter(m => m.available);
}

export function formatCurrency(amount: number, countryCode: CountryCode): string {
  const config = getPaymentConfig(countryCode);
  return `${amount.toLocaleString('fr-FR')} ${config.currencySymbol}`;
}

// Subscription plans with country-specific pricing
export interface SubscriptionPlan {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  features: { fr: string[]; en: string[] };
  pricing: Record<CountryCode, { monthly: number; yearly: number }>;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: { fr: 'Démarrage', en: 'Starter' },
    description: { 
      fr: 'Idéal pour les petites écoles',
      en: 'Ideal for small schools'
    },
    features: {
      fr: ['Jusqu\'à 100 élèves', 'Gestion des notes', 'Communication parents', 'Support email'],
      en: ['Up to 100 students', 'Grade management', 'Parent communication', 'Email support']
    },
    pricing: {
      CM: { monthly: 15000, yearly: 150000 },
      CI: { monthly: 15000, yearly: 150000 },
      SN: { monthly: 15000, yearly: 150000 }
    }
  },
  {
    id: 'professional',
    name: { fr: 'Professionnel', en: 'Professional' },
    description: { 
      fr: 'Pour les écoles en croissance',
      en: 'For growing schools'
    },
    features: {
      fr: ['Jusqu\'à 500 élèves', 'Toutes les fonctionnalités Starter', 'Bulletins scolaires', 'Emploi du temps', 'Géolocalisation', 'Support prioritaire'],
      en: ['Up to 500 students', 'All Starter features', 'Report cards', 'Timetable', 'Geolocation', 'Priority support']
    },
    pricing: {
      CM: { monthly: 35000, yearly: 350000 },
      CI: { monthly: 35000, yearly: 350000 },
      SN: { monthly: 35000, yearly: 350000 }
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: { fr: 'Entreprise', en: 'Enterprise' },
    description: { 
      fr: 'Pour les grandes institutions',
      en: 'For large institutions'
    },
    features: {
      fr: ['Élèves illimités', 'Toutes les fonctionnalités Pro', 'Multi-campus', 'API personnalisée', 'Formation sur site', 'Support dédié 24/7'],
      en: ['Unlimited students', 'All Pro features', 'Multi-campus', 'Custom API', 'On-site training', 'Dedicated 24/7 support']
    },
    pricing: {
      CM: { monthly: 75000, yearly: 750000 },
      CI: { monthly: 75000, yearly: 750000 },
      SN: { monthly: 75000, yearly: 750000 }
    }
  }
];

export function getPlanPricing(planId: string, countryCode: CountryCode, period: 'monthly' | 'yearly'): number {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) return 0;
  return plan.pricing[countryCode]?.[period] || plan.pricing['CM'][period];
}
