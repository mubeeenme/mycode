# 🔧 Troubleshooting Guide
## Common Issues and Solutions

This guide covers the most frequent problems you might encounter when building your e-commerce store with Framer, Shopify, and Cloudflare.

---

## Table of Contents

1. [Shopify Issues](#shopify-issues)
2. [Framer Issues](#framer-issues)
3. [Cloudflare Issues](#cloudflare-issues)
4. [Integration Issues](#integration-issues)
5. [Performance Issues](#performance-issues)
6. [Payment & Checkout Issues](#payment--checkout-issues)
7. [Domain & DNS Issues](#domain--dns-issues)

---

## Shopify Issues

### Issue 1: Products Not Appearing in Framer

**Symptoms:**
- Framer shows "No products found"
- Product grid is empty
- Products show in Shopify Admin but not on your site

**Causes & Solutions:**

**Cause A: Buy Button Channel Not Enabled**
1. Go to Shopify Admin
2. Navigate to **Settings → Apps and Sales Channels**
3. Click **"Develop apps"** or look for **"Buy Button"**
4. Click **"Install"** or **"Enable"**
5. Return to Framer and refresh the connection

**Cause B: Products Not Published to Buy Button Channel**
1. In Shopify Admin, go to **Products**
2. Click on a product
3. Scroll to **"Product Availability"** section
4. Check the box for **"Buy Button"** sales channel
5. Click **"Save"**
6. Repeat for all products (or use bulk editor)

**Cause C: Products in Draft Status**
1. In Shopify Admin → **Products**
2. Check product status column
3. If it says "Draft," click the product
4. Click **"Active"** at the top
5. Save changes

---

### Issue 2: Inventory Showing as "Out of Stock" Incorrectly

**Symptoms:**
- Products show "Sold Out" but you have inventory
- Can't add items to cart

**Solutions:**

1. Go to Shopify Admin → **Products** → Select product
2. Scroll to **"Inventory"** section
3. Verify **"Track Quantity"** is enabled
4. Check **"Available"** quantity is > 0
5. If using variants, check each variant's inventory
6. Click **"Save"**

**Advanced Solution (Multiple Locations):**
1. Go to **Settings → Locations**
2. Ensure you have at least one active location
3. Return to product and assign inventory to that location

---

### Issue 3: Shipping Rates Not Calculating

**Symptoms:**
- Checkout shows "Shipping unavailable"
- No shipping options appear

**Solutions:**

1. Go to Shopify Admin → **Settings → Shipping and Delivery**
2. Click on your shipping profile (usually "General Profile")
3. Verify you have at least one shipping zone configured
4. For each zone:
   - Add countries/regions you ship to
   - Set at least one shipping rate (flat rate or calculated)
5. Click **"Save"**

**Quick Fix:**
- Add a basic flat rate: $5 for domestic, $15 for international
- You can refine rates later based on actual costs

---

### Issue 4: Tax Not Being Collected

**Symptoms:**
- Checkout doesn't show tax
- Orders complete without tax calculation

**Solutions:**

1. Go to Shopify Admin → **Settings → Taxes and Duties**
2. Enable **"Collect Sales Tax"**
3. For US stores:
   - Click **"United States"**
   - Enable tax collection for states where you have nexus
   - Shopify auto-calculates based on customer address
4. For other countries:
   - Enable tax collection per country
   - Set VAT/GST rates as applicable
5. Click **"Save"**

**Note:** You're legally required to collect tax where you have "nexus" (physical presence or significant sales). Consult a tax professional if unsure.

---

## Framer Issues

### Issue 5: Framer Site Not Updating After Changes

**Symptoms:**
- Made changes in editor but they don't appear on live site
- Old content still showing

**Solutions:**

**Solution A: Cache Issue**
1. In Framer editor, click **"Publish"** again (top-right)
2. Wait 30 seconds for deployment
3. Hard-refresh your browser:
   - **Windows:** Ctrl + Shift + R
   - **Mac:** Cmd + Shift + R
   - **Mobile:** Clear browser cache in settings

**Solution B: Publishing Status**
1. Check if you're viewing the correct project (check project name in top-left)
2. Ensure you clicked **"Publish"** not just **"Save"**
3. Verify in **"Settings → Publishing"** that site is published

**Solution C: Branch/Version Issue**
1. In Framer, click **"Version History"** (clock icon in toolbar)
2. Confirm you're on the latest version
3. If not, click **"Restore"** on the latest version
4. Republish

---

### Issue 6: Framer Shopify Connection Broken

**Symptoms:**
- Error message: "Could not connect to Shopify"
- Products disappeared from site
- Authentication popup appears repeatedly

**Solutions:**

1. In Framer, click any Shopify component
2. In right panel, click **"Disconnect"**
3. Click **"Connect to Shopify"** again
4. Re-authorize the connection
5. Refresh product components

**If Problem Persists:**
1. Go to Shopify Admin → **Settings → Apps and Sales Channels**
2. Find **"Framer"** in the list
3. Click **"Uninstall"**
4. Return to Framer and reconnect (will reinstall automatically)

---

### Issue 7: Mobile Layout Broken

**Symptoms:**
- Site looks fine on desktop but broken on mobile
- Text overlapping, buttons too small, images cut off

**Solutions:**

1. In Framer editor, click the **device icon** in top toolbar
2. Toggle to **mobile view** (phone icon)
3. Check each page section:
   - Ensure padding is adequate (minimum 20px on sides)
   - Verify font sizes are readable (minimum 16px for body text)
   - Check images aren't stretched or distorted
4. Use **"Stack"** layout for mobile (auto-stacks elements vertically)
5. Hide desktop-only elements on mobile:
   - Select element → Right panel → **"Display"** → Hide on mobile

**Pro Tip:** Framer auto-generates mobile layouts, but always manually review.

---

### Issue 8: Slow Site Performance in Framer

**Symptoms:**
- Site takes 3+ seconds to load
- Google PageSpeed score below 70
- Images load slowly

**Solutions:**

**Solution A: Optimize Images**
1. Before uploading to Framer, compress images at [tinypng.com](https://tinypng.com)
2. Target: 100-200KB per image
3. Use correct dimensions:
   - Hero images: 2000x1000px
   - Product images: 1200x1200px
   - Thumbnails: 400x400px
4. In Framer, right-click image → **"Image Settings"** → Enable **"Lazy Loading"**

**Solution B: Reduce Animations**
1. Limit animations to hero section and key interactions
2. Avoid animating large elements
3. Use **"will-change"** sparingly (Framer handles this automatically)

**Solution C: Audit External Scripts**
1. Go to Framer **Settings → Integrations**
2. Remove unused tracking scripts (old analytics, etc.)
3. Load third-party scripts asynchronously

**Solution D: Check Cloudflare Optimization**
1. In Cloudflare → **Speed → Optimization**
2. Enable **Auto Minify** (HTML, CSS, JS)
3. Enable **Brotli** compression
4. Enable **Early Hints**

---

## Cloudflare Issues

### Issue 9: Domain Not Resolving / Site Not Loading

**Symptoms:**
- Error: "This site can't be reached"
- DNS_PROBE_FINISHED_NXDOMAIN error
- Site doesn't load on custom domain

**Solutions:**

**Check 1: Nameserver Configuration**
1. Log in to your domain registrar (Namecheap, GoDaddy, etc.)
2. Go to domain management → **Nameservers**
3. Verify nameservers match what Cloudflare provided:
   - Should be something like `dana.ns.cloudflare.com` and `otis.ns.cloudflare.com`
4. If not, update nameservers and wait 24-48 hours for propagation

**Check 2: DNS Records**
1. In Cloudflare Dashboard → **DNS**
2. Verify you have these records:
   - **CNAME** for `www` pointing to Framer's address (e.g., `framer.app`)
   - **A** or **CNAME** for root domain (`@`) if applicable
3. Proxy status should be **"Proxied"** (orange cloud icon)

**Check 3: SSL/TLS Mode**
1. Cloudflare → **SSL/TLS** → **Overview**
2. Set to **"Full (Strict)"** or **"Full"**
3. Wait 15 minutes for certificate provisioning

**Verification Tool:**
- Visit [whatsmydns.net](https://www.whatsmydns.net)
- Enter your domain
- Check if DNS is resolving globally
- If "No results" → DNS not propagated yet (wait 24-48 hours)

---

### Issue 10: SSL Certificate Error / "Not Secure" Warning

**Symptoms:**
- Browser shows "Not Secure" or padlock with warning
- ERR_CERT_COMMON_NAME_INVALID error
- Mixed content warnings

**Solutions:**

**Solution A: SSL Mode Mismatch**
1. Cloudflare Dashboard → **SSL/TLS**
2. Change mode to **"Full (Strict)"**
3. Wait 15 minutes
4. Hard-refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

**Solution B: Certificate Provisioning Incomplete**
1. Check if certificate is active:
   - Cloudflare → **SSL/TLS → Edge Certificates**
   - Look for "Status: Active"
2. If "Provisioning," wait 15-30 minutes
3. If "Failed," click **"Delete"** and let Cloudflare reprovision

**Solution C: Mixed Content (HTTP in HTTPS page)**
1. Cloudflare → **SSL/TLS → Edge Certificates**
2. Enable **"Always Use HTTPS"**
3. Enable **"Automatic HTTPS Rewrites"**
4. This forces all HTTP resources to HTTPS

---

### Issue 11: Cloudflare Cache Showing Old Content

**Symptoms:**
- Updated site but old version still shows
- Changes appear in Framer preview but not live site

**Solutions:**

**Solution A: Purge Cache**
1. Cloudflare Dashboard → **Caching**
2. Click **"Purge Everything"**
3. Wait 30 seconds
4. Hard-refresh browser

**Solution B: Adjust Cache Rules**
1. Cloudflare → **Caching → Configuration**
2. Check **"Browser Cache TTL"** (set to 4 hours for frequently updating sites)
3. For specific pages, create **Page Rules**:
   - Caching → **Page Rules** → **"Create Page Rule"**
   - URL pattern: `*mystore.com/products*`
   - Setting: **"Cache Level: Standard"**

**Pro Tip:** After major site updates, always purge Cloudflare cache.

---

## Integration Issues

### Issue 12: Framer + Shopify Cart Not Syncing

**Symptoms:**
- Add item to cart but cart icon doesn't update
- Cart shows wrong quantity
- Cart empties unexpectedly

**Solutions:**

**Solution A: Cookie Issues**
1. Ensure your site uses HTTPS (required for cookies)
2. Check browser privacy settings aren't blocking third-party cookies
3. In Framer, verify Shopify components are using latest version:
   - Click component → Right panel → Check for **"Update"** button

**Solution B: Re-initialize Cart**
1. In Framer, select the **Cart Icon** component
2. Right panel → **"Reset Cart"** (if option exists)
3. Test by adding product in preview mode

**Solution C: Clear Browser Data**
1. Ask customer to clear cookies for your site
2. Or use incognito/private browsing mode to test
3. This resets Shopify's cart session

---

### Issue 13: Email Signup Form Not Capturing Emails

**Symptoms:**
- Form submits but emails don't appear in Mailchimp/Klaviyo
- "Success" message shows but no data saved

**Solutions:**

1. In Framer, click the form component
2. Right panel → **"Form Settings"**
3. Verify integration is connected:
   - Should show **"Connected to [Your Email Service]"**
   - If not, click **"Connect"** and re-authenticate
4. Check field mapping:
   - Email input field must be named **"email"** (lowercase)
5. Test submission:
   - Use your own email
   - Check spam folder in email service
   - Verify in email service's dashboard (Contacts/Subscribers)

**Mailchimp-Specific:**
- Ensure the **Audience** (list) is selected in Framer settings
- Check that single opt-in or double opt-in is configured

---

## Performance Issues

### Issue 14: High Bandwidth Usage in Cloudflare

**Symptoms:**
- Cloudflare shows high bandwidth consumption
- Approaching free tier limit

**Solutions:**

1. **Optimize Images:**
   - Use Cloudflare's **Image Resizing** (Pro plan) or compress manually
   - Convert to WebP format (modern browsers only)

2. **Enable Argo Smart Routing (Paid):**
   - Cloudflare → **Traffic → Argo**
   - Reduces bandwidth by optimizing routes

3. **Audit Traffic Sources:**
   - Cloudflare → **Analytics → Traffic**
   - Check if bot traffic is inflating numbers
   - Enable **"Bot Fight Mode"** (Security → Bots)

4. **Implement Cache Rules:**
   - Cache more aggressively (longer TTL)
   - Cache HTML pages (if content doesn't change frequently)

---

### Issue 15: Slow Checkout Process

**Symptoms:**
- Checkout page takes 5+ seconds to load
- Customers abandoning carts

**Solutions:**

**Note:** Checkout is hosted by Shopify, not Framer/Cloudflare.

1. **Optimize Shopify Checkout:**
   - Shopify Admin → **Settings → Checkout**
   - Disable unnecessary fields (company name, etc.)
   - Enable **"One-page checkout"**

2. **Remove Checkout Scripts:**
   - Shopify Admin → **Settings → Checkout**
   - Scroll to **"Order Processing → Additional Scripts"**
   - Remove or minimize custom scripts (tracking pixels, etc.)

3. **Use Shopify Payments:**
   - Shopify's own payment gateway is fastest
   - Third-party gateways add latency

4. **Enable Shop Pay:**
   - Allows repeat customers to checkout in 1 click
   - Shopify Admin → **Settings → Payments** → Enable **"Shop Pay"**

---

## Payment & Checkout Issues

### Issue 16: Payments Failing / Declined Cards

**Symptoms:**
- Customer cards being declined
- Payment gateway errors
- Orders not completing

**Solutions:**

1. **Check Payment Gateway Status:**
   - Shopify Admin → **Settings → Payments**
   - Verify gateway is **"Active"**
   - Check for any error messages

2. **Test Mode Enabled:**
   - If using Stripe/PayPal in test mode, only test cards work
   - Switch to **"Live Mode"** in gateway settings

3. **Fraud Prevention Too Strict:**
   - Shopify Admin → **Settings → Payments**
   - Scroll to **"Fraud Analysis"**
   - Adjust risk thresholds (be cautious)

4. **Card Type Not Accepted:**
   - Verify you accept all major cards (Visa, Mastercard, Amex, Discover)
   - Some gateways require manual enablement of Amex

**Common Test Cards (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

### Issue 17: Abandoned Cart Recovery Not Working

**Symptoms:**
- Customers leaving carts but not receiving follow-up emails

**Solutions:**

1. **Enable Abandoned Cart Emails:**
   - Shopify Admin → **Settings → Notifications**
   - Scroll to **"Abandoned Checkouts"**
   - Click **"Edit"** and ensure it's enabled

2. **Set Timing:**
   - Choose delay (recommend 1 hour after abandonment)
   - Can send up to 3 follow-ups (1 hour, 24 hours, 72 hours)

3. **Customize Email:**
   - Make subject line compelling: "You left something behind! 🛒"
   - Add discount code to incentivize completion

4. **Check Email Deliverability:**
   - Test by abandoning a cart with your own email
   - Check spam folder
   - Verify sender email is from your domain (not `@myshopify.com`)

---

## Domain & DNS Issues

### Issue 18: Subdomain Not Working (www vs non-www)

**Symptoms:**
- `www.mystore.com` works but `mystore.com` doesn't (or vice versa)

**Solutions:**

**Solution A: Add Both Records in Cloudflare**
1. Cloudflare → **DNS**
2. Add two CNAME records:
   - **Name:** `www` → **Target:** Framer's address
   - **Name:** `@` (root) → **Target:** Framer's address
3. Both set to **"Proxied"**

**Solution B: Redirect Rule**
1. Cloudflare → **Rules → Redirect Rules**
2. Create rule to redirect `mystore.com` to `www.mystore.com` (or opposite)
3. Status code: 301 (permanent)

**Framer-Specific:**
1. In Framer → **Settings → Domain**
2. Add both domains (`mystore.com` and `www.mystore.com`)
3. Set one as primary

---

### Issue 19: Email Not Working After Moving to Cloudflare

**Symptoms:**
- Can't send/receive email after changing nameservers
- Email bouncing back

**Solutions:**

1. **Add Email DNS Records:**
   - Cloudflare → **DNS**
   - Add **MX records** from your email provider:
     - For Gmail/Google Workspace: [G Suite MX records](https://support.google.com/a/answer/174125)
     - For Outlook/Microsoft 365: [Microsoft MX records](https://docs.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider)
   - Proxy status: **"DNS Only"** (gray cloud)

2. **Add SPF, DKIM, DMARC Records:**
   - Required for email deliverability
   - Get from your email provider
   - Add as **TXT records** in Cloudflare

**Verification:**
- Send test email to [mail-tester.com](https://www.mail-tester.com)
- Should score 8/10 or higher

---

## Getting Additional Help

If you've tried these solutions and still have issues:

1. **Framer Support:**
   - In Framer editor → **Help** → **Chat with Support**
   - Or visit [framer.com/support](https://www.framer.com/support)
   - Response time: Usually within 1 hour

2. **Shopify Support:**
   - Shopify Admin → **Help** (bottom-left corner)
   - Phone: 1-855-816-3857 (US/Canada, 24/7)
   - Chat: Available 24/7 in admin
   - Email: [email protected]

3. **Cloudflare Support:**
   - [dash.cloudflare.com/support](https://dash.cloudflare.com/support)
   - Community forum: [community.cloudflare.com](https://community.cloudflare.com)
   - Free tier: Community support only
   - Paid tiers: Email/chat support

4. **Community Help:**
   - [Framer Community](https://www.framer.community)
   - [Shopify Community](https://community.shopify.com)
   - Reddit: [r/shopify](https://reddit.com/r/shopify), [r/cloudflare](https://reddit.com/r/cloudflare)

---

## Preventative Maintenance

To avoid issues, follow these best practices:

**Weekly:**
- [ ] Check Shopify for failed orders or payment issues
- [ ] Review analytics for unusual traffic patterns
- [ ] Test checkout flow on mobile and desktop

**Monthly:**
- [ ] Backup Shopify products (export CSV)
- [ ] Review Cloudflare analytics and optimize
- [ ] Update Framer site with new products/content
- [ ] Check email deliverability score

**Quarterly:**
- [ ] Audit site speed (Google PageSpeed Insights)
- [ ] Review and update legal pages (policies)
- [ ] Check for Shopify app updates
- [ ] Renew SSL certificates (auto-renews, but verify)

---

**Return to [README.md](./README.md) for the main guide.**
