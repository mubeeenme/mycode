import React, { useState } from 'react';
import { PaymentMethod } from '@/types/checkout';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'next-i18next';

interface AlternativePaymentProps {
  type: 'alipay' | 'wechat';
  amount: number;
  currency: string;
  onSuccess: (paymentToken: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export const AlternativePayment: React.FC<AlternativePaymentProps> = ({
  type,
  amount,
  currency,
  onSuccess,
  onError,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Mock payment processing for Alipay and WeChat Pay
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (type === 'alipay') {
        // Mock QR code generation for Alipay
        const mockQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
        setQrCode(mockQrCode);
        
        // Simulate QR code scan completion
        setTimeout(() => {
          onSuccess(`alipay_token_${Math.random().toString(36).substring(2)}`);
        }, 5000);
      } else {
        // Mock redirect for WeChat Pay
        const mockRedirectUrl = `weixin://pay/${Math.random().toString(36).substring(2)}`;
        setRedirectUrl(mockRedirectUrl);
        
        // Simulate WeChat payment completion
        setTimeout(() => {
          onSuccess(`wechat_token_${Math.random().toString(36).substring(2)}`);
        }, 5000);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          {type === 'alipay' ? (
            <span className="text-2xl font-bold text-blue-600">支</span>
          ) : (
            <span className="text-2xl font-bold text-green-600">微</span>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {type === 'alipay' ? 'Alipay' : 'WeChat Pay'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Scan with your {type === 'alipay' ? 'Alipay' : 'WeChat'} app
        </p>
      </div>

      {qrCode && (
        <div className="text-center">
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img
              src={qrCode}
              alt={`${type} QR Code`}
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Scan this QR code with your {type} app
          </p>
        </div>
      )}

      {redirectUrl && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            You will be redirected to {type === 'wechat' ? 'WeChat Pay' : 'Alipay'}
          </p>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button disabled={isProcessing || loading}>
              Open {type === 'wechat' ? 'WeChat Pay' : 'Alipay'}
            </Button>
          </a>
        </div>
      )}

      {!qrCode && !redirectUrl && (
        <Button
          onClick={handlePayment}
          className="w-full"
          disabled={isProcessing || loading}
          loading={isProcessing || loading}
        >
          {type === 'alipay' ? t('payment.payWithAlipay') : t('payment.payWithWeChat')} - ${amount.toFixed(2)} {currency.toUpperCase()}
        </Button>
      )}

      <div className="text-center text-sm text-gray-600">
        <p>Payment amount: ${amount.toFixed(2)} {currency.toUpperCase()}</p>
      </div>
    </div>
  );
};