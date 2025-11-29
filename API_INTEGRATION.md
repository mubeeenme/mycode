# API Integration Guide

This document explains how to integrate the application with a real backend API or Supabase.

## Current Implementation

The application currently uses mock data defined in `lib/mock-data.ts`. All API functions are in `lib/api.ts` and can be easily replaced with real API calls.

## Data Models

### Product
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images: string[];
  specifications: Record<string, string>;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}
```

### Review
```typescript
interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}
```

## API Functions to Implement

### Products

#### `getProducts(params)`
- **Purpose**: Fetch products with filtering, search, and pagination
- **Parameters**:
  - `query?: string` - Search query
  - `brand?: string | string[]` - Filter by brand(s)
  - `minPrice?: string` - Minimum price
  - `maxPrice?: string` - Maximum price
  - `category?: string` - Filter by category
  - `page?: string` - Page number (default: 1)
  - `sort?: string` - Sort option (newest, price-asc, price-desc, rating)
- **Returns**: `PaginatedResponse<Product>`

#### `getProductBySlug(slug)`
- **Purpose**: Fetch a single product by slug
- **Parameters**: `slug: string`
- **Returns**: `Product | null`

#### `getFeaturedProducts()`
- **Purpose**: Fetch featured products for homepage
- **Returns**: `Product[]`

#### `getFilterOptions()`
- **Purpose**: Get available filter options
- **Returns**: `FilterOptions` (brands, categories, priceRange)

### Reviews

#### `getReviews(productId, page)`
- **Purpose**: Fetch reviews for a product with pagination
- **Parameters**:
  - `productId: string`
  - `page?: number` (default: 1)
- **Returns**: `PaginatedResponse<Review>`

#### `submitReview(review)`
- **Purpose**: Submit a new review
- **Parameters**: `ReviewSubmission`
- **Returns**: `{ success: boolean }`

## Supabase Integration Example

### 1. Setup Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. Database Schema

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[],
  specifications JSONB,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

### 4. Update API Functions

Example for `getProducts`:

```typescript
// lib/api.ts
import { supabase } from './supabase';

export async function getProducts(params: SearchParams = {}): Promise<PaginatedResponse<Product>> {
  let query = supabase.from('products').select('*', { count: 'exact' });

  // Search
  if (params.query) {
    query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }

  // Filters
  if (params.brand) {
    const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
    query = query.in('brand', brands);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.minPrice) {
    query = query.gte('price', parseFloat(params.minPrice));
  }

  if (params.maxPrice) {
    query = query.lte('price', parseFloat(params.maxPrice));
  }

  // Sort
  const sortMap: Record<string, string> = {
    'newest': 'created_at.desc',
    'price-asc': 'price.asc',
    'price-desc': 'price.desc',
    'rating': 'rating.desc',
  };
  const sortBy = sortMap[params.sort || 'newest'] || 'created_at.desc';
  const [column, order] = sortBy.split('.');
  query = query.order(column, { ascending: order === 'asc' });

  // Pagination
  const page = parseInt(params.page || '1');
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
```

## REST API Integration Example

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts(params: SearchParams = {}): Promise<PaginatedResponse<Product>> {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/products?${queryString}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

export async function submitReview(review: ReviewSubmission): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit review');
  }
  
  return response.json();
}
```

## Cloudflare Worker Integration

If using Cloudflare Workers as mentioned in the ticket:

```typescript
// lib/api.ts
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;

export async function getProducts(params: SearchParams = {}): Promise<PaginatedResponse<Product>> {
  const response = await fetch(`${WORKER_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  return response.json();
}
```

## Testing the Integration

1. Replace mock data functions in `lib/api.ts`
2. Test each endpoint individually
3. Handle errors appropriately
4. Add loading states to components
5. Implement retry logic if needed
6. Add caching strategy (React Query, SWR, etc.)

## Performance Optimization

Consider adding:
- React Query for data fetching and caching
- SWR for real-time data
- Optimistic updates for better UX
- Error boundaries
- Loading skeletons
