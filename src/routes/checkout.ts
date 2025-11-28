import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { cors } from 'hono/cors';
import type { Context } from '../types';

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

const checkout = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
checkout.use('*', cors());

// Validation schemas
const checkoutSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().positive(),
  })),
  shipping_address: z.object({
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
  }),
  billing_address: z.object({
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
  }),
  shipping_method: z.string().optional(),
  payment_method: z.enum(['stripe', 'paypal']),
  notes: z.string().optional(),
});

const paymentIntentSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.enum(['stripe', 'paypal']),
  return_url: z.string().url(),
});

// Helper functions
const calculateShipping = (items: any[], address: any): number => {
  // Simple shipping calculation logic
  // In production, this would integrate with shipping carriers
  const baseRate = 5.99;
  const weightTotal = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  
  if (address.country === 'US') {
    return baseRate + (weightTotal * 0.5);
  } else {
    return baseRate * 2 + (weightTotal * 1);
  }
};

const calculateTax = (subtotal: number, address: any): number => {
  // Simple tax calculation - in production, use tax service like Avalara
  if (address.country === 'US') {
    const taxRates: { [key: string]: number } = {
      'CA': 0.0875,
      'NY': 0.08,
      'TX': 0.0625,
      'FL': 0.06,
    };
    const rate = taxRates[address.state || ''] || 0.08;
    return subtotal * rate;
  }
  return 0;
};

const sendOrderConfirmationEmail = async (
  resend: Resend,
  orderData: any,
  customerEmail: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'orders@yourstore.com',
      to: customerEmail,
      subject: `Order Confirmation #${orderData.order_number}`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order! Your order number is <strong>${orderData.order_number}</strong></p>
        
        <h2>Order Details</h2>
        <p>Status: ${orderData.status}</p>
        <p>Total: $${orderData.total_amount.toFixed(2)}</p>
        
        <h2>Items</h2>
        ${orderData.order_items.map((item: any) => `
          <div style="margin-bottom: 10px;">
            <strong>${item.product_name}</strong><br>
            SKU: ${item.product_sku}<br>
            Quantity: ${item.quantity}<br>
            Price: $${item.unit_price.toFixed(2)}<br>
            Total: $${item.total_price.toFixed(2)}
          </div>
        `).join('')}
        
        <h2>Shipping Address</h2>
        <p>
          ${orderData.shipping_address.first_name} ${orderData.shipping_address.last_name}<br>
          ${orderData.shipping_address.address_line1}<br>
          ${orderData.shipping_address.address_line2 ? orderData.shipping_address.address_line2 + '<br>' : ''}
          ${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.postal_code}<br>
          ${orderData.shipping_address.country}
        </p>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
};

// Validate cart before checkout
checkout.post('/validate', async (c: Context) => {
  const authHeader = c.req.header('Authorization');
  const sessionId = c.req.header('X-Session-ID');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {}
    }
  });

  let cartId;
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    cartId = cart?.id;
  } else if (sessionId) {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    cartId = cart?.id;
  } else {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (!cartId) {
    return c.json({ error: 'Cart not found' }, 404);
  }

  // Validate cart items
  const { data: validation, error } = await supabase
    .rpc('validate_cart_items', { p_cart_id: cartId });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const unavailableItems = validation?.filter((item: any) => !item.is_available) || [];
  
  if (unavailableItems.length > 0) {
    return c.json({
      valid: false,
      unavailable_items: unavailableItems
    }, 400);
  }

    // Get cart items with full product details
  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      quantity,
      products!inner(
        id,
        name,
        sku,
        price,
        weight,
        inventory!inner(quantity_available)
      )
    `)
    .eq('cart_id', cartId);

  if (itemsError) {
    return c.json({ error: itemsError.message }, 500);
  }

  return c.json({
    valid: true,
    items: (cartItems || []).map((item: any) => ({
      product_id: item.products.id,
      name: item.products.name,
      sku: item.products.sku,
      quantity: item.quantity,
      unit_price: item.products.price,
      weight: item.products.weight,
      available_quantity: item.products.inventory?.quantity_available || 0
    }))
  });
});

// Create order
checkout.post('/order', zValidator('json', checkoutSchema), async (c: Context) => {
  const {
    items,
    shipping_address,
    billing_address,
    shipping_method,
    payment_method,
    notes
  } = c.req.valid('json');
  
  const authHeader = c.req.header('Authorization');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let userId;
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  }

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const shipping_amount = calculateShipping(items, shipping_address);
  const tax_amount = calculateTax(subtotal, shipping_address);
  const total_amount = subtotal + shipping_amount + tax_amount;

  // Generate order number
  const { data: orderNumberData, error: orderNumberError } = await supabase
    .rpc('generate_order_number');

  if (orderNumberError) {
    return c.json({ error: 'Failed to generate order number' }, 500);
  }

  // Start transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumberData,
      user_id: userId,
      status: 'pending',
      subtotal,
      tax_amount,
      shipping_amount,
      total_amount,
      shipping_address,
      billing_address,
      notes,
    })
    .select()
    .single();

  if (orderError) {
    return c.json({ error: orderError.message }, 500);
  }

  // Reserve inventory and create order items
  const orderItems = [];
  for (const item of items) {
    // Reserve inventory
    const { data: reserved, error: reserveError } = await supabase
      .rpc('reserve_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });

    if (reserveError || !reserved) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return c.json({ error: `Insufficient inventory for product ${item.product_id}` }, 400);
    }

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, sku')
      .eq('id', item.product_id)
      .single();

    // Create order item
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: product?.name || '',
        product_sku: product?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      })
      .select()
      .single();

    if (itemError) {
      // Rollback inventory and order
      await supabase.rpc('release_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
      await supabase.from('orders').delete().eq('id', order.id);
      return c.json({ error: 'Failed to create order item' }, 500);
    }

    orderItems.push(orderItem);
  }

  // Clear cart if user is authenticated
  if (userId) {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }
  }

  return c.json({
    order: {
      ...order,
      order_items: orderItems
    },
    next_step: 'payment'
  });
});

// Create payment intent
checkout.post('/payment', zValidator('json', paymentIntentSchema), async (c) => {
  const { order_id, payment_method, return_url } = c.req.valid('json');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (orderError || !order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  if (order.status !== 'pending') {
    return c.json({ error: 'Order is not in pending status' }, 400);
  }

  let paymentData;

  if (payment_method === 'stripe') {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convert to cents
        currency: order.currency.toLowerCase(),
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        return_url: return_url,
      });

      paymentData = {
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: order.total_amount,
        currency: order.currency,
      };

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          order_id,
          payment_method: 'stripe',
          payment_intent_id: paymentIntent.id,
          amount: order.total_amount,
          currency: order.currency,
          status: 'pending',
          gateway_response: {
            id: paymentIntent.id,
            object: paymentIntent.object,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
        });

    } catch (error) {
      console.error('Stripe error:', error);
      return c.json({ error: 'Failed to create payment intent' }, 500);
    }

  } else if (payment_method === 'paypal') {
    // PayPal integration would go here
    // For now, return a mock response
    paymentData = {
      payment_id: `paypal_${Date.now()}`,
      approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=mock_${order.id}`,
      amount: order.total_amount,
      currency: order.currency,
    };

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        order_id,
        payment_method: 'paypal',
        payment_intent_id: paymentData.payment_id,
        amount: order.total_amount,
        currency: order.currency,
        status: 'pending',
        gateway_response: paymentData,
      });

  } else {
    return c.json({ error: 'Unsupported payment method' }, 400);
  }

  return c.json({
    payment_method,
    ...paymentData,
  });
});

// Payment confirmation webhook
checkout.post('/webhook/:provider', async (c) => {
  const provider = c.req.param('provider');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const resend = new Resend(c.env.RESEND_API_KEY);

  if (provider === 'stripe') {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        'whsec_your_webhook_secret' // This should be stored in environment variables
      );
    } catch (error) {
      return c.json({ error: 'Invalid signature' }, 400);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          gateway_response: paymentIntent,
        })
        .eq('payment_intent_id', paymentIntent.id);

      // Update order status
      const { data: order } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId)
        .select(`
          *,
          order_items(*),
          profiles(email)
        `)
        .single();

      if (order) {
        // Confirm inventory (move from reserved to sold)
        for (const item of order.order_items) {
          await supabase.rpc('confirm_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }

        // Send confirmation email
        if (order.profiles?.email) {
          await sendOrderConfirmationEmail(resend, order, order.profiles.email);
        }
      }
    }

  } else if (provider === 'paypal') {
    // PayPal webhook handling would go here
  }

  return c.json({ received: true });
});

// Calculate shipping and tax
checkout.post('/calculate', async (c) => {
  const { items, address } = await c.req.json();
  
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const shipping = calculateShipping(items, address);
  const tax = calculateTax(subtotal, address);
  const total = subtotal + shipping + tax;

  return c.json({
    subtotal,
    shipping_amount: shipping,
    tax_amount: tax,
    total_amount: total,
  });
});

export default checkout;