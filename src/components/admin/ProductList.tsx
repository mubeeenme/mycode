import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Product, ProductFilters } from '@/types/admin';

interface ProductListProps {
  initialFilters?: ProductFilters;
}

const ProductList: React.FC<ProductListProps> = ({ initialFilters = {} }) => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      comparePrice: 399.99,
      sku: 'WH-001',
      barcode: '1234567890123',
      trackInventory: true,
      inventoryQuantity: 45,
      inventoryLowStockThreshold: 10,
      images: ['/images/headphones1.jpg'],
      categories: ['Electronics', 'Audio'],
      tags: ['wireless', 'bluetooth', 'noise-cancelling'],
      status: 'active',
      weight: 0.5,
      dimensions: { length: 20, width: 18, height: 8 },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable organic cotton t-shirt in various colors',
      price: 29.99,
      sku: 'TS-002',
      trackInventory: true,
      inventoryQuantity: 8,
      inventoryLowStockThreshold: 20,
      images: ['/images/tshirt1.jpg'],
      categories: ['Clothing', 'Men'],
      tags: ['organic', 'cotton', 'casual'],
      status: 'active',
      weight: 0.2,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
    },
    {
      id: '3',
      name: 'Smart Watch Pro',
      description: 'Advanced smartwatch with health tracking features',
      price: 449.99,
      sku: 'SW-003',
      trackInventory: true,
      inventoryQuantity: 0,
      inventoryLowStockThreshold: 5,
      images: ['/images/watch1.jpg'],
      categories: ['Electronics', 'Wearables'],
      tags: ['smart', 'health', 'fitness'],
      status: 'active',
      weight: 0.1,
      createdAt: '2024-01-08T11:30:00Z',
      updatedAt: '2024-01-22T10:15:00Z',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.sku.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(p => p.categories.includes(filters.category!));
      }
      
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      
      if (filters.stockStatus) {
        filtered = filtered.filter(p => {
          if (filters.stockStatus === 'in_stock') return p.inventoryQuantity > p.inventoryLowStockThreshold;
          if (filters.stockStatus === 'low_stock') return p.inventoryQuantity > 0 && p.inventoryQuantity <= p.inventoryLowStockThreshold;
          if (filters.stockStatus === 'out_of_stock') return p.inventoryQuantity === 0;
          return true;
        });
      }
      
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          let aValue: any = a[filters.sortBy! as keyof Product];
          let bValue: any = b[filters.sortBy! as keyof Product];

          if (filters.sortBy === 'name') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }
      
      setProducts(filtered);
      setLoading(false);
    }, 500);
  }, [filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.trackInventory) return { text: 'Not Tracked', color: 'gray' };
    if (product.inventoryQuantity === 0) return { text: 'Out of Stock', color: 'red' };
    if (product.inventoryQuantity <= product.inventoryLowStockThreshold) return { text: 'Low Stock', color: 'yellow' };
    return { text: 'In Stock', color: 'green' };
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`, selectedProducts);
    // Implement bulk actions
    alert(`Bulk action "${action}" would be performed on ${selectedProducts.length} products`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('products.addProduct')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder={t('products.search')}
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('products.filter.all')}</option>
              <option value="active">{t('products.filter.active')}</option>
              <option value="draft">{t('products.filter.draft')}</option>
              <option value="archived">{t('products.filter.archived')}</option>
            </select>
          </div>
          <div>
            <select
              value={filters.stockStatus || ''}
              onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('products.filter.all')}</option>
              <option value="in_stock">{t('products.filter.inStock')}</option>
              <option value="low_stock">{t('products.filter.lowStock')}</option>
              <option value="out_of_stock">{t('products.filter.outOfStock')}</option>
            </select>
          </div>
          <div>
            <select
              value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="created_at-desc">{t('products.sortBy.created')} (Newest)</option>
              <option value="created_at-asc">{t('products.sortBy.created')} (Oldest)</option>
              <option value="name-asc">{t('products.sortBy.name')} (A-Z)</option>
              <option value="name-desc">{t('products.sortBy.name')} (Z-A)</option>
              <option value="price-asc">{t('products.sortBy.price')} (Low to High)</option>
              <option value="price-desc">{t('products.sortBy.price')} (High to Low)</option>
              <option value="inventory_quantity-desc">{t('products.sortBy.stock')} (High to Low)</option>
              <option value="inventory_quantity-asc">{t('products.sortBy.stock')} (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProducts.length} {t('common.results')} selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('update_status')}>
                {t('common.bulkActions')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={product.images[0] || '/images/placeholder.png'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.categories.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                    {product.comparePrice && (
                      <span className="ml-2 text-gray-500 line-through">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${stockStatus.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                        ${stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${stockStatus.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                        ${stockStatus.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {stockStatus.text}
                      </span>
                      {product.trackInventory && (
                        <span className="ml-2 text-sm text-gray-500">
                          {product.inventoryQuantity}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${product.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      ${product.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                      ${product.status === 'archived' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {t(`products.status.${product.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        {t('common.edit')}
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;