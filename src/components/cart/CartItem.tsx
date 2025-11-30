import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'next-i18next';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  loading?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
}) => {
  const { t } = useTranslation('common');

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= item.inventory) {
      await onUpdateQuantity(item.id, newQuantity);
    }
  };

  const getInventoryStatus = () => {
    if (item.inventory === 0) {
      return { status: 'outOfStock', color: 'text-red-600' };
    } else if (item.inventory <= 5) {
      return { status: 'lowStock', color: 'text-yellow-600' };
    }
    return { status: 'inStock', color: 'text-green-600' };
  };

  const inventoryStatus = getInventoryStatus();

  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          {item.sku && (
            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
          )}
          <p className="mt-1 text-sm text-gray-900">
            ${item.price.toFixed(2)}
          </p>
          <p className={`text-xs ${inventoryStatus.color}`}>
            {t(`inventory.${inventoryStatus.status}`, { count: item.inventory })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading || item.quantity >= item.inventory}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          disabled={loading}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};