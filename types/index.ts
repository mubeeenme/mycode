export interface Product {
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

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface ReviewSubmission {
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
}

export interface FilterOptions {
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
}

export interface SearchParams {
  query?: string;
  brand?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  category?: string;
  page?: string;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
