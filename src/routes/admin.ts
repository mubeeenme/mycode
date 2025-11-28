import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';

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

const admin = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
admin.use('*', cors());

// Validation schemas
const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().min(1),
  price: z.number().positive(),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

const productUpdateSchema = productCreateSchema.partial();

const inventoryUpdateSchema = z.object({
  quantity_available: z.number().int().min(0),
  reorder_level: z.number().int().min(0).optional(),
});

const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
});

const reviewUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

// Products CRUD
admin.get('/products', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(url, alt_text, sort_order, is_primary),
      inventory(quantity_available, quantity_reserved, reorder_level),
      reviews(count)
    `, { count: 'exact' });

  if (search) {
    query = query.textSearch('name', search);
  }

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
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
    products: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

admin.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_specs(*),
      inventory(*),
      reviews(
        *,
        profiles(full_name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(data);
});

admin.post('/products', zValidator('json', productCreateSchema), async (c) => {
  const productData = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'SKU already exists' }, 400);
    }
    return c.json({ error: error.message }, 500);
  }

  // Create inventory record
  const { error: inventoryError } = await supabase
    .from('inventory')
    .insert({
      product_id: data.id,
      quantity_available: 0,
      quantity_reserved: 0,
    });

  if (inventoryError) {
    console.error('Failed to create inventory record:', inventoryError);
  }

  return c.json(data, 201);
});

admin.put('/products/:id', zValidator('json', productUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const updateData = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'SKU already exists' }, 400);
    }
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(data);
});

admin.delete('/products/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Check if product has any orders
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', id)
    .limit(1);

  if (orderItems && orderItems.length > 0) {
    return c.json({ error: 'Cannot delete product with existing orders' }, 400);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Inventory management
admin.get('/inventory', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const low_stock = c.req.query('low_stock');

  let query = supabase
    .from('inventory')
    .select(`
      *,
      products(name, sku, is_active)
    `, { count: 'exact' });

  if (low_stock === 'true') {
    query = query.lte('quantity_available', 'reorder_level');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order('quantity_available', { ascending: true });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    inventory: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

admin.put('/inventory/:product_id', zValidator('json', inventoryUpdateSchema), async (c) => {
  const product_id = c.req.param('product_id');
  const updateData = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('inventory')
    .update({
      ...updateData,
      last_restocked_at: new Date().toISOString(),
    })
    .eq('product_id', product_id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: 'Inventory record not found' }, 404);
  }

  return c.json(data);
});

// Orders management
admin.get('/orders', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  const search = c.req.query('search');

  let query = supabase
    .from('orders')
    .select(`
      *,
      profiles(email, full_name),
      order_items(*),
      payments(payment_method, status, created_at)
    `, { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%,profiles.email.ilike.%${search}%`);
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

admin.get('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(email, full_name, phone),
      order_items(
        *,
        products(name, sku, product_images(url, alt_text, is_primary))
      ),
      payments(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(data);
});

admin.put('/orders/:id', zValidator('json', orderUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const updateData = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get current order
  const { data: currentOrder, error: orderError } = await supabase
    .from('orders')
    .select('status, order_items')
    .eq('id', id)
    .single();

  if (orderError || !currentOrder) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // Handle status transitions
  if (updateData.status === 'cancelled' && currentOrder.status !== 'cancelled') {
    // Release reserved inventory
    for (const item of currentOrder.order_items) {
      await supabase.rpc('release_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }
  } else if (updateData.status === 'shipped' && currentOrder.status !== 'shipped') {
    // Inventory was already confirmed when order was confirmed
    // Just update the status
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Reviews management
admin.get('/reviews', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  const rating = c.req.query('rating');

  let query = supabase
    .from('reviews')
    .select(`
      *,
      products(name, sku),
      profiles(full_name, email),
      review_images(*)
    `, { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (rating) {
    query = query.eq('rating', parseInt(rating));
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
    reviews: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

admin.put('/reviews/:id', zValidator('json', reviewUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const { status } = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      products(name),
      profiles(full_name, email)
    `)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: 'Review not found' }, 404);
  }

  return c.json(data);
});

admin.delete('/reviews/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Analytics dashboard
admin.get('/analytics/overview', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get basic metrics
  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { count: pendingReviews },
    revenueResult,
    lowStockResult
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('total_amount').eq('status', 'delivered'),
    supabase.from('inventory').select('*', { count: 'exact', head: true }).lte('quantity_available', 'reorder_level')
  ]);

  const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
  const lowStockCount = lowStockResult.count || 0;

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      order_number,
      total_amount,
      status,
      created_at,
      profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get top products
  const { data: topProducts } = await supabase
    .from('order_items')
    .select(`
      product_id,
      products(name, sku),
      quantity
    `)
    .order('quantity', { ascending: false })
    .limit(5);

  return c.json({
    metrics: {
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      totalCustomers: totalCustomers || 0,
      pendingReviews: pendingReviews || 0,
      totalRevenue,
      lowStockItems: lowStockCount,
    },
    recentOrders,
    topProducts,
  });
});

export default admin;