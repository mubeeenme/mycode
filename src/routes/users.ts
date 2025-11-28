import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';
import type { Context, User } from '../types';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  ADMIN_API_TOKEN: string;
}

const users = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
users.use('*', cors());

// Validation schemas
const profileUpdateSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
});

const addressCreateSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  company: z.string().optional(),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  is_default: z.boolean().optional(),
});

const addressUpdateSchema = addressCreateSchema.partial();

// Authentication middleware
const requireAuth = async (c: Context, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: authHeader }
    }
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('user', user);
  c.set('supabase', supabase);
  await next();
};

// Get user profile
users.get('/profile', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Update user profile
users.put('/profile', requireAuth, zValidator('json', profileUpdateSchema), async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const updateData = c.req.valid('json');

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Get user addresses
users.get('/addresses', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Create address
users.post('/addresses', requireAuth, zValidator('json', addressCreateSchema), async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const addressData = c.req.valid('json');

  // If setting as default, unset other default addresses of same type
  if (addressData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('type', addressData.type);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      ...addressData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

// Update address
users.put('/addresses/:id', requireAuth, zValidator('json', addressUpdateSchema), async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');
  const updateData = c.req.valid('json');

  // Check if address belongs to user
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('type, is_default')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existingAddress) {
    return c.json({ error: 'Address not found' }, 404);
  }

  // If setting as default, unset other default addresses of same type
  if (updateData.is_default && !existingAddress.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('type', existingAddress.type)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Delete address
users.delete('/addresses/:id', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');

  // Check if address belongs to user
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existingAddress) {
    return c.json({ error: 'Address not found' }, 404);
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Get user orders
users.get('/orders', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const status = c.req.query('status');

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        products(name, sku, product_images(url, alt_text, is_primary))
      ),
      payments(payment_method, status, created_at)
    `, { count: 'exact' })
    .eq('user_id', user.id);

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    orders: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

// Get specific order
users.get('/orders/:id', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        products(name, sku, product_images(url, alt_text, is_primary))
      ),
      payments(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(data);
});

// Get user reviews
users.get('/reviews', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      products(name, sku, product_images(url, alt_text, is_primary))
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    reviews: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

// Get wishlist (if implemented)
users.get('/wishlist', requireAuth, async (c: Context) => {
  // This would require a wishlist table
  // For now, return empty response
  return c.json({ items: [] });
});

// Order history analytics for user
users.get('/analytics', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');

  // Get order statistics
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status, created_at')
    .eq('user_id', user.id);

  const totalSpent = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0;
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter((order: any) => order.status === 'delivered').length || 0;

  // Get review statistics
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, status')
    .eq('user_id', user.id);

  const totalReviews = reviews?.length || 0;
  const approvedReviews = reviews?.filter((review: any) => review.status === 'approved').length || 0;
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;

  return c.json({
    orders: {
      total_spent: totalSpent,
      total_orders: totalOrders,
      completed_orders: completedOrders,
    },
    reviews: {
      total_reviews: totalReviews,
      approved_reviews: approvedReviews,
      average_rating: averageRating,
    }
  });
});

export default users;