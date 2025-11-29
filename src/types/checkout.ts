export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
}

export interface Address {
  id?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type: 'shipping' | 'billing';
}

export interface CheckoutData {
  customerInfo: CustomerInfo;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingOption: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PaymentMethod {
  type: 'stripe' | 'paypal' | 'alipay' | 'wechat';
  alias?: string;
  isDefault?: boolean;
  last4?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  items: import('./cart').CartItem[];
  customerInfo: CustomerInfo;
  shippingAddress: Address;
  billingAddress?: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  paypalOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentToken {
  token: string;
  type: PaymentMethod['type'];
  amount: number;
  currency: string;
  expiresAt: string;
}

export interface CheckoutStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isValid: boolean;
  isCompleted: boolean;
}