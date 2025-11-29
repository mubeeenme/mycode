import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentMethod } from '@/types/checkout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'next-i18next';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentProps {
  amount: number;
  currency: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentMethod) {
        onSuccess(paymentMethod.id);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        label={t('payment.cardholderName')}
        placeholder="John Doe"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('payment.cardNumber')}
        </label>
        <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="save-card"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="save-card" className="ml-2 block text-sm text-gray-900">
          {t('payment.saveCard')}
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing || loading}
        loading={isProcessing || loading}
      >
        {t('payment.payWithCard')} - ${amount.toFixed(2)} {currency.toUpperCase()}
      </Button>
    </form>
  );
};

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Stripe is not configured. Please add your Stripe publishable key.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};