import React, { useEffect, useState } from 'react';
import { ShippingOption } from '@/types/cart';
import { mockWorkerApi } from '@/lib/worker-api';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface ShippingOptionsProps {
  address: import('@/types/checkout').Address;
  onShippingSelect: (option: ShippingOption) => void;
  selectedShipping?: string;
  loading?: boolean;
}

export const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  address,
  onShippingSelect,
  selectedShipping,
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const { items } = useCartStore();
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      if (!address.street || !address.city || !address.postalCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await mockWorkerApi.calculateShipping({
          items,
          address,
        });
        
        if (response.success && response.data) {
          setShippingOptions(response.data);
        } else {
          setError(response.error || 'Failed to fetch shipping options');
        }
      } catch (err) {
        setError('Failed to fetch shipping options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingOptions();
  }, [address, items]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('checkout.shippingMethod')}
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('checkout.shippingMethod')}
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        {t('checkout.shippingMethod')}
      </h3>
      
      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`
              relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
              ${selectedShipping === option.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input
              type="radio"
              name="shipping-option"
              value={option.id}
              checked={selectedShipping === option.id}
              onChange={() => onShippingSelect(option)}
              className="sr-only"
            />
            <div className="flex flex-1">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">
                  {option.name}
                </span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  {option.estimatedDays} via {option.carrier}
                </span>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-medium text-gray-900">
                  ${option.price.toFixed(2)}
                </span>
              </div>
            </div>
            {selectedShipping === option.id && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary-500 pointer-events-none" />
            )}
          </label>
        ))}
      </div>

      <Button
        onClick={() => {/* Continue to next step */}}
        className="w-full"
        disabled={!selectedShipping || loading}
        loading={loading}
      >
        Continue to Payment
      </Button>
    </div>
  );
};