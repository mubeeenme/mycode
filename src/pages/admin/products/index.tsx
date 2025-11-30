import React from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductList from '@/components/admin/ProductList';

interface AdminProductsProps extends WithAdminAuthProps {}

const AdminProducts: React.FC<AdminProductsProps> = ({ user }) => {
  const { t } = useTranslation('admin');

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        <ProductList />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAdminAuth();

export default AdminProducts;