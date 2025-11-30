import React from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ReviewList from '@/components/admin/ReviewList';

interface AdminReviewsProps extends WithAdminAuthProps {}

const AdminReviews: React.FC<AdminReviewsProps> = ({ user }) => {
  const { t } = useTranslation('admin');

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        <ReviewList />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAdminAuth();

export default AdminReviews;