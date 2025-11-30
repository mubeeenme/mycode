import React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface CartPageProps {
  onCheckout: () => void;
  onBack: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onCheckout,
  onBack,
}) => {
  const { t } = useTranslation('common');
  const {
    items,
    subtotal,
    totalItems,
    isLoading,
    updateQuantity,
    removeItem,
  } = useCartStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('cart.title')}
            </h1>
            {totalItems > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {t('cart.totalItems', { count: totalItems })}
              </p>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">
            {t('cart.empty')}
          </h2>
          <p className="mt-2 text-gray-600">
            {t('cart.continueShopping')}
          </p>
          <div className="mt-8">
            <Button onClick={onBack}>
              {t('cart.continueShopping')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    loading={isLoading}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('cart.orderSummary')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('cart.shipping')}</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('cart.tax')}</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium">{t('cart.total')}</span>
                    <span className="text-base font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={onCheckout}
                  className="w-full"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {t('cart.checkout')}
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full"
                >
                  {t('cart.continueShopping')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};