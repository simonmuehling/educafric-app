import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Lock, Zap } from 'lucide-react';

interface CheckoutFormProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ 
  planId, 
  planName, 
  amount, 
  currency, 
  onSuccess, 
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [processing, setProcessing] = useState(false);

  const text = {
    en: {
      cardDetails: 'Card Details',
      payNow: 'Pay Now',
      processing: 'Processing...',
      securePayment: 'Secure payment powered by Stripe',
      instantActivation: 'Instant activation after payment',
      support247: '24/7 customer support',
      paymentError: 'Payment failed. Please check your card details and try again.',
      genericError: 'An unexpected error occurred. Please try again.',
      paymentSuccess: 'Payment successful! Activating your subscription...'
    },
    fr: {
      cardDetails: 'Détails de la Carte',
      payNow: 'Payer Maintenant',
      processing: 'Traitement...',
      securePayment: 'Paiement sécurisé par Stripe',
      instantActivation: 'Activation instantanée après paiement',
      support247: 'Support client 24/7',
      paymentError: 'Échec du paiement. Veuillez vérifier les détails de votre carte et réessayer.',
      genericError: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      paymentSuccess: 'Paiement réussi ! Activation de votre abonnement...'
    }
  };

  const t = text[language];

  const handleSubmit = useStableCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window?.location?.origin}/subscription-success?plan=${planId}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Stripe payment error:', error);
        onError(error.message || t.paymentError);
      } else {
        // Payment succeeded - subscription should be activated instantly
        onSuccess();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError(t.genericError);
    } finally {
      setProcessing(false);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element Container */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>{t.cardDetails}</span>
        </h4>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Plan Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">{planName}</h5>
        <div className="text-2xl font-bold text-blue-900">
          {amount.toLocaleString()} {currency}
        </div>
      </div>

      {/* Security Features */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-green-500" />
          <span>{t.securePayment}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-orange-500" />
          <span>{t.instantActivation}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-blue-500" />
          <span>{t.support247}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
      >
        {processing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>{t.processing}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>{t.payNow}</span>
          </div>
        )}
      </Button>

      {/* Stripe Branding */}
      <div className="text-center text-xs text-gray-500">
        Powered by <span className="font-semibold">Stripe</span>
      </div>
    </form>
  );
}