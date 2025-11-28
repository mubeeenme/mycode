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

const reviews = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
reviews.use('*', cors());

// Validation schemas
const reviewCreateSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
});

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

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

// Get product reviews (public)
reviews.get('/products/:productId', async (c) => {
  const productId = c.req.param('productId');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const rating = c.req.query('rating');
  const sort = c.req.query('sort') || 'created_at';
  const order = c.req.query('order') || 'desc';

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  let query = supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      content,
      helpful_count,
      verified_purchase,
      created_at,
      profiles(full_name),
      review_images(url)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (rating) {
    query = query.eq('rating', parseInt(rating));
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order(sort, { ascending: order === 'asc' });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // Get rating summary
  const { data: ratingSummary } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  const ratingCounts = ratingSummary?.reduce((acc: any, review: any) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {}) || {};

  const averageRating = ratingSummary && ratingSummary.length > 0
    ? ratingSummary.reduce((sum: number, review: any) => sum + review.rating, 0) / ratingSummary.length
    : 0;

  return c.json({
    reviews: data,
    summary: {
      total_reviews: count || 0,
      average_rating: averageRating,
      rating_counts: ratingCounts,
    },
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  });
});

// Get user's reviews
reviews.get('/my-reviews', requireAuth, async (c: Context) => {
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

// Create review
reviews.post('/', requireAuth, zValidator('json', reviewCreateSchema), async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const { product_id, rating, title, content } = c.req.valid('json');

  // Check if user has purchased the product
  const { data: hasPurchased } = await supabase
    .from('order_items')
    .select(`
      order_id,
      orders!inner(user_id, status)
    `)
    .eq('product_id', product_id)
    .eq('orders.user_id', user.id)
    .in('orders.status', ['confirmed', 'processing', 'shipped', 'delivered'])
    .limit(1);

  const verified_purchase = hasPurchased && hasPurchased.length > 0;

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', product_id)
    .eq('user_id', user.id)
    .single();

  if (existingReview) {
    return c.json({ error: 'You have already reviewed this product' }, 400);
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id,
      user_id: user.id,
      rating,
      title,
      content,
      verified_purchase,
    })
    .select(`
      *,
      products(name, sku),
      profiles(full_name)
    `)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

// Update review
reviews.put('/:id', requireAuth, zValidator('json', reviewUpdateSchema), async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');
  const updateData = c.req.valid('json');

  // Check if review belongs to user
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('user_id, status')
    .eq('id', id)
    .single();

  if (!existingReview) {
    return c.json({ error: 'Review not found' }, 404);
  }

  if (existingReview.user_id !== user.id) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Cannot update approved reviews (to prevent abuse)
  if (existingReview.status === 'approved') {
    return c.json({ error: 'Cannot update approved review' }, 400);
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      products(name, sku),
      profiles(full_name)
    `)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Delete review
reviews.delete('/:id', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');

  // Check if review belongs to user
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existingReview) {
    return c.json({ error: 'Review not found' }, 404);
  }

  if (existingReview.user_id !== user.id) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Mark review as helpful
reviews.post('/:id/helpful', async (c) => {
  const id = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('reviews')
    .update({ helpful_count: supabase.rpc('increment', { x: 'helpful_count' }) })
    .eq('id', id)
    .select('helpful_count')
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ helpful_count: data.helpful_count });
});

// Add review images
reviews.post('/:id/images', requireAuth, async (c: Context) => {
  const user = c.get('user') as User;
  const supabase = c.get('supabase');
  const id = c.req.param('id');
  const { urls } = await c.req.json();

  if (!Array.isArray(urls) || urls.length === 0) {
    return c.json({ error: 'Image URLs are required' }, 400);
  }

  // Check if review belongs to user
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existingReview) {
    return c.json({ error: 'Review not found' }, 404);
  }

  if (existingReview.user_id !== user.id) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const images = urls.map(url => ({
    review_id: id,
    url,
  }));

  const { data, error } = await supabase
    .from('review_images')
    .insert(images)
    .select();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

export default reviews;