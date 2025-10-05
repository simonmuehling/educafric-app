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
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

// Custom error class for validation errors (400 status)
export class ValidationError extends Error {
  public status: number;
  public code: string;
  public expose: boolean;

  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = code;
    this.expose = true;
  }
}

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
    // ⚠️ SERVICE DÉSACTIVÉ - EN MAINTENANCE
    console.log('[Y-NOTE] ⚠️ Service MTN Mobile Money temporairement désactivé pour maintenance');
    
    // Déterminer l'environnement (sandbox par défaut)
    this.environment = process.env.MOMO_ENV || 'sandbox';
    this.callbackBase = process.env.BASE_URL || 'https://your-replit-app.replit.dev';
    
    // Configuration Y-Note DÉSACTIVÉE - Credentials vides pour bloquer les appels API
    this.config = {
      CLIENT_ID: '', // DÉSACTIVÉ
      CLIENT_SECRET: '', // DÉSACTIVÉ
      CUSTOMER_KEY: '', // DÉSACTIVÉ
      CUSTOMER_SECRET: '', // DÉSACTIVÉ
      TOKEN_URL: 'https://omapi-token.ynote.africa/oauth2/token',
      PAYMENT_URL: 'https://omapi.ynote.africa/prod/webpayment',
      STATUS_URL: 'https://omapi.ynote.africa/prod/webpaymentmtn/status'
    };
    
    // Service désactivé - pas d'initialisation nécessaire
    console.log('[Y-NOTE] 🔧 Service en maintenance - Les paiements MTN Mobile Money seront bientôt disponibles');
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
   * Valider et normaliser un numéro de téléphone MTN Cameroun
   * Utilise libphonenumber-js pour une validation robuste
   */
  public validateAndNormalizeMTNNumber(phoneNumber: string): { msisdn: string; e164: string } {
    // Nettoyer le numéro d'entrée
    const raw = phoneNumber.replace(/[^\d+]/g, ''); 
    
    // Parser avec libphonenumber-js (Cameroun par défaut)
    const pn = parsePhoneNumberFromString(raw, 'CM');
    
    if (!pn || !pn.isValid()) {
      throw new ValidationError(
        'Numéro de téléphone invalide. Utilisez le format +2376XXXXXXXX ou 6XXXXXXXX',
        'INVALID_PHONE_FORMAT'
      );
    }

    // Vérifier que c'est un numéro camerounais
    if (pn.country !== 'CM') {
      throw new ValidationError(
        'Seuls les numéros camerounais sont acceptés (+237)',
        'INVALID_COUNTRY'
      );
    }

    // Vérifier que c'est un numéro MTN (commence par 67, 65, 68)
    const nationalNumber = pn.nationalNumber;
    const mtnPrefixes = [
      '650', '651', '652', '653', '654',           // MTN ranges classiques
      '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', // MTN ranges 67X
      '680', '681', '682', '683'                   // MTN ranges 68X
    ];
    const isValidMTN = mtnPrefixes.some(prefix => nationalNumber.startsWith(prefix));
    
    if (!isValidMTN) {
      throw new ValidationError(
        'Ce numéro n\'est pas un numéro MTN Mobile Money valide (67X, 65X, 68X)',
        'INVALID_MTN_PREFIX'
      );
    }

    return {
      e164: pn.number,                           // "+2376XXXXXXXX" 
      msisdn: pn.number.replace(/^\+/, '')       // "2376XXXXXXXX" (pour Y-Note)
    };
  }

  /**
   * Méthode legacy pour compatibilité - utilise la nouvelle validation
   */
  public validateMTNNumber(phoneNumber: string): boolean {
    try {
      this.validateAndNormalizeMTNNumber(phoneNumber);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formater un numéro de téléphone pour l'API Y-Note
   * Y-Note accepte les numéros sans l'indicatif pays (format national)
   */
  public formatPhoneNumber(phoneNumber: string): string {
    const normalized = this.validateAndNormalizeMTNNumber(phoneNumber);
    // Y-Note veut le format national sans l'indicatif +237
    return normalized.msisdn.replace(/^237/, '');
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

      // Valider et normaliser le numéro MTN avec validation 400
      const phoneValidation = this.validateAndNormalizeMTNNumber(params.phoneNumber);
      const formattedPhone = phoneValidation.msisdn.replace(/^237/, ''); // Format national pour Y-Note
      
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