import React, { useState, useEffect } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types/admin';
import type { ProductFormData } from '@/components/admin/ProductForm';

interface AdminEditProductProps extends WithAdminAuthProps {
  product: Product;
}

const AdminEditProduct: React.FC<AdminEditProductProps> = ({ user, product }) => {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // API call to update product
      console.log('Updating product:', data);
      // await updateProduct(product.id, data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // API call to delete product
      console.log('Deleting product:', product.id);
      // await deleteProduct(product.id);
    } finally {
      // Handle navigation
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('products.editProduct')}
          </h1>
          <p className="text-gray-600">Edit product information</p>
        </div>
        
        <ProductForm
          product={product}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps<AdminEditProductProps> = withAdminAuth()(
  async (context: GetServerSidePropsContext) => {
    const { id } = context.params!;
    
    // In a real app, fetch product from database
    // For now, return mock data
    const mockProduct: Product = {
      id: id as string,
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
      price: 299.99,
      comparePrice: 399.99,
      sku: 'WH-001',
      barcode: '1234567890123',
      trackInventory: true,
      inventoryQuantity: 45,
      inventoryLowStockThreshold: 10,
      images: ['/images/headphones1.jpg', '/images/headphones2.jpg'],
      categories: ['Electronics', 'Audio'],
      tags: ['wireless', 'bluetooth', 'noise-cancelling', 'premium'],
      status: 'active',
      weight: 0.5,
      dimensions: { length: 20, width: 18, height: 8 },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    };

    return {
      props: {
        product: mockProduct,
      },
    };
  }
);

export default AdminEditProduct;