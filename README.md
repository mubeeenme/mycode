# Cart & Checkout System

A comprehensive e-commerce cart and checkout system built with Next.js, TypeScript, Zustand, Supabase, and multiple payment integrations.

## Features

### Cart Management
- **Persistent Cart Store**: Zustand + localStorage for client-side persistence
- **Supabase Sync**: Automatic cart synchronization for authenticated users
- **Real-time Updates**: Add, remove, and update item quantities
- **Inventory Management**: Real-time inventory tracking with badges
- **Price Breakdown**: Automatic calculation of subtotal, tax, and shipping

### Checkout Flow
- **Multi-step Process**: Customer info → Shipping → Payment → Review
- **Guest & Authenticated Users**: Support for both checkout types
- **Address Management**: Saved addresses for registered users
- **Shipping Options**: Real-time shipping calculation via Worker API
- **Tax Calculation**: Automatic tax calculation based on location

### Payment Methods
- **Stripe Elements**: Credit/Debit card payments
- **PayPal**: Express checkout with PayPal buttons
- **Alipay**: QR code-based payments
- **WeChat Pay**: QR code and redirect-based payments

### Internationalization
- **Multi-language Support**: English, Spanish, French, German, Chinese, Japanese
- **Localized UI**: All text and messages are translatable
- **Currency Support**: Flexible currency handling

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Proper loading indicators throughout
- **Error Handling**: Comprehensive error handling and user feedback
- **Success States**: Order confirmation and success pages

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **State Management**: Zustand with persistence middleware
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe, PayPal, Alipay, WeChat Pay
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: next-i18next
- **Notifications**: React Hot Toast

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for card payments)
- PayPal account (for PayPal payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cart-checkout-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   
   # PayPal
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
   
   # Worker API (optional - uses mock data if not set)
   NEXT_PUBLIC_WORKER_API_URL=https://your-worker-api.workers.dev
   ```

### Database Setup

1. **Create Supabase tables** using the SQL schema below:
   ```sql
   -- Profiles table
   CREATE TABLE profiles (
     id uuid REFERENCES auth.users(id) PRIMARY KEY,
     email text NOT NULL,
     first_name text,
     last_name text,
     phone text,
     whatsapp text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Addresses table
   CREATE TABLE addresses (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     street text NOT NULL,
     street2 text,
     city text NOT NULL,
     state text NOT NULL,
     postal_code text NOT NULL,
     country text NOT NULL,
     is_default boolean DEFAULT false,
     type text NOT NULL CHECK (type IN ('shipping', 'billing')),
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Payment methods table
   CREATE TABLE payment_methods (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     type text NOT NULL CHECK (type IN ('stripe', 'paypal', 'alipay', 'wechat')),
     alias text NOT NULL,
     is_default boolean DEFAULT false,
     last4 text,
     expiry_month integer,
     expiry_year integer,
     brand text,
     provider_id text NOT NULL,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Orders table
   CREATE TABLE orders (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
     customer_info jsonb NOT NULL,
     items jsonb NOT NULL,
     shipping_address jsonb NOT NULL,
     billing_address jsonb,
     subtotal numeric NOT NULL,
     tax numeric NOT NULL,
     shipping numeric NOT NULL,
     total numeric NOT NULL,
     currency text NOT NULL DEFAULT 'USD',
     status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
     payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
     payment_method jsonb NOT NULL,
     payment_intent_id text,
     paypal_order_id text,
     notes text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Carts table
   CREATE TABLE carts (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     session_id text,
     items jsonb NOT NULL DEFAULT '[]',
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Create indexes
   CREATE INDEX idx_addresses_user_id ON addresses(user_id);
   CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
   CREATE INDEX idx_orders_customer_id ON orders(customer_id);
   CREATE INDEX idx_carts_user_id ON carts(user_id);
   CREATE INDEX idx_carts_session_id ON carts(session_id);
   ```

2. **Set up Row Level Security (RLS)** in Supabase:
   ```sql
   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

   -- Addresses policies
   CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

   -- Payment methods policies
   CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

   -- Orders policies
   CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);

   -- Carts policies
   CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (auth.uid() = user_id);
   CREATE POLICY "Guests can manage cart by session" ON carts FOR ALL USING (session_id IS NOT NULL);
   ```

### Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js app router (if using app directory)
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Header, Footer)
│   ├── cart/              # Cart-related components
│   ├── checkout/          # Checkout flow components
│   └── payment/           # Payment method components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries (Supabase, Worker API)
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
├── locales/               # Internationalization files
└── styles/                # Global styles
```

## Key Components

### Cart Store (`src/store/cart.ts`)
- Zustand store with persistence middleware
- Automatic Supabase synchronization
- Cart actions (add, remove, update, clear)
- Total calculations

### Checkout Flow (`src/components/checkout/CheckoutFlow.tsx`)
- Multi-step checkout wizard
- Form validation with Zod schemas
- Progress tracking
- Order creation

### Payment Integration
- **Stripe**: Elements integration with proper error handling
- **PayPal**: SDK integration with order creation and capture
- **Alternative Payments**: Mock implementations for Alipay/WeChat

## Worker API Integration

The system integrates with a Worker API for:
- Shipping calculations
- Tax calculations
- Payment token creation
- Payment verification

Mock implementations are provided in `src/lib/worker-api.ts` for development.

## Testing

The application includes mock data and services for testing without external dependencies:

- Mock products on the homepage
- Mock Worker API responses
- Test payment keys (use Stripe test cards and PayPal sandbox)

## Deployment

### Environment Variables
Ensure all environment variables are properly set in your production environment.

### Database
Run the database migrations and set up RLS policies in your production Supabase instance.

### Payment Providers
- Use production Stripe keys for live payments
- Configure PayPal for production environment
- Set up proper webhook endpoints for payment confirmations

### Cloudflare Pages
The project is configured for static export using Next.js 14, so
you can deploy it to Cloudflare Pages using the following settings:

- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`
- **Production branch**: `main`

Build locally with `npm run build` to confirm that the `out/` directory
contains `index.html` and `_next/`. For detailed deployment steps, see
`CLOUDFLARE_DEPLOYMENT.md`.

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new components
3. Include proper error handling
4. Add internationalization keys for new text
5. Test both guest and authenticated user flows

## License

This project is licensed under the MIT License.