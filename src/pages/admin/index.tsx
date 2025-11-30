import React from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { withAdminAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { AdminStats } from '@/types/admin';

interface AdminDashboardProps extends WithAdminAuthProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const { t } = useTranslation('admin');

  // Mock stats - in real app, these would come from API
  const stats: AdminStats = {
    totalProducts: 156,
    activeProducts: 142,
    lowStockProducts: 8,
    outOfStockProducts: 6,
    totalOrders: 1247,
    pendingOrders: 23,
    processingOrders: 45,
    totalRevenue: 125430,
    pendingReviews: 12,
    averageRating: 4.3,
  };

  const statCards = [
    {
      title: t('dashboard.stats.totalProducts'),
      value: stats.totalProducts,
      change: '+12%',
      changeType: 'positive' as const,
      href: '/admin/products',
    },
    {
      title: t('dashboard.stats.lowStockProducts'),
      value: stats.lowStockProducts,
      change: '-2',
      changeType: 'negative' as const,
      href: '/admin/products?filter=low_stock',
    },
    {
      title: t('dashboard.stats.pendingOrders'),
      value: stats.pendingOrders,
      change: '+5',
      changeType: 'positive' as const,
      href: '/admin/orders?status=pending',
    },
    {
      title: t('dashboard.stats.pendingReviews'),
      value: stats.pendingReviews,
      change: '+3',
      changeType: 'positive' as const,
      href: '/admin/reviews?status=pending',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #1234 received',
      time: '2 minutes ago',
      href: '/admin/orders/1234',
    },
    {
      id: 2,
      type: 'review',
      message: 'New review submitted for "Product A"',
      time: '15 minutes ago',
      href: '/admin/reviews',
    },
    {
      id: 3,
      type: 'inventory',
      message: 'Low stock alert for "Product B"',
      time: '1 hour ago',
      href: '/admin/products/456',
    },
    {
      id: 4,
      type: 'product',
      message: 'Product "Product C" was updated',
      time: '2 hours ago',
      href: '/admin/products/789',
    },
  ];

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('dashboard.subtitle', { name: user.email.split('@')[0] })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`
                          ml-2 flex items-baseline text-sm font-semibold
                          ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
                        `}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={stat.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      {t('dashboard.viewDetails')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {t('dashboard.recentActivity')}
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`
                              h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${activity.type === 'order' ? 'bg-blue-500' : ''}
                              ${activity.type === 'review' ? 'bg-yellow-500' : ''}
                              ${activity.type === 'inventory' ? 'bg-red-500' : ''}
                              ${activity.type === 'product' ? 'bg-green-500' : ''}
                            `}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {activity.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap">
                              <Link href={activity.href} className="font-medium text-primary-600 hover:text-primary-500">
                                {t('dashboard.view')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {t('dashboard.quickActions')}
              </h3>
              <div className="space-y-4">
                <Link href="/admin/products/new">
                  <Button className="w-full justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('dashboard.addProduct')}
                  </Button>
                </Link>
                <Link href="/admin/orders?status=pending">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('dashboard.processOrders')}
                  </Button>
                </Link>
                <Link href="/admin/reviews?status=pending">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {t('dashboard.moderateReviews')}
                  </Button>
                </Link>
                <Link href="/admin/products?filter=low_stock">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {t('dashboard.updateInventory')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAdminAuth();

export default AdminDashboard;