export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  inventory?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface CartStore {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  calculateTotals: () => void;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export interface TaxCalculation {
  amount: number;
  rate: number;
  region: string;
}

export interface PriceBreakdown {
  subtotal: number;
  tax: TaxCalculation;
  shipping: ShippingOption;
  total: number;
  currency: string;
}