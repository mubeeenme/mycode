// Worker entry point for cart and checkout API
const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Route handling
      if (url.pathname === '/shipping/calculate' && request.method === 'POST') {
        return handleShippingCalculate(request, corsHeaders);
      }
      
      if (url.pathname === '/tax/calculate' && request.method === 'POST') {
        return handleTaxCalculate(request, corsHeaders);
      }
      
      if (url.pathname === '/payment/create-token' && request.method === 'POST') {
        return handleCreatePaymentToken(request, corsHeaders);
      }
      
      if (url.pathname === '/payment/verify' && request.method === 'POST') {
        return handleVerifyPayment(request, corsHeaders);
      }

      // 404 for unknown routes
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};

export default worker;

async function handleShippingCalculate(request, corsHeaders) {
  const data = await request.json();
  
  // Mock shipping calculation
  const shippingOptions = [
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
  ];

  return new Response(JSON.stringify({
    success: true,
    data: shippingOptions,
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function handleTaxCalculate(request, corsHeaders) {
  const data = await request.json();
  
  // Mock tax calculation (8% rate)
  const taxRate = 0.08;
  const taxAmount = data.amount * taxRate;
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      amount: taxAmount,
      rate: taxRate,
      region: data.address.state,
    },
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function handleCreatePaymentToken(request, corsHeaders) {
  const data = await request.json();
  
  // Mock payment token creation
  const token = `token_${Math.random().toString(36).substring(2)}`;
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      token,
      type: data.paymentMethod,
      amount: data.amount,
      currency: data.currency,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    },
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function handleVerifyPayment(request, corsHeaders) {
  const data = await request.json();
  
  // Mock payment verification
  return new Response(JSON.stringify({
    success: true,
    data: {
      status: 'completed',
      orderId: `order_${Math.random().toString(36).substring(2)}`,
    },
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}