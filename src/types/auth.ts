export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing';
}

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'alipay' | 'wechat';
  alias: string;
  isDefault: boolean;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  createdAt: string;
}