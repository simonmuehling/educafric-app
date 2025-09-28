/**
 * SERVICE MTN MOBILE MONEY - INTÉGRATION VIA Y-NOTE/PAYNOTE
 * 
 * Fonctionnalités:
 * - Webpaiement MTN via agrégateur Y-Note/Paynote Africa
 * - Popup USSD temps réel pour confirmation client
 * - Webhooks pour notifications de statut
 * - Validation des numéros MTN Cameroun
 * - Gestion OAuth2 avec Y-Note
 * 
 * Documentation: https://www.paynote.africa/comment-deployer-lapi-de-webpaiement-mtn-mobile-money/
 */

import axios, { AxiosResponse } from 'axios';

interface YNoteToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number; // Timestamp de création
}

interface YNoteWebPaymentRequest {
  API_MUT: {
    notifUrl: string;
    subscriberMsisdn: string;
    description: string;
    amount: string;
    order_id: string;
    customersecret: string;
    customerkey: string;
    PaiementMethod: 'MTN_CMR';
  };
}

interface YNoteWebPaymentResponse {
  ErrorCode: number;
  body: string;
  ErrorMessage: string;
  parameters: {
    operation: string;
    currency: string;
    amount: string;
    subscriberMsisdn: string;
    order_id: string;
    notifUrl: string;
  };
  CreateAt: string;
  MessageId: string;
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
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  paymentRef: string;
  amount: string;
  subscriberMsisdn: string;
}

export class MTNMobileMoneyService {
  private static instance: MTNMobileMoneyService;
  private token: YNoteToken | null = null;
  private readonly tokenUrl = 'https://omapi-token.ynote.africa/oauth2/token';
  private readonly webpaymentUrl = 'https://omapi.ynote.africa/prod/webpayment';
  private readonly statusUrl = 'https://omapi.ynote.africa/prod/webpaymentmtn/status';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly customerKey: string;
  private readonly customerSecret: string;

  private constructor() {
    // Y-Note credentials pour OAuth2
    this.clientId = process.env.MTN_CLIENT_ID || '';
    this.clientSecret = process.env.MTN_CLIENT_SECRET || '';
    
    // Y-Note customer credentials pour webpayment
    this.customerKey = process.env.MTN_CUSTOMER_KEY || '';
    this.customerSecret = process.env.MTN_CUSTOMER_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.error('[MTN] ❌ Y-Note OAuth2 credentials not found in environment variables');
      console.error('[MTN] 🔍 Expected: MTN_CLIENT_ID and MTN_CLIENT_SECRET');
      throw new Error('Y-Note OAuth2 credentials not configured');
    }
    
    if (!this.customerKey || !this.customerSecret) {
      console.error('[MTN] ❌ Y-Note customer credentials not found in environment variables');
      console.error('[MTN] 🔍 Expected: MTN_CUSTOMER_KEY and MTN_CUSTOMER_SECRET');
      throw new Error('Y-Note customer credentials not configured');
    }
    
    console.log('[MTN] ✅ Y-Note MTN service initialized with OAuth2 + Customer credentials');
    console.log(`[MTN] 🔑 Using Client ID: ${this.clientId.substring(0, 8)}...`);
    console.log(`[MTN] 🔑 Using Customer Key: ${this.customerKey.substring(0, 8)}...`);
  }

  public static getInstance(): MTNMobileMoneyService {
    if (!MTNMobileMoneyService.instance) {
      MTNMobileMoneyService.instance = new MTNMobileMoneyService();
    }
    return MTNMobileMoneyService.instance;
  }

  /**
   * Étape 1: Récupération de l'Access Token via OAuth2
   */
  private async getAccessToken(): Promise<string> {
    try {
      console.log('[MTN] 🔑 Requesting access token...');
      
      // Créer l'authentification Basic Auth (base64 encode)
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response: AxiosResponse<YNoteToken> = await axios.post(
        this.tokenUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
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
      
      console.log('[MTN] ✅ Access token obtained successfully');
      console.log(`[MTN] 📅 Token expires in: ${tokenData.expires_in} seconds`);
      
      return tokenData.access_token;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to get access token:', error.response?.data || error.message);
      throw new Error(`MTN authentication failed: ${error.response?.data?.error || error.message}`);
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
      console.log('[MTN] 🔄 Token expired or missing, refreshing...');
      return await this.getAccessToken();
    }
    
    return this.token.access_token;
  }

  /**
   * Collection API - Demander un paiement (paiement entrant)
   */
  public async requestPayment(request: MTNCollectionRequest): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💰 Requesting payment collection...');
      console.log(`[MTN] 📱 Phone: ${request.payer.phoneNumber}`);
      console.log(`[MTN] 💵 Amount: ${request.amount} ${request.currency}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.post(
        `${this.baseUrl}/v1/requesttopay`,
        {
          ...request,
          payerMessage: request.payerMessage || `Paiement EDUCAFRIC - ${request.externalId}`,
          payeeNote: request.payeeNote || 'Abonnement EDUCAFRIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Reference-Id': request.externalId,
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 30000
        }
      );
      
      console.log('[MTN] ✅ Payment request initiated successfully');
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Payment request failed:', error.response?.data || error.message);
      throw new Error(`MTN payment request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  public async checkPaymentStatus(referenceId: string): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log(`[MTN] 🔍 Checking payment status for: ${referenceId}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.get(
        `${this.baseUrl}/v1/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 10000
        }
      );
      
      console.log(`[MTN] 📊 Payment status: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to check payment status:', error.response?.data || error.message);
      throw new Error(`MTN status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Cashout API - Effectuer un paiement (paiement sortant)
   */
  public async sendPayment(request: MTNCashoutRequest): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💸 Sending payment (cashout)...');
      console.log(`[MTN] 📱 To: ${request.payee.phoneNumber}`);
      console.log(`[MTN] 💵 Amount: ${request.amount} ${request.currency}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.post(
        `${this.baseUrl}/v1/transfer`,
        {
          ...request,
          payerMessage: request.payerMessage || `Paiement EDUCAFRIC vers ${request.payee.phoneNumber}`,
          payeeNote: request.payeeNote || 'Paiement EDUCAFRIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Reference-Id': request.externalId,
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 30000
        }
      );
      
      console.log('[MTN] ✅ Payment sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Payment send failed:', error.response?.data || error.message);
      throw new Error(`MTN payment send failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtenir le solde du compte (si supporté par l'API)
   */
  public async getAccountBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💰 Checking account balance...');
      
      const response = await axios.get(
        `${this.baseUrl}/v1/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 10000
        }
      );
      
      console.log(`[MTN] 💰 Balance: ${response.data.balance} ${response.data.currency}`);
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to get balance:', error.response?.data || error.message);
      throw new Error(`MTN balance check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Valider un numéro de téléphone MTN
   */
  public validateMTNNumber(phoneNumber: string): boolean {
    // Numéros MTN Cameroun: 67X XXX XXX, 65X XXX XXX, 68X XXX XXX
    const mtnPrefixes = ['67', '65', '68'];
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.startsWith('237')) {
      return mtnPrefixes.some(prefix => cleanNumber.startsWith(`237${prefix}`));
    }
    
    return mtnPrefixes.some(prefix => cleanNumber.startsWith(prefix));
  }

  /**
   * Formater un numéro de téléphone pour l'API MTN
   */
  public formatPhoneNumber(phoneNumber: string): string {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Ajouter l'indicatif pays si manquant
    if (!cleanNumber.startsWith('237')) {
      cleanNumber = '237' + cleanNumber;
    }
    
    return cleanNumber;
  }

  /**
   * Générer un ID externe unique pour les transactions
   */
  public generateExternalId(prefix: string = 'EDU'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Créer un paiement d'abonnement via Y-Note Webpayment
   * Déclenche un popup USSD sur le téléphone MTN du client
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
    messageId?: string;
    instructions?: string;
    error?: string;
  }> {
    try {
      console.log('[MTN] 🚀 Creating Y-Note webpayment:', {
        amount: params.amount,
        currency: params.currency,
        planName: params.planName,
        phoneNumber: params.phoneNumber
      });

      // Valider le numéro MTN
      if (!this.validateMTNNumber(params.phoneNumber)) {
        throw new Error('Numéro de téléphone MTN invalide');
      }

      // Formater le numéro (sans indicatif selon doc Y-Note)
      const formattedPhone = params.phoneNumber.replace(/[\s\-\+]/g, '').replace(/^237/, '');
      
      // Générer un ID de commande unique
      const orderId = this.generateExternalId('SUB');
      
      // Obtenir un token valide
      const accessToken = await this.ensureValidToken();

      // Créer la demande de webpayment Y-Note
      const webpaymentRequest: YNoteWebPaymentRequest = {
        API_MUT: {
          notifUrl: params.callbackUrl,
          subscriberMsisdn: formattedPhone,
          description: `Abonnement EDUCAFRIC - ${params.planName}`,
          amount: params.amount.toString(), // Doit être une string selon doc
          order_id: orderId,
          customersecret: this.customerSecret,
          customerkey: this.customerKey,
          PaiementMethod: 'MTN_CMR'
        }
      };

      console.log('[MTN] 📤 Sending webpayment request to Y-Note...');
      
      const response = await axios.post<YNoteWebPaymentResponse>(
        this.webpaymentUrl,
        webpaymentRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      const data = response.data;
      
      if (data.ErrorCode === 200) {
        console.log('[MTN] ✅ Webpayment request accepted');
        console.log(`[MTN] 📱 USSD popup triggered on: ${params.phoneNumber}`);
        console.log(`[MTN] 🆔 Message ID: ${data.MessageId}`);

        return {
          success: true,
          transactionId: orderId,
          messageId: data.MessageId,
          instructions: `Un popup USSD a été envoyé sur votre téléphone MTN (${params.phoneNumber}). Suivez les instructions à l'écran pour confirmer le paiement de ${params.amount} XAF en saisissant votre code PIN MTN.`
        };
      } else {
        throw new Error(data.ErrorMessage || `Erreur Y-Note: ${data.ErrorCode} - ${data.body}`);
      }
    } catch (error: any) {
      console.error('[MTN] ❌ Error creating Y-Note webpayment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du webpayment Y-Note'
      };
    }
  }

  /**
   * Test de connectivité avec l'API MTN
   */
  public async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      console.log('[MTN] ✅ Connection test successful');
      return true;
    } catch (error) {
      console.error('[MTN] ❌ Connection test failed:', error);
      return false;
    }
  }
}

// Exporter l'instance singleton
export const mtnService = MTNMobileMoneyService.getInstance();