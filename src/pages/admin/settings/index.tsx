import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { withOwnerAuth, WithAdminAuthProps } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import Breadcrumbs from '@/components/admin/Breadcrumbs';

interface AdminSettingsProps extends WithAdminAuthProps {}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user }) => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'general', label: t('settings.general.title') },
    { id: 'shipping', label: t('settings.shipping.title') },
    { id: 'tax', label: t('settings.tax.title') },
    { id: 'users', label: t('settings.users.title') },
  ];

  const breadcrumbItems = [
    { label: t('nav.dashboard'), href: '/admin' },
    { label: t('nav.settings') },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings
      console.log('Saving settings...');
      // API call
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.general.storeName')}
        </label>
        <input
          type="text"
          defaultValue="My Store"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.general.storeEmail')}
        </label>
        <input
          type="email"
          defaultValue="store@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.general.storePhone')}
        </label>
        <input
          type="tel"
          defaultValue="+1234567890"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.general.currency')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.shipping.freeShippingThreshold')}
        </label>
        <input
          type="number"
          defaultValue="100"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Minimum order amount for free shipping
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.shipping.defaultShippingRate')}
        </label>
        <input
          type="number"
          defaultValue="10"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Default shipping rate for orders below threshold
        </p>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.tax.taxRate')}
        </label>
        <input
          type="number"
          defaultValue="8"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Tax rate as percentage
        </p>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          defaultChecked={true}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label className="ml-2 text-sm text-gray-700">
          {t('settings.tax.taxIncluded')}
        </label>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {t('settings.users.title')}
        </h3>
        <Button>
          {t('settings.users.addUser')}
        </Button>
      </div>
      
      {/* User list would go here */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('settings.users.role')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="ghost" size="sm">
                  {t('settings.users.editUser')}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'tax':
        return renderTaxSettings();
      case 'users':
        return renderUserSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h1>
          <p className="text-gray-600">Manage your store settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderTabContent()}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withOwnerAuth();

export default AdminSettings;