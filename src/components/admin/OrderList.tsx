import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderListProps {
  initialFilters?: {
    status?: Order['status'];
    paymentStatus?: Order['payment_status'];
  };
}

const OrderList: React.FC<OrderListProps> = ({ initialFilters = {} }) => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  // Mock data - in real app, this would come from API
  const mockOrders: Order[] = [
    {
      id: '1',
      customer_id: 'cust_1',
      customer_info: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      },
      items: [
        {
          id: '1',
          productId: '1',
          name: 'Premium Wireless Headphones',
          price: 299.99,
          quantity: 1,
          image: '/images/headphones1.jpg',
          inventory: 45,
        },
      ],
      shipping_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        type: 'shipping',
      },
      billing_address: null,
      subtotal: 299.99,
      tax: 24.00,
      shipping: 10.00,
      total: 333.99,
      currency: 'USD',
      status: 'pending',
      payment_status: 'pending',
      payment_method: { type: 'stripe', providerId: 'pm_123' },
      payment_intent_id: 'pi_123',
      paypal_order_id: null,
      notes: null,
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-01-20T10:30:00Z',
    },
    {
      id: '2',
      customer_id: 'cust_2',
      customer_info: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      },
      items: [
        {
          id: '2',
          productId: '2',
          name: 'Organic Cotton T-Shirt',
          price: 29.99,
          quantity: 2,
          image: '/images/tshirt1.jpg',
          inventory: 20,
        },
      ],
      shipping_address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        type: 'shipping',
      },
      billing_address: null,
      subtotal: 59.98,
      tax: 4.80,
      shipping: 5.00,
      total: 69.78,
      currency: 'USD',
      status: 'processing',
      payment_status: 'completed',
      payment_method: { type: 'paypal', providerId: 'paypal_123' },
      payment_intent_id: null,
      paypal_order_id: 'paypal_123',
      notes: 'Gift wrap requested',
      created_at: '2024-01-19T14:20:00Z',
      updated_at: '2024-01-20T09:15:00Z',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockOrders];
      
      if (filters.status) {
        filtered = filtered.filter(o => o.status === filters.status);
      }
      
      if (filters.paymentStatus) {
        filtered = filtered.filter(o => o.payment_status === filters.paymentStatus);
      }
      
      setOrders(filtered);
      setLoading(false);
    }, 500);
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    console.log('Updating order status:', orderId, newStatus);
    alert(`Order #${orderId} status would be updated to ${newStatus}`);
    // API call to update status
  };

  const handlePaymentAction = async (orderId: string, action: 'capture' | 'refund') => {
    console.log('Payment action:', orderId, action);
    alert(`Payment action "${action}" would be performed on order #${orderId}`);
    // API call for payment action
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <p className="text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('orders.filter.all')}</option>
              <option value="pending">{t('orders.filter.pending')}</option>
              <option value="processing">{t('orders.filter.processing')}</option>
              <option value="shipped">{t('orders.filter.shipped')}</option>
              <option value="delivered">{t('orders.filter.delivered')}</option>
              <option value="cancelled">{t('orders.filter.cancelled')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">{t('orders.paymentStatus.pending')}</option>
              <option value="processing">{t('orders.paymentStatus.processing')}</option>
              <option value="completed">{t('orders.paymentStatus.completed')}</option>
              <option value="failed">{t('orders.paymentStatus.failed')}</option>
              <option value="refunded">{t('orders.paymentStatus.refunded')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by order #, customer email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.orderNumber')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.total')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('orders.details.paymentStatus')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.customer_info.firstName} {order.customer_info.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customer_info.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {t(`orders.filter.${order.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {t(`orders.paymentStatus.${order.payment_status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                    
                    {/* Status Actions */}
                    {order.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                      >
                        {t('orders.actions.markProcessing')}
                      </Button>
                    )}
                    
                    {order.status === 'processing' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      >
                        {t('orders.actions.markShipped')}
                      </Button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        {t('orders.actions.markDelivered')}
                      </Button>
                    )}
                    
                    {/* Payment Actions */}
                    {order.payment_status === 'pending' && order.payment_method.type === 'stripe' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePaymentAction(order.id, 'capture')}
                      >
                        {t('orders.actions.capturePayment')}
                      </Button>
                    )}
                    
                    {order.payment_status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePaymentAction(order.id, 'refund')}
                      >
                        {t('orders.actions.refundPayment')}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;