/**
 * SERVICE PAYNOTE ORANGE MONEY - API OFFICIELLE
 * 
 * Fonctionnalités:
 * - API PayNote pour Orange Money Cameroun
 * - Authentification OAuth2 avec client credentials
 * - Support des paiements Cashin (réception)
 * - Webhook pour notifications de paiement
 * - Vérification de statut des transactions
 * 
 * Documentation: https://www.paynote.africa/documentation-paynote.html
 */

import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

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

interface PayNoteAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
}

interface PayNotePaymentRequest {
  amount: string;
  subscriberMsisdn: string;
  notifUrl: string;
  description: string;
  order_id: string;
  customerkey: string;
  customersecret: string;
}

interface PayNotePaymentResponse {
  status: string;
  message: string;
  data?: {
    payToken?: string;
    payment_url?: string;
    order_id: string;
    transaction_id?: string;
  };
  error?: string;
}

interface PayNoteStatusResponse {
  status: string;
  message: string;
  data?: {
    transaction_id: string;
    order_id: string;
    amount: string;
    subscriberMsisdn: string;
    payment_status: 'PENDING' | 'SUCCESSFULL' | 'FAILED' | 'CANCELLED';
    payment_date?: string;
  };
}

interface PayNoteEnvironmentConfig {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  CUSTOMER_KEY: string;
  CUSTOMER_SECRET: string;
  TOKEN_URL: string;
  PAYMENT_URL: string;
  STATUS_URL: string;
}

export class OrangeMoneyService {
  private static instance: OrangeMoneyService;
  private token: PayNoteAccessToken | null = null;
  private readonly environment: string;
  private readonly config: PayNoteEnvironmentConfig;
  private readonly callbackBase: string;
  private isEnabled: boolean = false;

  private constructor() {
    this.environment = process.env.ORANGE_MONEY_ENV || 'sandbox';
    this.callbackBase = process.env.BASE_URL || 'https://educafric.com';
    
    const clientId = process.env.ORANGE_MONEY_CLIENT_ID || '';
    const clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET || '';
    const customerKey = process.env.ORANGE_MONEY_CUSTOMER_KEY || '';
    const customerSecret = process.env.ORANGE_MONEY_CUSTOMER_SECRET || '';
    
    this.isEnabled = !!(clientId && clientSecret && customerKey && customerSecret);
    
    this.config = {
      CLIENT_ID: clientId,
      CLIENT_SECRET: clientSecret,
      CUSTOMER_KEY: customerKey,
      CUSTOMER_SECRET: customerSecret,
      TOKEN_URL: 'https://omapi-token.ynote.africa/oauth2/token',
      PAYMENT_URL: 'https://api-s1.orange.cm/omcoreapis/1.0.2/mp/push/ussd',
      STATUS_URL: 'https://api-s1.orange.cm/omcoreapis/1.0.2/mp/paymentstatus'
    };
    
    if (this.isEnabled) {
      console.log('[ORANGE_MONEY] ✅ Service initialized');
      console.log(`[ORANGE_MONEY] Environment: ${this.environment}`);
    } else {
      console.log('[ORANGE_MONEY] ⚠️ Service disabled - missing credentials');
    }
  }

  public static getInstance(): OrangeMoneyService {
    if (!OrangeMoneyService.instance) {
      OrangeMoneyService.instance = new OrangeMoneyService();
    }
    return OrangeMoneyService.instance;
  }

  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('[ORANGE_MONEY] Service non configuré - credentials manquants');
    }

    if (this.token && this.isTokenValid()) {
      return this.token.access_token;
    }

    try {
      console.log('[ORANGE_MONEY] Requesting new access token...');
      
      const credentials = Buffer.from(
        `${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`
      ).toString('base64');

      const response: AxiosResponse = await axios.post(
        this.config.TOKEN_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      this.token = {
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'Bearer',
        expires_in: response.data.expires_in || 3600,
        created_at: Date.now()
      };

      console.log('[ORANGE_MONEY] ✅ Access token obtained successfully');
      return this.token.access_token;
    } catch (error: any) {
      console.error('[ORANGE_MONEY] ❌ Token request failed:', error.message);
      throw new Error('Échec de l\'authentification Orange Money');
    }
  }

  private isTokenValid(): boolean {
    if (!this.token) return false;
    const expirationTime = this.token.created_at + (this.token.expires_in * 1000) - 60000;
    return Date.now() < expirationTime;
  }

  public validatePhoneNumber(phone: string): { valid: boolean; formatted: string; error?: string } {
    try {
      const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
      const phoneNumber = parsePhoneNumberFromString(cleanPhone, 'CM');
      
      if (!phoneNumber || !phoneNumber.isValid()) {
        return { valid: false, formatted: '', error: 'Numéro de téléphone invalide' };
      }

      const nationalNumber = phoneNumber.nationalNumber;
      
      if (!nationalNumber.startsWith('69') && !nationalNumber.startsWith('65') && !nationalNumber.startsWith('66')) {
        return { 
          valid: false, 
          formatted: '', 
          error: 'Ce numéro n\'est pas un numéro Orange Money (doit commencer par 69, 65 ou 66)' 
        };
      }

      const formatted = `237${nationalNumber}`;
      return { valid: true, formatted };
    } catch (error) {
      return { valid: false, formatted: '', error: 'Format de numéro invalide' };
    }
  }

  public generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `OM-${timestamp}-${random}`.toUpperCase();
  }

  public async initiatePayment(params: {
    phoneNumber: string;
    amount: number;
    description: string;
    orderId?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    orderId: string;
    transactionId?: string;
    payToken?: string;
    message: string;
    error?: string;
  }> {
    if (!this.isEnabled) {
      return {
        success: false,
        orderId: '',
        message: 'Service Orange Money non disponible',
        error: 'SERVICE_DISABLED'
      };
    }

    const validation = this.validatePhoneNumber(params.phoneNumber);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Numéro invalide', 'INVALID_PHONE');
    }

    if (params.amount < 100) {
      throw new ValidationError('Le montant minimum est de 100 FCFA', 'AMOUNT_TOO_LOW');
    }

    if (params.amount > 1000000) {
      throw new ValidationError('Le montant maximum est de 1,000,000 FCFA', 'AMOUNT_TOO_HIGH');
    }

    const orderId = params.orderId || this.generateOrderId();
    const notifUrl = `${this.callbackBase}/api/payments/orange-money/webhook`;

    try {
      const accessToken = await this.getAccessToken();

      console.log(`[ORANGE_MONEY] Initiating payment: ${orderId} - ${params.amount} FCFA`);

      const response: AxiosResponse = await axios.post(
        this.config.PAYMENT_URL,
        {
          subscriberMsisdn: validation.formatted,
          amount: params.amount.toString(),
          description: params.description || 'Paiement Educafric',
          order_id: orderId,
          notifUrl: notifUrl,
          customerkey: this.config.CUSTOMER_KEY,
          customersecret: this.config.CUSTOMER_SECRET
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('[ORANGE_MONEY] Payment response:', JSON.stringify(response.data));

      if (response.data.status === 'PENDING' || response.data.status === 'INITIATED') {
        return {
          success: true,
          orderId: orderId,
          transactionId: response.data.data?.transaction_id,
          payToken: response.data.data?.payToken,
          message: 'Paiement initié. Validez sur votre téléphone Orange Money.'
        };
      } else {
        return {
          success: false,
          orderId: orderId,
          message: response.data.message || 'Échec de l\'initiation du paiement',
          error: response.data.error || 'PAYMENT_FAILED'
        };
      }
    } catch (error: any) {
      console.error('[ORANGE_MONEY] Payment error:', error.response?.data || error.message);
      
      return {
        success: false,
        orderId: orderId,
        message: 'Erreur lors de l\'initiation du paiement Orange Money',
        error: error.response?.data?.error || error.message
      };
    }
  }

  public async checkPaymentStatus(orderId: string): Promise<{
    status: 'PENDING' | 'SUCCESSFULL' | 'FAILED' | 'CANCELLED' | 'UNKNOWN';
    message: string;
    transactionId?: string;
    amount?: string;
    paymentDate?: string;
  }> {
    if (!this.isEnabled) {
      return { status: 'UNKNOWN', message: 'Service non disponible' };
    }

    try {
      const accessToken = await this.getAccessToken();

      const response: AxiosResponse<PayNoteStatusResponse> = await axios.get(
        `${this.config.STATUS_URL}/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            customerkey: this.config.CUSTOMER_KEY,
            customersecret: this.config.CUSTOMER_SECRET
          },
          timeout: 30000
        }
      );

      const data = response.data.data;
      
      return {
        status: data?.payment_status || 'UNKNOWN',
        message: response.data.message || 'Statut récupéré',
        transactionId: data?.transaction_id,
        amount: data?.amount,
        paymentDate: data?.payment_date
      };
    } catch (error: any) {
      console.error('[ORANGE_MONEY] Status check error:', error.message);
      return { status: 'UNKNOWN', message: 'Erreur lors de la vérification du statut' };
    }
  }

  public verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.isEnabled) return false;
    
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.CUSTOMER_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('[ORANGE_MONEY] Signature verification failed:', error);
      return false;
    }
  }

  public async processWebhook(payload: any): Promise<{
    success: boolean;
    orderId: string;
    status: string;
    amount?: number;
    transactionId?: string;
  }> {
    console.log('[ORANGE_MONEY] Processing webhook:', JSON.stringify(payload));

    const orderId = payload.order_id || payload.orderId || payload.data?.order_id;
    const status = payload.status || payload.payment_status || payload.data?.status;
    const amount = parseInt(payload.amount || payload.data?.amount || '0', 10);
    const transactionId = payload.transaction_id || payload.data?.transaction_id;

    return {
      success: status === 'SUCCESSFULL' || status === 'SUCCESS',
      orderId: orderId,
      status: status,
      amount: amount,
      transactionId: transactionId
    };
  }
}

export const orangeMoneyService = OrangeMoneyService.getInstance();
