# Mobile Store Scaffold

A modern, full-stack mobile store application built with Next.js 13 (App Router), TypeScript, and Cloudflare Workers.

## 🚀 Features

- **Next.js 13** with App Router for optimal performance
- **TypeScript** for type-safe development
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **Internationalization** with English and Chinese support
- **Payment Integration** ready for Stripe, PayPal, Alipay, and WeChat Pay
- **Supabase** for backend services
- **Cloudflare Workers** for serverless API
- **Shared Types** between frontend and worker

## 📁 Project Structure

```
├── src/                    # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── worker/               # Cloudflare Worker API
│   └── src/             # Worker source code
├── shared/              # Shared types and utilities
├── messages/            # i18n translation files
└── public/             # Static assets
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for worker deployment)
- Supabase account (optional)

### 1. Clone and Install

```bash
git clone <repository-url>
cd mobile-store-scaffold
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:
- Supabase configuration
- Payment provider keys
- Cloudflare settings

### 3. Run Development Servers

**Frontend:**
```bash
npm run dev
```
Visit http://localhost:3000

**Worker API:**
```bash
cd worker
npm install
npm run dev
```
The worker will run on http://localhost:8787

## 🌍 Internationalization

The app supports English and Chinese languages:

- Translation files: `messages/en.json` and `messages/zh.json`
- Language switching via the LanguageSwitcher component
- URL-based routing: `/en/...` and `/zh/...`

To add a new language:

1. Add the locale to `src/middleware.ts` and `src/i18n.ts`
2. Create a new translation file in `messages/`
3. Update the LanguageSwitcher component

## 💳 Payment Integration

### Stripe
```typescript
import { stripe } from '@/lib/stripe';
```

### PayPal
```typescript
import { paypal } from '@/lib/paypal';
```

### Alipay & WeChat Pay
Placeholders are included in the configuration. Add the appropriate SDKs when ready.

## 🗄️ Database Setup with Supabase

1. Create a new Supabase project
2. Run the following SQL to create basic tables:

```sql
-- Products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  images text[] DEFAULT '{}',
  category text,
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  total decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  payment_method text,
  payment_status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## 🚀 Deployment

### Frontend (Cloudflare Pages)

1. Connect your repository to Cloudflare Pages
2. Set build configuration:
   - Build command: `npm run build`
   - Build output directory: `.next`
3. Add environment variables in Cloudflare dashboard
4. Deploy

### Worker (Cloudflare Workers)

```bash
cd worker
npm run deploy
```

### Environment Variables for Production

Make sure to set these in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `NEXT_PUBLIC_WORKER_API_URL`

## 🧪 Testing and Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## 📱 Mobile-First Design

The application is built with a mobile-first approach:
- Responsive breakpoints (xs, sm, md, lg, xl)
- Touch-friendly interactions
- Optimized performance for mobile devices

## 🎨 Customization

### Theming
Modify `tailwind.config.js` to update colors, fonts, and other design tokens.

### Components
All UI components are in `src/components/ui/` and follow a consistent design system.

### Animations
Framer Motion is used throughout. Customize animations in individual components.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review the documentation
- Contact the development team

---

Built with ❤️ using Next.js, TypeScript, and Cloudflare