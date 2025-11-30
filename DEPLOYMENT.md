# Cloudflare Pages Deployment Guide

This guide will walk you through deploying your Cart & Checkout System to Cloudflare Pages in just a few minutes.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Your GitHub repository: `mubeeenme/mycode`
- All environment variables ready (see `.env.production.example`)

## Step 1: Go to Cloudflare Dashboard

1. Log in to your Cloudflare account at [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. In the left sidebar, click on **"Pages"**
3. Click the **"Create a project"** button

## Step 2: Connect Your GitHub Repository

1. Under **"Connect to Git"**, click **"Connect to Git"**
2. Click **"Connect to GitHub"** and authorize Cloudflare if prompted
3. Search for your repository: `mubeeenme/mycode`
4. Click **"Begin setup"**

## Step 3: Configure Build Settings

In the **"Build settings"** section, configure as follows:

| Setting | Value |
|---------|-------|
| **Framework preset** | `Next.js (Static HTML Export)` |
| **Build command** | `npm run build && npm run export` |
| **Build output directory** | `out` |
| **Root directory** | `/` |
| **Production branch** | `main` |

![Build Settings Configuration]
*(Note: The UI may look slightly different, but the values should match exactly)*

## Step 4: Add Environment Variables

This is the most important step! In the **"Environment variables"** section, add the following variables:

### Required Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://your-project.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   your_supabase_anon_key
   ```

3. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   ```
   pk_live_your_stripe_publishable_key
   ```

4. **NEXT_PUBLIC_PAYPAL_CLIENT_ID**
   ```
   your_paypal_client_id
   ```

5. **NEXT_PUBLIC_WORKER_API_URL**
   ```
   https://your-worker-api.workers.dev
   ```

6. **NODE_ENV**
   ```
   production
   ```

**Important:** Make sure to replace the placeholder values with your actual credentials!

## Step 5: Deploy

1. Click the **"Save and Deploy"** button
2. Cloudflare will automatically:
   - Pull your code from GitHub
   - Install dependencies
   - Run the build command
   - Deploy to their global network

Your site will be live in 2-3 minutes! You'll get a URL like: `https://your-project.pages.dev`

## Step 6: Verify Deployment

Once deployed, check:

1. ✅ Homepage loads correctly
2. ✅ Cart functionality works
3. ✅ Checkout flow is accessible
4. ✅ All pages render without errors
5. ✅ No console errors in browser

## Troubleshooting

### Build Fails

**Error:** "Module not found" or "Build command failed"
- Check that `package.json` has the correct scripts
- Verify all dependencies are in `package.json`
- Check the build logs for specific errors

### Environment Variables Not Working

**Error:** API calls failing or credentials missing
- Double-check variable names match exactly (including `NEXT_PUBLIC_` prefix)
- Ensure values are correctly copied without extra spaces
- Wait 1-2 minutes after adding variables for them to take effect

### Static Export Issues

**Error:** Pages not found or routing issues
- Ensure `next.config.js` has `output: 'export'`
- Check that `distDir: 'out'` is set
- Verify `trailingSlash: true` is configured

### Images Not Loading

**Error:** Images broken or not optimized
- Static export disables Next.js Image Optimization
- Use standard `<img>` tags or import images directly
- Ensure `images: { unoptimized: true }` is in `next.config.js`

## Next Steps After Deployment

1. **Test Payment Flows:** Set up your Stripe, PayPal, and Supabase credentials
2. **Add Products:** Use your admin dashboard to add products to the catalog
3. **Configure Domains:** Add custom domains in Cloudflare Pages settings
4. **Set Up Analytics:** Enable Cloudflare Analytics or integrate Google Analytics
5. **Monitor Performance:** Check Cloudflare Analytics for site performance

## Support

If you encounter any issues:

1. Check the Cloudflare Pages build logs
2. Verify all environment variables are set correctly
3. Ensure your GitHub repository is up to date
4. Review this troubleshooting section

Your Cart & Checkout System is now live on Cloudflare's global network! 🎉