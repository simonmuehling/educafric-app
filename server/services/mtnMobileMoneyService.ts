/**
 * SERVICE Y-NOTE MTN MOBILE MONEY - API OFFICIELLE
 * 
 * Fonctionnalités:
 * - API Y-Note pour MTN Mobile Money Cameroun
 * - Authentification OAuth2 avec client credentials
 * - Support des paiements web MTN_CMR
 * - Webhook pour notifications de paiement
 * - Vérification de statut des transactions
 * 
 * Documentation: https://omapi.ynote.africa/
 */

import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';

interface YNoteAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number; // Timestamp de création
}

interface YNotePaymentRequest {
  API_MUT: {
    notifUrl: string;
    subscriberMsisdn: string;
    description: string;
    amount: string;
    order_id: string;
    customersecret: string;
    customerkey: string;
    PaiementMethod: string;
  };
}

interface YNotePaymentResponse {
  ErrorCode: number;
  body: string;
  parameters?: {
    operation: string;
    currency: string;
    amount: string;
    subscriberMsisdn: string;
    order_id: string;
    notifUrl: string;
  };
  MessageId: string;
  status: string;
}

interface YNoteStatusRequest {
  customerkey: string;
  customersecret: string;
  message_id: string;
}

interface YNoteStatusResponse {
  updateDate: string;
  currency: string;
  operation: string;
  notifUrl: string;
  paytoken: string;
  status: string;
  paymentRef: string;
  message: string;
  creationDate: string;
  customer_key: string;
  request_id: string;
  amount: string;
  subscriberMsisdn: string;
}

interface YNoteEnvironmentConfig {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  CUSTOMER_KEY: string;
  CUSTOMER_SECRET: string;
  TOKEN_URL: string;
  PAYMENT_URL: string;
  STATUS_URL: string;
}

export class MTNMobileMoneyService {
  private static instance: MTNMobileMoneyService;
  private token: YNoteAccessToken | null = null;
  private readonly environment: string;
  private readonly config: YNoteEnvironmentConfig;
  private readonly callbackBase: string;

  private constructor() {
    // Déterminer l'environnement (sandbox par défaut)
    this.environment = process.env.MOMO_ENV || 'sandbox';
    this.callbackBase = process.env.BASE_URL || 'https://your-replit-app.replit.dev';
    
    // Configuration Y-Note (même endpoints pour sandbox et production)
    this.config = {
      CLIENT_ID: process.env.MOMO_USER_ID || process.env.MTN_CLIENT_ID || '',
      CLIENT_SECRET: process.env.MOMO_API_KEY || process.env.MTN_CLIENT_SECRET || '',
      CUSTOMER_KEY: process.env.MOMO_SUBSCRIPTION_KEY || process.env.MTN_CUSTOMER_KEY || '',
      CUSTOMER_SECRET: process.env.MOMO_CUSTOMER_SECRET || process.env.MTN_CUSTOMER_SECRET || '',
      TOKEN_URL: 'https://omapi-token.ynote.africa/oauth2/token',
      PAYMENT_URL: 'https://omapi.ynote.africa/prod/webpayment',
      STATUS_URL: 'https://omapi.ynote.africa/prod/webpaymentmtn/status'
    };
    
    // Validation des credentials
    if (!this.config.CLIENT_ID || !this.config.CLIENT_SECRET || !this.config.CUSTOMER_KEY || !this.config.CUSTOMER_SECRET) {
      console.error('[Y-NOTE] ❌ Y-Note credentials not found for environment:', this.environment);
      console.error('[Y-NOTE] 🔍 Expected variables:');
      console.error('[Y-NOTE] - MOMO_USER_ID (or MTN_CLIENT_ID) - ClientId');
      console.error('[Y-NOTE] - MOMO_API_KEY (or MTN_CLIENT_SECRET) - ClientSecret');
      console.error('[Y-NOTE] - MOMO_SUBSCRIPTION_KEY (or MTN_CUSTOMER_KEY) - CustomerKey');
      console.error('[Y-NOTE] - MOMO_CUSTOMER_SECRET (or MTN_CUSTOMER_SECRET) - CustomerSecret');
      throw new Error(`Y-Note MTN credentials not configured for ${this.environment}`);
    }
    
    console.log(`[Y-NOTE] ✅ Y-Note MTN Mobile Money API initialized (${this.environment})`);
    console.log(`[Y-NOTE] 🔗 Token URL: ${this.config.TOKEN_URL}`);
    console.log(`[Y-NOTE] 🔗 Payment URL: ${this.config.PAYMENT_URL}`);
    console.log(`[Y-NOTE] 🔑 Client ID: ${this.config.CLIENT_ID.substring(0, 8)}...`);
    console.log(`[Y-NOTE] 🔑 Customer Key: ${this.config.CUSTOMER_KEY.substring(0, 8)}...`);
  }

  public static getInstance(): MTNMobileMoneyService {
    if (!MTNMobileMoneyService.instance) {
      MTNMobileMoneyService.instance = new MTNMobileMoneyService();
    }
    return MTNMobileMoneyService.instance;
  }

  /**
   * Étape 1: Récupération de l'Access Token Y-Note
   * Utilise Basic Auth avec CLIENT_ID:CLIENT_SECRET
   */
  private async getAccessToken(): Promise<string> {
    try {
      console.log('[Y-NOTE] 🔑 Requesting access token...');
      
      // Créer l'authentification Basic Auth (CLIENT_ID:CLIENT_SECRET)
      const credentials = Buffer.from(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`).toString('base64');
      
      const response: AxiosResponse<YNoteAccessToken> = await axios.post(
        this.config.TOKEN_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      const tokenData = response.data;
      
      // Stocker le token avec timestamp
      this.token = {
        ...tokenData,
        created_at: Date.now()
      };
      
      console.log('[Y-NOTE] ✅ Access token obtained successfully');
      console.log(`[Y-NOTE] 📅 Token expires in: ${tokenData.expires_in} seconds`);
      
      return tokenData.access_token;
    } catch (error: any) {
      console.error('[Y-NOTE] ❌ Failed to get access token:', error.response?.data || error.message);
      throw new Error(`Y-Note authentication failed: ${error.response?.data || error.message}`);
    }
  }

  /**
   * Vérifier si le token est valide ou le renouveler
   */
  private async ensureValidToken(): Promise<string> {
    const now = Date.now();
    const tokenExpiryBuffer = 300; // 5 minutes avant expiration
    
    if (!this.token || 
        (now - this.token.created_at) / 1000 > (this.token.expires_in - tokenExpiryBuffer)) {
      console.log('[Y-NOTE] 🔄 Token expired or missing, refreshing...');
      return await this.getAccessToken();
    }
    
    return this.token.access_token;
  }

  /**
   * Valider un numéro de téléphone MTN Cameroun
   */
  public validateMTNNumber(phoneNumber: string): boolean {
    // Nettoyer le numéro
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Patterns MTN Cameroun (avec et sans indicatif +237)
    const mtnPatterns = [
      /^237(677|678|679|650|651|652|653|654|680|681|682|683)\d{6}$/, // Avec indicatif
      /^(677|678|679|650|651|652|653|654|680|681|682|683)\d{6}$/     // Sans indicatif
    ];
    
    return mtnPatterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Formater un numéro de téléphone pour l'API Y-Note
   * Y-Note accepte les numéros sans l'indicatif pays
   */
  public formatPhoneNumber(phoneNumber: string): string {
    // Nettoyer et standardiser le format
    let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Supprimer l'indicatif 237 si présent
    if (cleaned.startsWith('237') && cleaned.length === 12) {
      cleaned = cleaned.substring(3);
    }
    
    return cleaned;
  }

  /**
   * Générer un ID de commande unique pour les transactions
   */
  private generateOrderId(prefix: string = 'EDU'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Étape 2: Créer un paiement d'abonnement via Y-Note Web Payment
   * Utilise l'API Y-Note pour déclencher un paiement MTN Mobile Money
   */
  public async createSubscriptionPayment(params: {
    amount: number;
    currency: string;
    planName: string;
    phoneNumber: string;
    callbackUrl: string;
    returnUrl: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    txRef?: string;
    messageId?: string;
    instructions?: string;
    error?: string;
  }> {
    try {
      console.log('[Y-NOTE] 🚀 Creating Y-Note MTN payment:', {
        amount: params.amount,
        currency: params.currency,
        planName: params.planName,
        phoneNumber: params.phoneNumber,
        environment: this.environment
      });

      // Valider le numéro MTN
      if (!this.validateMTNNumber(params.phoneNumber)) {
        throw new Error('Numéro de téléphone MTN invalide');
      }

      // Formater le numéro (sans indicatif pour Y-Note)
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
      
      // Générer un ID de commande unique
      const orderId = this.generateOrderId('SUB');
      
      // Obtenir un token valide
      const accessToken = await this.ensureValidToken();

      // Créer la demande de paiement Y-Note selon la documentation
      const paymentRequest: YNotePaymentRequest = {
        API_MUT: {
          notifUrl: params.callbackUrl,
          subscriberMsisdn: formattedPhone,
          description: `Abonnement EDUCAFRIC - ${params.planName}`,
          amount: params.amount.toString(),
          order_id: orderId,
          customersecret: this.config.CUSTOMER_SECRET,
          customerkey: this.config.CUSTOMER_KEY,
          PaiementMethod: 'MTN_CMR'
        }
      };

      console.log('[Y-NOTE] 📤 Sending payment request to Y-Note API...');
      console.log(`[Y-NOTE] 📱 Phone: ${formattedPhone}, Amount: ${params.amount} ${params.currency}`);
      console.log(`[Y-NOTE] 🆔 Order ID: ${orderId}`);
      
      const response = await axios.post<YNotePaymentResponse>(
        this.config.PAYMENT_URL,
        paymentRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const paymentData = response.data;

      if (paymentData.ErrorCode === 200 && (paymentData.status === 'SUCCESSFUL' || paymentData.body?.includes('Pay Request Accepted'))) {
        console.log('[Y-NOTE] ✅ Payment request accepted by Y-Note');
        console.log(`[Y-NOTE] 📱 MTN payment request sent to: ${params.phoneNumber}`);
        console.log(`[Y-NOTE] 🆔 Message ID: ${paymentData.MessageId}`);
        console.log(`[Y-NOTE] 🔗 Order ID: ${orderId}`);

        return {
          success: true,
          transactionId: orderId,
          txRef: paymentData.MessageId,
          messageId: paymentData.MessageId,
          instructions: `Une demande de paiement MTN Mobile Money a été envoyée sur votre téléphone (${params.phoneNumber}). Vérifiez votre téléphone et suivez les instructions pour confirmer le paiement de ${params.amount} ${params.currency}.`
        };
      } else {
        throw new Error(`Y-Note payment request failed (${paymentData.ErrorCode}): ${paymentData.body || paymentData.status}`);
      }
    } catch (error: any) {
      console.error('[Y-NOTE] ❌ Error creating payment request:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du paiement Y-Note'
      };
    }
  }

  /**
   * Vérifier le statut d'une transaction Y-Note
   */
  public async getTransactionStatus(messageId: string): Promise<{
    success: boolean;
    status?: string;
    transaction?: YNoteStatusResponse;
    error?: string;
  }> {
    try {
      console.log(`[Y-NOTE] 🔍 Checking transaction status: ${messageId}`);
      
      const accessToken = await this.ensureValidToken();
      
      const statusRequest: YNoteStatusRequest = {
        customerkey: this.config.CUSTOMER_KEY,
        customersecret: this.config.CUSTOMER_SECRET,
        message_id: messageId
      };
      
      const response = await axios.post<YNoteStatusResponse>(
        this.config.STATUS_URL,
        statusRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const transaction = response.data;
      
      console.log(`[Y-NOTE] 📊 Transaction status: ${transaction.status}`);
      
      return {
        success: true,
        status: transaction.status,
        transaction: transaction
      };
    } catch (error: any) {
      console.error('[Y-NOTE] ❌ Error checking transaction status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du statut'
      };
    }
  }

  /**
   * Test de connectivité avec l'API Y-Note
   */
  public async testConnection(): Promise<boolean> {
    try {
      console.log('[Y-NOTE] 🧪 Testing Y-Note API connection...');
      
      // Tenter d'obtenir un token pour valider la connectivité
      const token = await this.getAccessToken();
      
      if (token) {
        console.log('[Y-NOTE] ✅ Connection test successful');
        return true;
      } else {
        console.log('[Y-NOTE] ❌ Connection test failed - no token received');
        return false;
      }
    } catch (error: any) {
      console.error('[Y-NOTE] ❌ Connection test failed:', error.message);
      return false;
    }
  }
}

// Export du service singleton
export const mtnService = MTNMobileMoneyService.getInstance();