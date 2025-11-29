export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          street: string;
          street2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          type: 'shipping' | 'billing';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          street: string;
          street2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default?: boolean;
          type: 'shipping' | 'billing';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          street?: string;
          street2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          type?: 'shipping' | 'billing';
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'stripe' | 'paypal' | 'alipay' | 'wechat';
          alias: string;
          is_default: boolean;
          last4: string | null;
          expiry_month: number | null;
          expiry_year: number | null;
          brand: string | null;
          provider_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'stripe' | 'paypal' | 'alipay' | 'wechat';
          alias: string;
          is_default?: boolean;
          last4?: string | null;
          expiry_month?: number | null;
          expiry_year?: number | null;
          brand?: string | null;
          provider_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'stripe' | 'paypal' | 'alipay' | 'wechat';
          alias?: string;
          is_default?: boolean;
          last4?: string | null;
          expiry_month?: number | null;
          expiry_year?: number | null;
          brand?: string | null;
          provider_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_info: import('./checkout').CustomerInfo;
          items: import('./cart').CartItem[];
          shipping_address: import('./checkout').Address;
          billing_address: import('./checkout').Address | null;
          subtotal: number;
          tax: number;
          shipping: number;
          total: number;
          currency: string;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_method: import('./checkout').PaymentMethod;
          payment_intent_id: string | null;
          paypal_order_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          customer_info: import('./checkout').CustomerInfo;
          items: import('./cart').CartItem[];
          shipping_address: import('./checkout').Address;
          billing_address?: import('./checkout').Address | null;
          subtotal: number;
          tax: number;
          shipping: number;
          total: number;
          currency: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_method: import('./checkout').PaymentMethod;
          payment_intent_id?: string | null;
          paypal_order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          customer_info?: import('./checkout').CustomerInfo;
          items?: import('./cart').CartItem[];
          shipping_address?: import('./checkout').Address;
          billing_address?: import('./checkout').Address | null;
          subtotal?: number;
          tax?: number;
          shipping?: number;
          total?: number;
          currency?: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_method?: import('./checkout').PaymentMethod;
          payment_intent_id?: string | null;
          paypal_order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          items: import('./cart').CartItem[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          items: import('./cart').CartItem[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          items?: import('./cart').CartItem[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}