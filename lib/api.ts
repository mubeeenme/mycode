import { Product, Review, FilterOptions, PaginatedResponse, SearchParams } from '@/types';
import { mockProducts, mockReviews } from './mock-data';

const ITEMS_PER_PAGE = 12;
const REVIEWS_PER_PAGE = 5;

export async function getProducts(params: SearchParams = {}): Promise<PaginatedResponse<Product>> {
  await new Promise(resolve => setTimeout(resolve, 100));

  let filteredProducts = [...mockProducts];

  if (params.query) {
    const query = params.query.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    );
  }

  if (params.brand) {
    const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
    filteredProducts = filteredProducts.filter(p => brands.includes(p.brand));
  }

  if (params.category) {
    filteredProducts = filteredProducts.filter(p => p.category === params.category);
  }

  if (params.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(params.minPrice!));
  }

  if (params.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(params.maxPrice!));
  }

  if (params.sort) {
    switch (params.sort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  const page = parseInt(params.page || '1');
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(start, start + ITEMS_PER_PAGE);

  return {
    data: paginatedProducts,
    total,
    page,
    pageSize: ITEMS_PER_PAGE,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProducts.find(p => p.slug === slug) || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProducts.filter(p => p.featured).slice(0, 4);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const brands = Array.from(new Set(mockProducts.map(p => p.brand))).sort();
  const categories = Array.from(new Set(mockProducts.map(p => p.category))).sort();
  const prices = mockProducts.map(p => p.price);
  
  return {
    brands,
    categories,
    priceRange: {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    },
  };
}

export async function getReviews(productId: string, page: number = 1): Promise<PaginatedResponse<Review>> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const productReviews = mockReviews.filter(r => r.productId === productId);
  const total = productReviews.length;
  const totalPages = Math.ceil(total / REVIEWS_PER_PAGE);
  const start = (page - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = productReviews.slice(start, start + REVIEWS_PER_PAGE);

  return {
    data: paginatedReviews,
    total,
    page,
    pageSize: REVIEWS_PER_PAGE,
    totalPages,
  };
}

export async function submitReview(review: any): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Review submitted:', review);
  return { success: true };
}
