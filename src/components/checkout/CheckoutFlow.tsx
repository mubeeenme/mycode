import React, { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckoutData, CustomerInfo, Address, Order } from '@/types/checkout';
import { ShippingOption } from '@/types/cart';
import { useCartStore } from '@/store/cart';
import { supabase } from '@/lib/supabase';
import { mockWorkerApi } from '@/lib/worker-api';
import { CustomerInfoForm } from './CustomerInfoForm';
import { AddressForm } from './AddressForm';
import { ShippingOptions } from './ShippingOptions';
import { PaymentMethodSelector } from '../payment/PaymentMethodSelector';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface CheckoutFlowProps {
  onComplete: (order: Order) => void;
  onCancel: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation('common');
  const { items, subtotal, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tax, setTax] = useState(0);

  const steps = [
    { id: 1, title: t('checkout.customerInfo'), completed: !!customerInfo },
    { id: 2, title: t('checkout.shippingAddress'), completed: !!shippingAddress },
    { id: 3, title: t('checkout.shippingMethod'), completed: !!selectedShipping },
    { id: 4, title: t('checkout.paymentMethod'), completed: !!order },
  ];

  useEffect(() => {
    const calculateTax = async () => {
      if (shippingAddress && subtotal > 0) {
        try {
          const response = await mockWorkerApi.calculateTax({
            items,
            address: shippingAddress,
            amount: subtotal,
          });
          
          if (response.success && response.data) {
            setTax(response.data.amount);
          }
        } catch (err) {
          console.error('Failed to calculate tax:', err);
        }
      }
    };

    calculateTax();
  }, [shippingAddress, items, subtotal]);

  const handlePaymentSuccess = async (paymentData: { type: string; token: string }) => {
    if (!customerInfo || !shippingAddress || !selectedShipping) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        customer_info: customerInfo,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        subtotal,
        tax,
        shipping: selectedShipping.price,
        total: subtotal + tax + selectedShipping.price,
        currency: 'USD',
        status: 'pending' as const,
        payment_status: 'completed' as const,
        payment_method: {
          type: paymentData.type as any,
          alias: paymentData.type,
          isDefault: false,
        },
        payment_intent_id: paymentData.type === 'stripe' ? paymentData.token : null,
        paypal_order_id: paymentData.type === 'paypal' ? paymentData.token : null,
        items,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData as any)
        .select()
        .single();

      if (orderError) throw orderError;

      setOrder(order);
      setCurrentStep(5);
      
      // Clear cart after successful order
      await clearCart();
      
      onComplete(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoSubmit = (data: CustomerInfo) => {
    setCustomerInfo(data);
    setCurrentStep(2);
  };

  const handleShippingAddressSubmit = (data: Address) => {
    setShippingAddress(data);
    setCurrentStep(3);
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option);
    setCurrentStep(4);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('checkout.success')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('checkout.orderNumber', { orderNumber: order.id.slice(0, 8) })}
          </p>
          <p className="text-gray-600 mb-8">
            {t('checkout.orderEmail', { email: customerInfo?.email })}
          </p>
          
          <div className="space-y-4">
            <Button onClick={() => window.location.href = '/orders'}>
              {t('checkout.continueToAccount')}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              {t('checkout.backToShop')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2
                        ${step.completed || currentStep >= step.id
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {step.completed ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <span className={currentStep >= step.id ? 'text-white' : 'text-gray-500'}>
                          {step.id}
                        </span>
                      )}
                    </div>
                    <span className={`ml-4 text-sm font-medium ${
                      currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <CustomerInfoForm
              onSubmit={handleCustomerInfoSubmit}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <AddressForm
              title={t('checkout.shippingAddress')}
              onSubmit={handleShippingAddressSubmit}
              loading={loading}
            />
          )}

          {currentStep === 3 && shippingAddress && (
            <ShippingOptions
              address={shippingAddress}
              onShippingSelect={handleShippingSelect}
              selectedShipping={selectedShipping?.id}
              loading={loading}
            />
          )}

          {currentStep === 4 && selectedShipping && (
            <PaymentMethodSelector
              amount={subtotal + tax + selectedShipping.price}
              currency="USD"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              loading={loading}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t('checkout.orderSummary')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('cart.subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {selectedShipping && (
                <div className="flex justify-between text-sm">
                  <span>{t('cart.shipping')}</span>
                  <span>${selectedShipping.price.toFixed(2)}</span>
                </div>
              )}
              
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t('cart.tax')}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium">{t('cart.total')}</span>
                  <span className="text-base font-medium">
                    ${(subtotal + tax + (selectedShipping?.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="ghost" onClick={onCancel} className="w-full">
                Cancel Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};