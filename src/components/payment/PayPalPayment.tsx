import React, { useEffect, useRef } from 'react';
import { PaymentMethod } from '@/types/checkout';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.paypal && paypalRef.current) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
                currency_code: currency.toUpperCase(),
              },
            }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            onSuccess(data.orderID);
          } catch (error) {
            onError(error instanceof Error ? error.message : 'PayPal payment failed');
          }
        },
        onError: (err: any) => {
          onError('PayPal payment failed');
        },
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
        },
      }).render(paypalRef.current);
    }
  }, [amount, currency, onSuccess, onError]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`;
    script.async = true;
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency.toUpperCase(),
                },
              }],
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const order = await actions.order.capture();
              onSuccess(data.orderID);
            } catch (error) {
              onError(error instanceof Error ? error.message : 'PayPal payment failed');
            }
          },
          onError: (err: any) => {
            onError('PayPal payment failed');
          },
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
          },
        }).render(paypalRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [amount, currency, onSuccess, onError]);

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">PayPal is not configured. Please add your PayPal client ID.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={paypalRef} className="min-h-[200px]" />
      <div className="text-center text-sm text-gray-600">
        <p>{t('payment.payWithPayPal')}</p>
      </div>
    </div>
  );
};