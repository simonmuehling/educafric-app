import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';

// Load Stripe - with fallback to prevent errors
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log('[PAYMENT_DEBUG] Stripe key configured:', !!stripeKey);
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface OnlineClassPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  durationType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semestral' | 'yearly';
  amount: number;
  language: 'fr' | 'en';
}

function StripePaymentForm({ durationType, amount, onSuccess, language }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/teacher`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: language === 'fr' ? 'Paiement échoué' : 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'fr' ? 'Paiement réussi!' : 'Payment Successful!',
          description: language === 'fr' 
            ? 'Votre accès aux cours en ligne a été activé.' 
            : 'Your online classes access has been activated.',
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-confirm-stripe-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'fr' ? 'Traitement...' : 'Processing...'}
          </>
        ) : (
          <>
            {language === 'fr' ? `Payer ${amount.toLocaleString('fr-FR')} CFA` : `Pay ${amount.toLocaleString('fr-FR')} CFA`}
          </>
        )}
      </Button>
    </form>
  );
}

export function OnlineClassPayment({ isOpen, onClose, durationType: initialDurationType, amount: initialAmount, language }: OnlineClassPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mtn' | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  
  // Duration selection state - allow user to change duration in modal
  const [selectedDuration, setSelectedDuration] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semestral' | 'yearly'>(initialDurationType);
  
  // MTN state
  const [mtnPhone, setMtnPhone] = useState('');
  const [isMtnProcessing, setIsMtnProcessing] = useState(false);
  const [mtnStatus, setMtnStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [mtnMessage, setMtnMessage] = useState('');

  const { toast } = useToast();

  // Calculate price based on selected duration
  const calculatePrice = (duration: typeof selectedDuration) => {
    switch (duration) {
      case 'daily': return 2500;
      case 'weekly': return 10000;
      case 'monthly': return 25000;
      case 'quarterly': return 73000;
      case 'semestral': return 105000;
      case 'yearly': return 150000;
      default: return 150000;
    }
  };

  const getDurationLabel = (duration: typeof selectedDuration) => {
    const labels = {
      daily: { fr: 'Journalier (1 jour)', en: 'Daily (1 day)' },
      weekly: { fr: 'Hebdomadaire (1 semaine)', en: 'Weekly (1 week)' },
      monthly: { fr: 'Mensuel (1 mois)', en: 'Monthly (1 month)' },
      quarterly: { fr: 'Trimestriel (3 mois)', en: 'Quarterly (3 months)' },
      semestral: { fr: 'Semestriel (6 mois)', en: 'Semestral (6 months)' },
      yearly: { fr: 'Annuel (1 an)', en: 'Yearly (1 year)' }
    };
    return labels[duration][language as 'fr' | 'en'];
  };

  const currentAmount = calculatePrice(selectedDuration);

  // Debug log when modal opens
  console.log('[PAYMENT_DEBUG] OnlineClassPayment modal opened:', { isOpen, durationType: selectedDuration, amount: currentAmount, stripeConfigured: !!stripePromise });

  const handlePaymentMethodSelect = async (method: 'stripe' | 'mtn') => {
    console.log('[PAYMENT_DEBUG] Payment method selected:', method);
    setPaymentMethod(method);

    if (method === 'stripe') {
      // Check if Stripe is configured
      if (!stripePromise) {
        console.error('[PAYMENT_DEBUG] Stripe is not configured!');
        toast({
          title: language === 'fr' ? 'Erreur de configuration' : 'Configuration Error',
          description: language === 'fr' 
            ? 'Le système de paiement Stripe n\'est pas configuré. Veuillez contacter le support.' 
            : 'Stripe payment system is not configured. Please contact support.',
          variant: 'destructive',
        });
        setPaymentMethod(null);
        return;
      }

      setIsLoadingIntent(true);
      try {
        console.log('[PAYMENT_DEBUG] Creating Stripe payment intent for duration:', selectedDuration);
        const response = await apiRequest('POST', '/api/online-class-payments/create-stripe-intent', {
          durationType: selectedDuration
        });
        const data = await response.json();
        console.log('[PAYMENT_DEBUG] Stripe intent response:', data);

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
          console.log('[PAYMENT_DEBUG] Client secret received successfully');
        } else {
          throw new Error(data.error || 'Échec de la création du paiement');
        }
      } catch (error: any) {
        console.error('[PAYMENT_DEBUG] Error creating Stripe intent:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setPaymentMethod(null);
      } finally {
        setIsLoadingIntent(false);
      }
    }
  };

  const handleMtnPayment = async () => {
    if (!mtnPhone.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Veuillez entrer votre numéro MTN Mobile Money' 
          : 'Please enter your MTN Mobile Money number',
        variant: 'destructive',
      });
      return;
    }

    setIsMtnProcessing(true);
    setMtnStatus('pending');

    try {
      const response = await apiRequest('POST', '/api/online-class-payments/create-mtn-payment', {
        durationType: selectedDuration,
        phoneNumber: mtnPhone
      });
      const data = await response.json();

      if (data.success) {
        setMtnStatus('pending');
        setMtnMessage(data.instructions || (language === 'fr' 
          ? 'Une demande de paiement a été envoyée sur votre téléphone. Veuillez confirmer le paiement.' 
          : 'A payment request has been sent to your phone. Please confirm the payment.'));
        
        toast({
          title: language === 'fr' ? 'Demande envoyée' : 'Request Sent',
          description: data.instructions,
        });

        // Poll for activation status
        pollForActivation();
      } else {
        throw new Error(data.error || 'Échec de la création du paiement MTN');
      }
    } catch (error: any) {
      setMtnStatus('failed');
      setMtnMessage(error.message);
      toast({
        title: language === 'fr' ? 'Erreur MTN' : 'MTN Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsMtnProcessing(false);
    }
  };

  // Poll for activation status after MTN payment
  const pollForActivation = async () => {
    let attempts = 0;
    const maxAttempts = 40; // 40 attempts * 3 seconds = 2 minutes
    
    const checkActivation = async () => {
      try {
        const response = await apiRequest('GET', '/api/online-class-activations/check-access');
        const data = await response.json();
        
        if (data.allowed) {
          // Activation successful!
          setMtnStatus('success');
          setMtnMessage(language === 'fr' 
            ? 'Paiement confirmé! Votre accès a été activé.' 
            : 'Payment confirmed! Your access has been activated.');
          setTimeout(() => {
            handleSuccess();
          }, 2000);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            // Continue polling
            setTimeout(checkActivation, 3000);
          } else {
            // Timeout - payment may still be processing
            setMtnStatus('failed');
            setMtnMessage(language === 'fr' 
              ? 'Le délai d\'attente est dépassé. Si vous avez confirmé le paiement, veuillez rafraîchir la page dans quelques instants.' 
              : 'Timeout reached. If you confirmed the payment, please refresh the page in a few moments.');
          }
        }
      } catch (error) {
        console.error('Error checking activation:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkActivation, 3000);
        }
      }
    };
    
    // Start checking after 5 seconds (give webhook time to process)
    setTimeout(checkActivation, 5000);
  };

  const handleSuccess = () => {
    // Refresh the page to reload access status
    window.location.reload();
  };

  const handleBack = () => {
    setPaymentMethod(null);
    setClientSecret(null);
    setMtnStatus('idle');
    setMtnMessage('');
    setMtnPhone('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'fr' ? 'Acheter l\'Accès' : 'Purchase Access'}
          </DialogTitle>
          <DialogDescription>
            {language === 'fr' 
              ? `Module Cours en Ligne - ${currentAmount.toLocaleString('fr-FR')} CFA`
              : `Online Classes Module - ${currentAmount.toLocaleString('fr-FR')} CFA`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!paymentMethod && (
            <>
              {/* Duration Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Durée d\'abonnement' : 'Subscription duration'}
                </Label>
                <Select value={selectedDuration} onValueChange={(value: any) => setSelectedDuration(value)}>
                  <SelectTrigger data-testid="select-modal-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{getDurationLabel('daily')}</SelectItem>
                    <SelectItem value="weekly">{getDurationLabel('weekly')}</SelectItem>
                    <SelectItem value="monthly">{getDurationLabel('monthly')}</SelectItem>
                    <SelectItem value="quarterly">{getDurationLabel('quarterly')}</SelectItem>
                    <SelectItem value="semestral">{getDurationLabel('semestral')}</SelectItem>
                    <SelectItem value="yearly">{getDurationLabel('yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'fr' ? 'Prix' : 'Price'}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {currentAmount.toLocaleString('fr-FR')} CFA
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDurationLabel(selectedDuration)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Choisissez votre méthode de paiement :' 
                  : 'Choose your payment method:'}
              </p>
              
              <div className="grid gap-3">
                <Card 
                  className="p-4 cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => handlePaymentMethodSelect('stripe')}
                  data-testid="card-select-stripe"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {language === 'fr' ? 'Carte Bancaire' : 'Credit Card'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Visa, Mastercard, etc.' : 'Visa, Mastercard, etc.'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => handlePaymentMethodSelect('mtn')}
                  data-testid="card-select-mtn"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Smartphone className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">MTN Mobile Money</h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Paiement mobile sécurisé' : 'Secure mobile payment'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              {isLoadingIntent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm 
                    durationType={selectedDuration}
                    amount={currentAmount}
                    onSuccess={handleSuccess}
                    language={language}
                  />
                </Elements>
              ) : clientSecret && !stripePromise ? (
                <div className="text-center py-6 space-y-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">
                      {language === 'fr' ? 'Configuration manquante' : 'Missing Configuration'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' 
                        ? 'Le paiement par carte n\'est pas disponible actuellement. Veuillez utiliser MTN Mobile Money.' 
                        : 'Card payment is not available currently. Please use MTN Mobile Money.'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleBack} className="w-full">
                    {language === 'fr' ? 'Retour' : 'Back'}
                  </Button>
                </div>
              ) : null}
              
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-full"
                data-testid="button-back-to-methods"
              >
                {language === 'fr' ? 'Retour' : 'Back'}
              </Button>
            </div>
          )}

          {paymentMethod === 'mtn' && (
            <div className="space-y-4">
              {mtnStatus === 'idle' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mtn-phone">
                      {language === 'fr' ? 'Numéro MTN Mobile Money' : 'MTN Mobile Money Number'}
                    </Label>
                    <Input
                      id="mtn-phone"
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      value={mtnPhone}
                      onChange={(e) => setMtnPhone(e.target.value)}
                      data-testid="input-mtn-phone"
                    />
                    <p className="text-xs text-gray-500">
                      {language === 'fr' 
                        ? 'Format: +237 6XX XXX XXX (MTN Cameroun uniquement)' 
                        : 'Format: +237 6XX XXX XXX (MTN Cameroon only)'}
                    </p>
                  </div>

                  <Button 
                    onClick={handleMtnPayment}
                    disabled={isMtnProcessing}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    data-testid="button-confirm-mtn-payment"
                  >
                    {isMtnProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === 'fr' ? 'Envoi...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        {language === 'fr' 
                          ? `Payer ${currentAmount.toLocaleString('fr-FR')} CFA` 
                          : `Pay ${currentAmount.toLocaleString('fr-FR')} CFA`}
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="w-full"
                    data-testid="button-back-to-methods"
                  >
                    {language === 'fr' ? 'Retour' : 'Back'}
                  </Button>
                </>
              )}

              {mtnStatus === 'pending' && (
                <div className="text-center py-6 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
                  <div>
                    <h4 className="font-medium mb-2">
                      {language === 'fr' ? 'En attente de confirmation' : 'Awaiting Confirmation'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {mtnMessage}
                    </p>
                  </div>
                </div>
              )}

              {mtnStatus === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">
                      {language === 'fr' ? 'Paiement réussi!' : 'Payment Successful!'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' 
                        ? 'Votre accès aux cours en ligne a été activé.' 
                        : 'Your online classes access has been activated.'}
                    </p>
                  </div>
                </div>
              )}

              {mtnStatus === 'failed' && (
                <div className="text-center py-6 space-y-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">
                      {language === 'fr' ? 'Paiement échoué' : 'Payment Failed'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {mtnMessage}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="w-full"
                    data-testid="button-retry-payment"
                  >
                    {language === 'fr' ? 'Réessayer' : 'Try Again'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
