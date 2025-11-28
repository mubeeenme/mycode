# E-commerce Backend with Supabase and Cloudflare Workers

A comprehensive e-commerce backend built with Supabase for the database and Cloudflare Workers for the API layer.

## Features

### Database (Supabase)
- **Products**: Catalog management with images, specifications, and inventory tracking
- **Orders**: Complete order lifecycle with status tracking
- **Payments**: Multi-payment provider support (Stripe, PayPal, Alipay, WeChat)
- **Reviews**: Customer review system with moderation
- **Users**: Customer profiles and address management
- **Inventory**: Real-time stock management with reservation system
- **Row Level Security**: Secure data access policies

### API (Cloudflare Workers)
- **Catalog API**: Product browsing with search, filters, and pagination
- **Cart API**: Shopping cart persistence for authenticated and guest users
- **Checkout API**: Order creation, payment processing, and tax/shipping calculation
- **Review API**: Customer review CRUD with helpful voting
- **Admin API**: Product management, order fulfillment, and analytics
- **Authentication**: JWT-based auth with role-based access control

### Payment Integration
- **Stripe**: PaymentIntents with webhook handling
- **PayPal**: Orders API integration
- **Alipay/WeChat Pay**: Via Stripe Connect or direct SDKs

### Email Notifications
- **Resend/SendGrid**: Order confirmations and payment receipts
- **PCI Compliant**: No sensitive payment data stored

## Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- Cloudflare Wrangler
- Stripe, PayPal, and email provider accounts

### Environment Setup

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up Supabase**:
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Generate TypeScript types
npm run supabase:generate-types
```

3. **Configure environment variables**:
```bash
# Copy wrangler.toml and update with your credentials
# Update the following in wrangler.toml:
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_ANON_KEY: Your Supabase anon key
- STRIPE_SECRET_KEY: Stripe secret key
- PAYPAL_CLIENT_ID/SECRET: PayPal API credentials
- RESEND_API_KEY: Email provider API key
- ADMIN_API_TOKEN: Secure token for admin operations
```

4. **Run development server**:
```bash
npm run dev
```

5. **Run tests**:
```bash
npm test
```

### Production Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## API Documentation

### Public Endpoints

#### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details

#### Cart
- `GET /api/cart` - Get user cart (requires auth or session)
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

#### Reviews
- `GET /api/reviews/products/:productId` - Get product reviews

#### Checkout
- `POST /api/checkout/calculate` - Calculate shipping/tax
- `POST /api/checkout/validate` - Validate cart items

### Protected Endpoints (Requires Authentication)

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Create address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address
- `GET /api/users/orders` - Get user orders
- `GET /api/users/reviews` - Get user reviews

#### Reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

#### Checkout
- `POST /api/checkout/order` - Create order
- `POST /api/checkout/payment` - Create payment intent

### Admin Endpoints (Requires Admin Access)

#### Products
- `GET /api/admin/products` - List all products
- `GET /api/admin/products/:id` - Get product details
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

#### Inventory
- `GET /api/admin/inventory` - List inventory
- `PUT /api/admin/inventory/:productId` - Update inventory

#### Orders
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id` - Update order status

#### Reviews
- `GET /api/admin/reviews` - List all reviews
- `PUT /api/admin/reviews/:id` - Moderate review
- `DELETE /api/admin/reviews/:id` - Delete review

#### Analytics
- `GET /api/admin/analytics/overview` - Dashboard analytics

### Webhooks
- `POST /api/webhook/stripe` - Stripe webhook handler
- `POST /api/webhook/paypal` - PayPal webhook handler

## Database Schema

### Core Tables
- `products` - Product catalog
- `product_images` - Product images
- `product_specs` - Product specifications
- `inventory` - Stock management
- `profiles` - User profiles (extends auth.users)
- `addresses` - Customer addresses
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `reviews` - Customer reviews
- `review_images` - Review images

### Key Features
- **Row Level Security**: All tables have RLS policies
- **Inventory Reservation**: Atomic stock management
- **Review Moderation**: Automated flagging and manual approval
- **Audit Trails**: Updated_at timestamps on all tables
- **Soft Deletes**: Products marked inactive instead of deleted

## Security

### Authentication
- JWT-based authentication via Supabase Auth
- Role-based access control (customer, manager, admin)
- API token authentication for admin operations

### Data Protection
- Row Level Security on all tables
- PCI compliance for payment processing
- No sensitive data stored beyond requirements
- Input validation and sanitization

### Rate Limiting
- Cloudflare Workers provide DDoS protection
- Additional rate limiting can be implemented as needed

## Testing

The project includes comprehensive tests covering:
- API endpoint functionality
- Authentication and authorization
- Data validation
- Error handling
- Integration scenarios

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.