import { ApiResponse, WorkerEndpoints } from '@/types/api';

const WORKER_API_URL = process.env.NEXT_PUBLIC_WORKER_API_URL || '/api/worker';

class WorkerApiClient implements WorkerEndpoints {
  private async request<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${WORKER_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Worker API error for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async calculateShipping(data: {
    items: import('@/types/cart').CartItem[];
    address: import('@/types/checkout').Address;
  }): Promise<ApiResponse<import('@/types/cart').ShippingOption[]>> {
    return this.request('/shipping/calculate', data);
  }

  async calculateTax(data: {
    items: import('@/types/cart').CartItem[];
    address: import('@/types/checkout').Address;
    amount: number;
  }): Promise<ApiResponse<import('@/types/cart').TaxCalculation>> {
    return this.request('/tax/calculate', data);
  }

  async createPaymentToken(data: {
    amount: number;
    currency: string;
    paymentMethod: import('@/types/checkout').PaymentMethod['type'];
    orderId: string;
  }): Promise<ApiResponse<import('@/types/checkout').PaymentToken>> {
    return this.request('/payment/create-token', data);
  }

  async verifyPayment(data: {
    paymentIntentId?: string;
    paypalOrderId?: string;
    paymentToken: string;
  }): Promise<ApiResponse<{ status: string; orderId?: string }>> {
    return this.request('/payment/verify', data);
  }
}

export const workerApi = new WorkerApiClient();

export const mockWorkerApi: WorkerEndpoints = {
  async calculateShipping(data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          price: 5.99,
          estimatedDays: '5-7 business days',
          carrier: 'USPS',
        },
        {
          id: 'express',
          name: 'Express Shipping',
          price: 12.99,
          estimatedDays: '2-3 business days',
          carrier: 'FedEx',
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          price: 24.99,
          estimatedDays: '1 business day',
          carrier: 'UPS',
        },
      ],
    };
  },

  async calculateTax(data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taxRate = 0.08; // 8% tax rate
    const taxAmount = data.amount * taxRate;
    
    return {
      success: true,
      data: {
        amount: taxAmount,
        rate: taxRate,
        region: data.address.state,
      },
    };
  },

  async createPaymentToken(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: {
        token: `token_${Math.random().toString(36).substring(2)}`,
        type: data.paymentMethod,
        amount: data.amount,
        currency: data.currency,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      },
    };
  },

  async verifyPayment(data) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        status: 'completed',
        orderId: `order_${Math.random().toString(36).substring(2)}`,
      },
    };
  },
};