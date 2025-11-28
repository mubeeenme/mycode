import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import checkout from './routes/checkout';
import admin from './routes/admin';
import reviews from './routes/reviews';
import users from './routes/users';

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

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Supabase client helper
const createSupabaseClient = (env: Bindings, authHeader?: string) => {
  return createClient(
    env.SUPABASE_URL,
    authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '')
      : env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    }
  );
};

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const supabase = createSupabaseClient(c.env, authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('user', user);
  c.set('supabase', supabase);
  await next();
};

// Admin authentication middleware
const requireAdmin = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const adminToken = c.req.header('X-Admin-Token');

  // Check for admin token first (for server-to-server)
  if (adminToken === c.env.ADMIN_API_TOKEN) {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    c.set('supabase', supabase);
    c.set('isAdmin', true);
    await next();
    return;
  }

  // Otherwise check for authenticated admin user
  if (!authHeader) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const supabase = createSupabaseClient(c.env, authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  c.set('user', user);
  c.set('supabase', supabase);
  c.set('isAdmin', true);
  await next();
};

// Validation schemas
const productQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  category: z.string().optional(),
  min_price: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_price: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  sort: z.enum(['name', 'price', 'created_at']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  tags: z.string().optional().transform(val => val ? val.split(',') : []),
});

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const addressSchema = z.object({
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

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catalog routes
app.get('/api/products', zValidator('query', productQuerySchema), async (c) => {
  const { page, limit, category, min_price, max_price, search, sort, order, tags } = c.req.valid('query');
  const supabase = createSupabaseClient(c.env);

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(url, alt_text, sort_order, is_primary),
      inventory(quantity_available),
      reviews(rating, status)
    `)
    .eq('is_active', true);

  // Apply filters
  if (search) {
    query = query.textSearch('name', search);
  }

  if (min_price !== undefined) {
    query = query.gte('price', min_price);
  }

  if (max_price !== undefined) {
    query = query.lte('price', max_price);
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  // Apply sorting
  query = query.order(sort, { ascending: order === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

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

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(url, alt_text, sort_order, is_primary),
      product_specs(name, value, sort_order),
      inventory(quantity_available),
      reviews(
        id,
        rating,
        title,
        content,
        user_id,
        profiles(full_name),
        created_at,
        status
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return c.json({ error: 'Product not found' }, 404);
  }

  // Filter reviews to only show approved ones
  const approvedReviews = data.reviews?.filter((review: any) => review.status === 'approved') || [];
  data.reviews = approvedReviews;

  return c.json(data);
});

// Cart routes
app.get('/api/cart', async (c) => {
  const authHeader = c.req.header('Authorization');
  const sessionId = c.req.header('X-Session-ID');
  const supabase = createSupabaseClient(c.env, authHeader);

  let cartQuery = supabase
    .from('carts')
    .select(`
      *,
      cart_items(
        *,
        products(name, price, sku, is_active, product_images(url, alt_text, is_primary))
      )
    `);

  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id);
    }
  } else if (sessionId) {
    cartQuery = cartQuery.eq('session_id', sessionId);
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const { data, error } = await cartQuery.single();

  if (error && error.code !== 'PGRST116') {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    // Create new cart
    const cartData: any = {};
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) cartData.user_id = user.id;
    } else {
      cartData.session_id = sessionId;
    }

    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert(cartData)
      .select(`
        *,
        cart_items(
          *,
          products(name, price, sku, is_active, product_images(url, alt_text, is_primary))
        )
      `)
      .single();

    if (createError) {
      return c.json({ error: createError.message }, 500);
    }

    return c.json(newCart);
  }

  return c.json(data);
});

app.post('/api/cart/items', zValidator('json', cartItemSchema), async (c) => {
  const { product_id, quantity } = c.req.valid('json');
  const authHeader = c.req.header('Authorization');
  const sessionId = c.req.header('X-Session-ID');
  const supabase = createSupabaseClient(c.env, authHeader);

  // Get or create cart
  let cart;
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingCart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingCart) {
        cart = existingCart;
      } else {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();
        cart = newCart;
      }
    }
  } else if (sessionId) {
    const { data: existingCart } = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (existingCart) {
      cart = existingCart;
    } else {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ session_id: sessionId })
        .select()
        .single();
      cart = newCart;
    }
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Check if product exists and is active
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, inventory(quantity_available)')
    .eq('id', product_id)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    return c.json({ error: 'Product not found or inactive' }, 404);
  }

  // Check inventory
  if (product.inventory.quantity_available < quantity) {
    return c.json({ error: 'Insufficient inventory' }, 400);
  }

  // Add or update cart item
  const { data: cartItem, error: cartError } = await supabase
    .from('cart_items')
    .upsert({
      cart_id: cart.id,
      product_id,
      quantity
    })
    .select(`
      *,
      products(name, price, sku, is_active, product_images(url, alt_text, is_primary))
    `)
    .single();

  if (cartError) {
    return c.json({ error: cartError.message }, 500);
  }

  return c.json(cartItem);
});

app.put('/api/cart/items/:id', zValidator('json', cartItemSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const { quantity } = c.req.valid('json');
  const authHeader = c.req.header('Authorization');
  const sessionId = c.req.header('X-Session-ID');
  const supabase = createSupabaseClient(c.env, authHeader);

  // Get cart item with product info
  const { data: cartItem, error: itemError } = await supabase
    .from('cart_items')
    .select(`
      *,
      cart!inner(user_id, session_id),
      products(name, price, sku, is_active, inventory!inner(quantity_available))
    `)
    .eq('id', id)
    .single();

  if (itemError || !cartItem) {
    return c.json({ error: 'Cart item not found' }, 404);
  }

  // Check ownership
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || cartItem.cart.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
  } else if (sessionId) {
    if (cartItem.cart.session_id !== sessionId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Check inventory
  if (cartItem.products.inventory && cartItem.products.inventory?.quantity_available && (cartItem.products.inventory.quantity_available || 0) < quantity) {
    return c.json({ error: 'Insufficient inventory' }, 400);
  }

  // Update cart item
  const { data: updatedItem, error: updateError } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select(`
      *,
      products(name, price, sku, is_active, product_images(url, alt_text, is_primary))
    `)
    .single();

  if (updateError) {
    return c.json({ error: updateError.message }, 500);
  }

  return c.json(updatedItem);
});

app.delete('/api/cart/items/:id', async (c) => {
  const id = c.req.param('id');
  const authHeader = c.req.header('Authorization');
  const sessionId = c.req.header('X-Session-ID');
  const supabase = createSupabaseClient(c.env, authHeader);

  // Get cart item with cart info
  const { data: cartItem, error: itemError } = await supabase
    .from('cart_items')
    .select(`
      *,
      cart!inner(user_id, session_id)
    `)
    .eq('id', id)
    .single();

  if (itemError || !cartItem) {
    return c.json({ error: 'Cart item not found' }, 404);
  }

  // Check ownership
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || cartItem.cart.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
  } else if (sessionId) {
    if (cartItem.cart.session_id !== sessionId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Delete cart item
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return c.json({ error: deleteError.message }, 500);
  }

  return c.json({ success: true });
});

// Mount routes
app.route('/api', checkout);
app.route('/api/admin', admin);
app.route('/api', reviews);
app.route('/api/users', users);

export default app;