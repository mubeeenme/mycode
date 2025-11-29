import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'next-i18next';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onCheckout,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-6 border-b">
                <div className="flex items-center">
                  <ShoppingCart className="h-6 w-6 text-gray-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    {t('cart.title')}
                  </h2>
                  {totalItems > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({totalItems} {t('cart.items')})
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {t('cart.empty')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('cart.continueShopping')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t px-4 py-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
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
                      onClick={onClose}
                      className="w-full"
                    >
                      {t('cart.continueShopping')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};