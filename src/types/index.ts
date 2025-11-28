export interface User {
  id: string;
  email: string;
  aud: string;
  role?: string;
  app_metadata?: any;
  user_metadata?: any;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  weight?: number;
  dimensions?: any;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products?: Product & {
    product_images?: Array<{
      url: string;
      alt_text?: string;
      sort_order: number;
      is_primary: boolean;
    }>;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// Simplified Context type to work with Hono
export type Context = any;