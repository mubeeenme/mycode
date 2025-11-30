# Admin Dashboard

A comprehensive admin dashboard for managing products, orders, reviews, and customers in the e-commerce system.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control** with `owner`, `manager`, and `customer` roles
- **Protected routes** that redirect unauthorized users
- **Server-side authentication** using Supabase Auth
- **Session management** with automatic token refresh

### 📦 Product Management
- **Full CRUD operations** for products
- **Advanced search and filtering** by status, stock levels, categories
- **Bulk inventory updates** with low-stock alerts
- **Image management** with upload support (Supabase Storage/Cloudflare R2)
- **Product variants** and inventory tracking
- **Category and tag management**

### 🛒 Order Management
- **Order status tracking** (pending → processing → shipped → delivered)
- **Payment status management** (pending → processing → completed/failed/refunded)
- **Payment actions** - capture, refund, partial refunds
- **Fulfillment workflow** with tracking information
- **Order filtering and search**
- **Customer communication** tools

### ⭐ Review Moderation
- **Review approval workflow** (pending → approved/rejected/hidden)
- **Admin responses** to customer reviews
- **Bulk review actions**
- **Review filtering** by status, rating, verification
- **Customer engagement metrics**

### 👥 Customer Management
- **Customer profiles** with order history
- **Role management** (promote/demote users)
- **Customer communication** tools
- **Order and spending analytics**

### ⚙️ Settings & Configuration
- **Store settings** (name, email, currency, timezone)
- **Shipping configuration** (rates, thresholds)
- **Tax settings** (rates, inclusive/exclusive)
- **User management** (add/remove admin users)

### 📊 Dashboard & Analytics
- **Real-time statistics** and KPIs
- **Recent activity feed**
- **Quick action shortcuts**
- **Low stock alerts**
- **Pending review notifications**

### 🔍 Audit Logging
- **Comprehensive audit trail** for all admin actions
- **Entity-specific logging** (products, orders, reviews, customers)
- **Change tracking** with before/after values
- **IP and user agent logging**
- **Filterable log history**

### 🎨 UI/UX Features
- **Responsive design** optimized for tablet and desktop
- **Breadcrumb navigation** for easy orientation
- **Activity feedback** with toast notifications
- **Loading states** and error handling
- **Accessibility compliance** (ARIA labels, keyboard navigation)
- **Dark mode support** (configurable)
- **Multilingual support** (6 languages)

## Architecture

### Database Schema Extensions

The admin dashboard extends the existing database with:

```sql
-- Extended profiles table with roles
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'owner'));

-- New tables for admin functionality
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  inventory_low_stock_threshold INTEGER DEFAULT 10,
  images TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  weight DECIMAL(8,2),
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'order', 'review', 'customer', 'settings')),
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Components

#### Authentication Layer
- `withAdminAuth()` - Server-side protection for admin routes
- `useAdminAuth()` - Client-side auth hook
- Role-based access control with redirect logic

#### Layout System
- `AdminLayout` - Main dashboard layout with sidebar navigation
- `Breadcrumbs` - Navigation helper component
- Responsive sidebar with role-based menu items

#### Management Components
- `ProductList` - Product catalog with advanced filtering
- `ProductForm` - Create/edit product form with validation
- `OrderList` - Order management with status tracking
- `ReviewList` - Review moderation interface
- `NotificationProvider` - Activity feedback system

#### Audit System
- `AuditLogger` - Comprehensive logging utility
- Entity-specific logging methods
- Change tracking and history

## Security Features

### Authentication & Authorization
- **Supabase Auth integration** with secure session management
- **Role-based access control** with granular permissions
- **Server-side validation** for all admin actions
- **CSRF protection** via Next.js middleware
- **Security headers** (XSS protection, content type options)

### Data Protection
- **Input validation** using Zod schemas
- **SQL injection prevention** via Supabase client
- **XSS protection** with proper content sanitization
- **Audit logging** for compliance and monitoring

### Access Control
- **Route protection** with automatic redirects
- **Feature-level permissions** based on user roles
- **API endpoint protection** with auth middleware
- **Session timeout** and automatic logout

## API Integration

### Worker API Endpoints
The admin dashboard integrates with existing Worker APIs for:

- **Shipping calculations** and rate management
- **Tax computation** with location-based rules
- **Payment processing** (Stripe, PayPal, Alipay, WeChat)
- **Order fulfillment** and tracking updates
- **Inventory synchronization** across channels

### Supabase Integration
- **Real-time subscriptions** for live updates
- **Row Level Security (RLS)** for data access control
- **Storage integration** for product images
- **Database functions** for complex operations

## Performance Optimizations

### Frontend
- **Code splitting** with Next.js dynamic imports
- **Image optimization** with Next.js Image component
- **Lazy loading** for large data sets
- **Debounced search** and filtering
- **Memoization** for expensive computations

### Backend
- **Database indexing** for common queries
- **Pagination** for large result sets
- **Caching strategies** for frequently accessed data
- **Optimized queries** with proper joins and filters

## Accessibility Features

- **ARIA labels** and landmarks
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast mode** support
- **Focus management** for modals and forms
- **Semantic HTML** structure

## Internationalization

The admin dashboard supports 6 languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)

All UI text, error messages, and notifications are fully localized.

## Development Setup

### Prerequisites
- Node.js 18+
- Supabase project with required tables
- Environment variables configured

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_WORKER_API_URL=your_worker_api_url
```

### Installation
```bash
npm install
npm run dev
```

### Database Setup
1. Run the provided SQL migrations in your Supabase project
2. Set up Row Level Security (RLS) policies
3. Create initial admin user with 'owner' role
4. Configure storage buckets for product images

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Configuration
- Set production environment variables
- Configure Supabase production project
- Set up custom domain and SSL
- Enable monitoring and logging

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Monitoring & Analytics

### Performance Monitoring
- **Next.js Analytics** for Core Web Vitals
- **Error tracking** with detailed stack traces
- **User behavior analytics** for admin actions
- **API response time monitoring**

### Audit Trail
- **Complete action logging** for compliance
- **Change history** with user attribution
- **Data export** for audit purposes
- **Automated alerts** for suspicious activities

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate tests for new features
3. Update documentation for any API changes
4. Ensure accessibility compliance
5. Test across different screen sizes and browsers

## Support

For issues and questions:
1. Check the existing documentation
2. Review the audit logs for error details
3. Contact the development team
4. Create detailed bug reports with reproduction steps