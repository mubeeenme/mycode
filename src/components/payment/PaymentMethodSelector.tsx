import React, { useState } from 'react';
import { CreditCard, Smartphone, QrCode } from 'lucide-react';
import { PaymentMethod } from '@/types/checkout';
import { StripePayment } from './StripePayment';
import { PayPalPayment } from './PayPalPayment';
import { AlternativePayment } from './AlternativePayment';
import { useTranslation } from 'next-i18next';

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  onSuccess: (paymentData: { type: PaymentMethod['type']; token: string }) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['type']>('stripe');

  const paymentMethods = [
    {
      type: 'stripe' as const,
      name: t('payment.stripe'),
      icon: CreditCard,
      description: 'Pay with credit or debit card',
    },
    {
      type: 'paypal' as const,
      name: t('payment.paypal'),
      icon: Smartphone,
      description: 'Pay with your PayPal account',
    },
    {
      type: 'alipay' as const,
      name: t('payment.alipay'),
      icon: QrCode,
      description: 'Pay with Alipay',
    },
    {
      type: 'wechat' as const,
      name: t('payment.wechat'),
      icon: QrCode,
      description: 'Pay with WeChat Pay',
    },
  ];

  const handlePaymentSuccess = (token: string) => {
    onSuccess({
      type: selectedMethod,
      token,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('checkout.paymentMethod')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.type}
                className={`
                  relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                  ${selectedMethod === method.type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.type}
                  checked={selectedMethod === method.type}
                  onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod['type'])}
                  className="sr-only"
                />
                <div className="flex flex-1">
                  <Icon className="h-6 w-6 text-gray-600 mr-3" />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">
                      {method.name}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {method.description}
                    </span>
                  </div>
                </div>
                {selectedMethod === method.type && (
                  <div className="absolute inset-0 rounded-lg border-2 border-primary-500 pointer-events-none" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-6">
        {selectedMethod === 'stripe' && (
          <StripePayment
            amount={amount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={onError}
            loading={loading}
          />
        )}
        
        {selectedMethod === 'paypal' && (
          <PayPalPayment
            amount={amount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={onError}
            loading={loading}
          />
        )}
        
        {selectedMethod === 'alipay' && (
          <AlternativePayment
            type="alipay"
            amount={amount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={onError}
            loading={loading}
          />
        )}
        
        {selectedMethod === 'wechat' && (
          <AlternativePayment
            type="wechat"
            amount={amount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={onError}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};