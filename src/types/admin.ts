export type UserRole = 'customer' | 'manager' | 'owner';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  barcode?: string;
  trackInventory: boolean;
  inventoryQuantity: number;
  inventoryLowStockThreshold: number;
  images: string[];
  categories: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  verifiedPurchase: boolean;
  helpfulCount: number;
  adminResponse?: string | null;
  adminResponseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'product' | 'order' | 'review' | 'customer' | 'settings';
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: Product['status'];
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy?: 'name' | 'price' | 'created_at' | 'updated_at' | 'inventory_quantity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewFilters {
  status?: Review['status'];
  rating?: number;
  search?: string;
  verifiedPurchase?: boolean;
  sortBy?: 'created_at' | 'rating' | 'helpful_count';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BulkInventoryUpdate {
  productId: string;
  quantity: number;
  lowStockThreshold?: number;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  totalRevenue: number;
  pendingReviews: number;
  averageRating: number;
}