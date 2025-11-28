/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      bindings: {
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        STRIPE_SECRET_KEY: 'sk_test_test',
        STRIPE_PUBLISHABLE_KEY: 'pk_test_test',
        PAYPAL_CLIENT_ID: 'test-client-id',
        PAYPAL_CLIENT_SECRET: 'test-client-secret',
        RESEND_API_KEY: 're_test_key',
        ADMIN_API_TOKEN: 'test-admin-token',
      },
    },
  },
});