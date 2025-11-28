import { loadScript } from '@paypal/paypal-js';

export const paypal = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  async load() {
    return await loadScript({
      'client-id': this.clientId,
      currency: 'USD',
    });
  },
};