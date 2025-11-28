import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index';

describe('E-commerce API', () => {
  beforeEach(() => {
    // Reset any test state before each test
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await app.request('/health');
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('status', 'ok');
      expect(json).toHaveProperty('timestamp');
    });
  });

  describe('Products API', () => {
    it('should return products list', async () => {
      const res = await app.request('/api/products');
      expect(res.status).toBe(200);
      
      const response1 = await res.json();
      expect(response1).toHaveProperty('products');
      expect(response1).toHaveProperty('pagination');
      const response2 = await res.json();
      expect(Array.isArray(response2.products)).toBe(true);
    });

    it('should filter products by price range', async () => {
      const res = await app.request('/api/products?min_price=10&max_price=100');
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('products');
    });

    it('should search products', async () => {
      const res = await app.request('/api/products?search=test');
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('products');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await app.request('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('Cart API', () => {
    it('should require authentication for cart operations', async () => {
      const res = await app.request('/api/cart');
      expect(res.status).toBe(401);
    });

    it('should validate cart item data', async () => {
      const res = await app.request('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        body: JSON.stringify({
          product_id: 'invalid-uuid',
          quantity: -1
        })
      });
      expect(res.status).toBe(400);
    });
  });

  describe('Checkout API', () => {
    it('should validate checkout data', async () => {
      const res = await app.request('/api/checkout/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session'
        },
        body: JSON.stringify({})
      });
      expect(res.status).toBe(401);
    });

    it('should calculate shipping and tax', async () => {
      const res = await app.request('/api/checkout/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            { unit_price: 50, quantity: 2 }
          ],
          address: {
            country: 'US',
            state: 'CA',
            city: 'Test City',
            postal_code: '90210',
            address_line1: '123 Test St'
          }
        })
      });
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('subtotal');
      expect(json).toHaveProperty('shipping_amount');
      expect(json).toHaveProperty('tax_amount');
      expect(json).toHaveProperty('total_amount');
    });
  });

  describe('Reviews API', () => {
    it('should return product reviews', async () => {
      const res = await app.request('/api/reviews/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('reviews');
      expect(json).toHaveProperty('summary');
      expect(json).toHaveProperty('pagination');
    });

    it('should require authentication for creating reviews', async () => {
      const res = await app.request('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: '00000000-0000-0000-0000-000000000000',
          rating: 5,
          title: 'Great product!',
          content: 'Really love this item.'
        })
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Admin API', () => {
    it('should require admin authentication', async () => {
      const res = await app.request('/api/admin/products');
      expect(res.status).toBe(401);
    });

    it('should accept admin token', async () => {
      const res = await app.request('/api/admin/products', {
        headers: {
          'X-Admin-Token': 'test-admin-token'
        }
      });
      expect(res.status).toBe(200);
    });

    it('should return analytics overview', async () => {
      const res = await app.request('/api/admin/analytics/overview', {
        headers: {
          'X-Admin-Token': 'test-admin-token'
        }
      });
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('metrics');
      expect(json).toHaveProperty('recentOrders');
      expect(json).toHaveProperty('topProducts');
    });
  });
});