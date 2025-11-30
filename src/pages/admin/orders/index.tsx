import React from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderList from '@/components/admin/OrderList';

interface AdminOrdersProps extends WithAdminAuthProps {}

const AdminOrders: React.FC<AdminOrdersProps> = ({ user }) => {
  const { t } = useTranslation('admin');

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        <OrderList />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAdminAuth();

export default AdminOrders;