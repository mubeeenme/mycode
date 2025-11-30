import { supabase } from '@/lib/supabase';
import { AuditLog } from '@/types/admin';

export class AuditLogger {
  static async log({
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      const { error } = await (supabase.from('audit_logs') as any)
        .insert({
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  static async logProductAction({
    userId,
    action,
    productId,
    productData,
    previousData,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: 'created' | 'updated' | 'deleted' | 'inventory_updated';
    productId: string;
    productData?: Record<string, any>;
    previousData?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const details: Record<string, any> = { action };

    if (action === 'created' && productData) {
      details.newData = {
        name: productData.name,
        price: productData.price,
        sku: productData.sku,
        status: productData.status,
      };
    } else if (action === 'updated' && productData && previousData) {
      details.changes = {};
      
      // Track specific fields that changed
      const fieldsToTrack = ['name', 'price', 'status', 'inventoryQuantity'];
      fieldsToTrack.forEach(field => {
        if (productData[field] !== previousData[field]) {
          details.changes[field] = {
            from: previousData[field],
            to: productData[field],
          };
        }
      });
    } else if (action === 'inventory_updated' && productData) {
      details.inventoryUpdate = {
        previousQuantity: previousData?.inventoryQuantity,
        newQuantity: productData.inventoryQuantity,
        reason: productData.reason || 'Manual update',
      };
    }

    return this.log({
      userId,
      action: `product_${action}`,
      entityType: 'product',
      entityId: productId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logOrderAction({
    userId,
    action,
    orderId,
    orderData,
    previousData,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: 'status_updated' | 'payment_captured' | 'payment_refunded' | 'cancelled';
    orderId: string;
    orderData?: Record<string, any>;
    previousData?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const details: Record<string, any> = { action };

    if (action === 'status_updated' && orderData && previousData) {
      details.statusChange = {
        from: previousData.status,
        to: orderData.status,
      };
    } else if (action === 'payment_captured') {
      details.paymentCapture = {
        amount: orderData?.total,
        method: orderData?.payment_method?.type,
      };
    } else if (action === 'payment_refunded') {
      details.refund = {
        amount: orderData?.refundAmount,
        reason: orderData?.refundReason,
      };
    } else if (action === 'cancelled') {
      details.cancellation = {
        reason: orderData?.cancellationReason,
        refundIssued: orderData?.refundIssued,
      };
    }

    return this.log({
      userId,
      action: `order_${action}`,
      entityType: 'order',
      entityId: orderId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logReviewAction({
    userId,
    action,
    reviewId,
    reviewData,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: 'approved' | 'rejected' | 'hidden' | 'responded' | 'deleted';
    reviewId: string;
    reviewData?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const details: Record<string, any> = { action };

    if (action === 'responded' && reviewData) {
      details.response = {
        content: reviewData.response,
        previousResponse: reviewData.previousResponse,
      };
    } else if (action === 'approved' || action === 'rejected' || action === 'hidden') {
      details.review = {
        rating: reviewData?.rating,
        customerName: reviewData?.customerName,
      };
    }

    return this.log({
      userId,
      action: `review_${action}`,
      entityType: 'review',
      entityId: reviewId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logCustomerAction({
    userId,
    action,
    customerId,
    customerData,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: 'role_updated' | 'banned' | 'unbanned' | 'note_added';
    customerId: string;
    customerData?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const details: Record<string, any> = { action };

    if (action === 'role_updated' && customerData) {
      details.roleChange = {
        from: customerData.previousRole,
        to: customerData.newRole,
      };
    } else if (action === 'note_added') {
      details.note = {
        content: customerData?.note,
        customerEmail: customerData?.email,
      };
    }

    return this.log({
      userId,
      action: `customer_${action}`,
      entityType: 'customer',
      entityId: customerId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logSettingsAction({
    userId,
    action,
    settingsData,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: 'updated' | 'backup_created' | 'restored';
    settingsData?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const details: Record<string, any> = { action };

    if (action === 'updated' && settingsData) {
      details.changes = settingsData.changes || {};
    } else if (action === 'backup_created') {
      details.backup = {
        filename: settingsData?.filename,
        size: settingsData?.size,
      };
    }

    return this.log({
      userId,
      action: `settings_${action}`,
      entityType: 'settings',
      entityId: 'system',
      details,
      ipAddress,
      userAgent,
    });
  }

  static async getAuditLogs(filters?: {
    userId?: string;
    entityType?: AuditLog['entityType'];
    entityId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = (supabase.from('audit_logs') as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return { logs: [], total: 0 };
      }

      return {
        logs: (data || []) as AuditLog[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0 };
    }
  }
}

// Helper function to get client IP and user agent
export function getClientInfo(req?: any): { ipAddress: string | null; userAgent: string | null } {
  if (typeof window !== 'undefined') {
    return {
      ipAddress: null,
      userAgent: navigator.userAgent,
    };
  }

  if (req) {
    return {
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    };
  }

  return {
    ipAddress: null,
    userAgent: null,
  };
}