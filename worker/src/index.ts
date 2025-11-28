import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { ApiResponse, Product, Order } from '../shared/types';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => {
  return c.json<ApiResponse>({
    success: true,
    message: 'Mobile Store API is running',
  });
});

app.get('/health', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

app.get('/api/products', async (c) => {
  try {
    const products: Product[] = [
      {
        id: '1',
        name: 'Premium Smartphone',
        description: 'Latest flagship smartphone with advanced features',
        price: 999,
        currency: 'USD',
        images: ['/images/phone1.jpg'],
        category: 'smartphones',
        stock: 50,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Wireless Earbuds',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: 199,
        currency: 'USD',
        images: ['/images/earbuds.jpg'],
        category: 'accessories',
        stock: 100,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return c.json<ApiResponse<Product[]>>({
      success: true,
      data: products,
    });
  } catch (error) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      500
    );
  }
});

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  const product: Product = {
    id,
    name: 'Premium Smartphone',
    description: 'Latest flagship smartphone with advanced features',
    price: 999,
    currency: 'USD',
    images: ['/images/phone1.jpg'],
    category: 'smartphones',
    stock: 50,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return c.json<ApiResponse<Product>>({
    success: true,
    data: product,
  });
});

app.post('/api/orders', async (c) => {
  try {
    const body = await c.req.json();
    
    const order: Order = {
      id: 'order_' + Date.now(),
      user_id: body.user_id,
      total: body.total,
      currency: body.currency || 'USD',
      status: 'pending',
      payment_method: body.payment_method,
      payment_status: 'pending',
      shipping_address: body.shipping_address,
      items: body.items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return c.json<ApiResponse<Order>>({
      success: true,
      data: order,
    });
  } catch (error) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create order',
      },
      500
    );
  }
});

app.post('/api/payments/stripe/create-intent', async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        client_secret: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        amount: body.amount,
        currency: body.currency || 'usd',
      },
    });
  } catch (error) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create payment intent',
      },
      500
    );
  }
});

export default app;