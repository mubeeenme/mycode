import React, { createContext, useContext, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Show toast notification
    const toastOptions: any = {
      duration: newNotification.duration,
    };

    if (newNotification.action) {
      toastOptions.action = {
        label: newNotification.action.label,
        onClick: newNotification.action.onClick,
      };
    }

    switch (newNotification.type) {
      case 'success':
        toast.success(newNotification.title, toastOptions);
        break;
      case 'error':
        toast.error(newNotification.title, toastOptions);
        break;
      case 'warning':
        toast(newNotification.title, {
          ...toastOptions,
          icon: '⚠️',
        });
        break;
      case 'info':
        toast(newNotification.title, {
          ...toastOptions,
          icon: 'ℹ️',
        });
        break;
    }

    // Auto dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'error', title, message, duration: 8000 });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    return showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissNotification,
      }}
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white shadow-lg border border-gray-200 rounded-lg',
          style: {
            background: 'white',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

// Activity feedback helpers for common admin actions
export const useActivityFeedback = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return {
    // Product feedback
    productCreated: (productName: string) => 
      showSuccess(`Product "${productName}" created successfully`),
    productUpdated: (productName: string) => 
      showSuccess(`Product "${productName}" updated successfully`),
    productDeleted: (productName: string) => 
      showWarning(`Product "${productName}" deleted`),
    inventoryUpdated: (productName: string, quantity: number) => 
      showSuccess(`Inventory updated for "${productName}". New quantity: ${quantity}`),
    
    // Order feedback
    orderStatusUpdated: (orderNumber: string, status: string) => 
      showSuccess(`Order #${orderNumber} marked as ${status}`),
    paymentCaptured: (orderNumber: string, amount: number) => 
      showSuccess(`Payment of $${amount.toFixed(2)} captured for order #${orderNumber}`),
    paymentRefunded: (orderNumber: string, amount: number) => 
      showSuccess(`Refund of $${amount.toFixed(2)} processed for order #${orderNumber}`),
    
    // Review feedback
    reviewApproved: (reviewTitle: string) => 
      showSuccess(`Review "${reviewTitle}" approved and published`),
    reviewRejected: (reviewTitle: string) => 
      showWarning(`Review "${reviewTitle}" rejected`),
    reviewResponseAdded: (reviewTitle: string) => 
      showSuccess(`Response added to review "${reviewTitle}"`),
    
    // General feedback
    actionCompleted: (action: string) => 
      showSuccess(`${action} completed successfully`),
    actionFailed: (action: string, error?: string) => 
      showError(`${action} failed`, error),
    actionRequired: (message: string) => 
      showInfo(message),
    
    // Bulk actions
    bulkActionCompleted: (action: string, count: number) => 
      showSuccess(`${count} items ${action} successfully`),
    bulkActionFailed: (action: string, failed: number, total: number) => 
      showError(`${failed} out of ${total} items failed to ${action}`),
  };
};