export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WorkerEndpoints {
  calculateShipping: (data: {
    items: import('./cart').CartItem[];
    address: import('./checkout').Address;
  }) => Promise<ApiResponse<import('./cart').ShippingOption[]>>;

  calculateTax: (data: {
    items: import('./cart').CartItem[];
    address: import('./checkout').Address;
    amount: number;
  }) => Promise<ApiResponse<import('./cart').TaxCalculation>>;

  createPaymentToken: (data: {
    amount: number;
    currency: string;
    paymentMethod: import('./checkout').PaymentMethod['type'];
    orderId: string;
  }) => Promise<ApiResponse<import('./checkout').PaymentToken>>;

  verifyPayment: (data: {
    paymentIntentId?: string;
    paypalOrderId?: string;
    paymentToken: string;
  }) => Promise<ApiResponse<{ status: string; orderId?: string }>>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  inventory: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
}