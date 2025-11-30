import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import type { ProductFormData } from '@/components/admin/ProductForm';

interface AdminNewProductProps extends WithAdminAuthProps {}

const AdminNewProduct: React.FC<AdminNewProductProps> = ({ user }) => {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // API call to create product
      console.log('Creating product:', data);
      // await createProduct(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('products.addProduct')}
          </h1>
          <p className="text-gray-600">Create a new product for your store</p>
        </div>
        
        <ProductForm onSave={handleSave} loading={loading} />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAdminAuth();

export default AdminNewProduct;