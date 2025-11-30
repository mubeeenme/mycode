# Cloudflare Pages Deployment Guide

This guide explains how to deploy this Next.js application to Cloudflare Pages.

## Overview

This application is configured for **static export** using Next.js 14's `output: 'export'` feature. The build process generates a fully static website in the `out` directory that can be deployed to Cloudflare Pages.

## Configuration Summary

### Next.js Configuration (`next.config.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // Enable static export
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,       // Required for static export
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
};

export const config = {
  staticPageGeneration: true,
};

export default nextConfig;
```

### Build Configuration

- **Build Command**: `npm run build`
- **Build Output Directory**: `out`
- **Package Manager**: npm
- **Node Version**: 18.x or higher

## Cloudflare Pages Setup

### Step 1: Create a New Project

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Select **Connect to Git** or **Direct Upload**

### Step 2: Configure Build Settings

If using Git integration:

1. **Production branch**: `main` (or your default branch)
2. **Build command**: `npm run build`
3. **Build output directory**: `out`
4. **Root directory**: `/` (leave as default)

### Step 3: Environment Variables

Add the following environment variables in the Cloudflare Pages project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_WORKER_API_URL=https://your-worker-api.workers.dev
```

**Important**: For production deployments, ensure you use production keys and credentials.

### Step 4: Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete
3. Your site will be available at: `https://your-project.pages.dev`

## Local Testing

To test the production build locally:

```bash
# Build the static export
npm run build

# Serve the output directory
npx serve out

# Or use any static file server
python3 -m http.server -d out 8080
```

Then navigate to `http://localhost:8080` (or the port shown).

## Verifying the Build

After building, verify that the `out` directory contains:

```
out/
├── 404.html           # Custom 404 page
├── index.html         # Homepage
└── _next/             # Next.js assets (JS, CSS, etc.)
```

## Troubleshooting

### 404 Errors

If you see 404 errors on Cloudflare Pages:

1. Verify the build output directory is set to `out`
2. Check that `output: 'export'` is set in `next.config.mjs`
3. Ensure the build completed successfully
4. Check the build logs in Cloudflare Pages dashboard

### Build Failures

If the build fails:

1. Check Node.js version (must be 18.x or higher)
2. Verify all dependencies are in `package.json`
3. Review environment variables
4. Check build logs for specific errors

### Missing Environment Variables

- The app will work without environment variables but with limited functionality
- Supabase features will use a mock client
- Payment integrations will not work without proper API keys

## Custom Domains

To add a custom domain:

1. Go to your project in Cloudflare Pages
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the DNS configuration instructions

## Limitations of Static Export

With static export, the following Next.js features are **not available**:

- ❌ Server-side rendering (SSR)
- ❌ API routes
- ❌ Image optimization (using default next/image)
- ❌ Incremental static regeneration (ISR)
- ❌ Built-in i18n routing

The application uses:

- ✅ Client-side data fetching
- ✅ Static HTML generation
- ✅ Client-side routing
- ✅ Unoptimized images
- ✅ Client-side i18n (next-i18next without routing)

## Additional Resources

- [Next.js Static Exports Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Framework Guides](https://developers.cloudflare.com/pages/framework-guides/)

## Support

If you encounter issues:

1. Check the build logs in Cloudflare Pages
2. Verify local build works: `npm run build && npx serve out`
3. Review the Cloudflare Pages deployment logs
4. Ensure all environment variables are set correctly
