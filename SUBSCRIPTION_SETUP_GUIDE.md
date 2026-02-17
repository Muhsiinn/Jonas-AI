# Complete Subscription Setup Guide

This guide covers the complete setup and testing of the subscription workflow for the Jonas AI platform.

## Architecture Overview

The subscription system uses Stripe for payment processing with the following flow:

1. **User initiates checkout** → Frontend calls `/api/v1/subscription/checkout`
2. **Backend creates Stripe session** → Returns checkout URL
3. **User completes payment** → Stripe redirects to `/checkout/success`
4. **Webhook updates database** → Stripe sends `checkout.session.completed` event
5. **Frontend polls status** → Success page checks subscription status
6. **User gets premium access** → All premium features unlocked

## Prerequisites

- Stripe account (test mode for development)
- PostgreSQL database
- Backend server running on port 8000
- Frontend server running on port 3000

## Step 1: Stripe Dashboard Setup

### 1.1 Create a Product and Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Click "Add product"
3. Set product name: "Jonas Premium"
4. Set pricing:
   - Price: $5.00
   - Billing period: Monthly
   - Currency: USD
5. Click "Save product"
6. **Copy the Price ID** (starts with `price_`)

### 1.2 Get API Keys

1. Go to [API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 2: Environment Variables

### Backend (.env)

Create or update `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jonas
SECRET_KEY=your-secret-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRICE_ID_PREMIUM=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Will get this in Step 3

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Other required vars
OPENROUTER_API_KEY=your-key-here
```

### Frontend (.env.local)

Create or update `client/.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxxxx
```

**Important**: Frontend env vars must start with `NEXT_PUBLIC_` to be accessible in the browser.

## Step 3: Webhook Setup

### Development (Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   
   # Windows
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Start webhook forwarding**:
   ```bash
   # On Linux/macOS (use localhost)
   stripe listen --forward-to http://localhost:8000/api/v1/subscription/webhook
   
   # If running backend in Docker on Linux, you may need:
   stripe listen --forward-to http://127.0.0.1:8000/api/v1/subscription/webhook
   
   # On Windows with Docker, use:
   stripe listen --forward-to http://host.docker.internal:8000/api/v1/subscription/webhook
   ```
   
   **Note**: If you see "no such host" errors, make sure you're using the correct hostname:
   - Linux: Use `localhost` or `127.0.0.1`
   - macOS: Use `localhost` 
   - Windows with Docker: Use `host.docker.internal`

4. **Copy the webhook signing secret** (starts with `whsec_`):
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. **Add to backend .env**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

6. **Restart backend server** to load the new secret

### Production

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/v1/subscription/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to production environment variables

## Step 4: Start Services

### Backend

```bash
cd backend
source .venv/bin/activate  # or your virtual environment
uvicorn app.main:app --reload --port 8000
```

Verify Stripe is configured:
- Check logs for "Stripe API key configured"
- If you see warnings, check your `.env` file

### Frontend

```bash
cd client
npm run dev
```

Verify environment variables:
- Check browser console for any Stripe errors
- Visit `/checkout` - should not show configuration errors

### Webhook Listener (Development Only)

```bash
stripe listen --forward-to http://localhost:8000/api/v1/subscription/webhook
```

Keep this running in a separate terminal.

## Step 5: Testing the Workflow

### Test 1: Complete Checkout Flow

1. **Start all services** (backend, frontend, webhook listener)
2. **Login to your app**
3. **Navigate to `/checkout`**
4. **Click "Subscribe for $5/month"**
5. **Use Stripe test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
6. **Complete payment**
7. **Verify**:
   - Redirects to `/checkout/success`
   - Shows "Processing Your Subscription"
   - After a few seconds, shows "Welcome to Premium!"
   - Redirects to dashboard
   - Premium features are unlocked

### Test 2: Webhook Processing

1. **Check backend logs** for webhook events:
   ```
   Processing webhook event: checkout.session.completed
   Updated user 1 subscription: active
   ```

2. **Check database**:
   ```sql
   SELECT id, email, subscription_plan, subscription_status, stripe_subscription_id
   FROM users
   WHERE id = 1;
   ```
   Should show:
   - `subscription_plan`: `premium`
   - `subscription_status`: `active`
   - `stripe_subscription_id`: `sub_xxxxx`

### Test 3: Premium Feature Access

1. **Try accessing premium features**:
   - Click "Read Lesson" → Should work (not show upgrade modal)
   - Click "AI Roleplay" → Should work
   - Navigate to `/read` → Should load lesson
   - Navigate to `/roleplay` → Should load roleplay

2. **Verify backend protection**:
   - All premium endpoints use `require_premium` dependency
   - Backend validates subscription on every request

### Test 4: Webhook Events

Test different webhook events using Stripe CLI:

```bash
# Test subscription update
stripe trigger customer.subscription.updated

# Test payment failure
stripe trigger invoice.payment_failed

# Test subscription deletion
stripe trigger customer.subscription.deleted
```

Check backend logs and database to verify events are processed correctly.

### Test 5: Subscription Cancellation

1. **Cancel subscription via API**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/subscription/cancel \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Or cancel in Stripe Dashboard**:
   - Go to Customers → Select customer → Subscriptions
   - Click "Cancel subscription"

3. **Verify**:
   - Webhook fires `customer.subscription.deleted`
   - Database updated: `subscription_plan = 'free'`
   - Frontend shows locked features

## Step 6: Troubleshooting

### Issue: "Price ID not configured"

**Solution**:
- Check `client/.env.local` has `NEXT_PUBLIC_STRIPE_PRICE_ID`
- Restart frontend server
- Clear browser cache

### Issue: "Stripe API key not configured"

**Solution**:
- Check `backend/.env` has `STRIPE_SECRET_KEY`
- Restart backend server
- Check logs for validation warnings

### Issue: Webhook not receiving events

**Solution**:
1. Verify webhook listener is running: `stripe listen --forward-to ...`
2. Check `STRIPE_WEBHOOK_SECRET` in backend `.env`
3. Verify webhook endpoint is accessible: `http://localhost:8000/api/v1/subscription/webhook`
4. Check backend logs for signature verification errors

### Issue: Subscription status not updating

**Solution**:
1. Check webhook logs in Stripe Dashboard
2. Verify webhook signature is correct
3. Check database directly: `SELECT * FROM users WHERE id = 1;`
4. Hard refresh frontend (Ctrl+Shift+R)
5. Check browser console for API errors

### Issue: Premium features still locked after payment

**Solution**:
1. Check subscription status endpoint: `GET /api/v1/subscription/status`
2. Verify database has correct subscription data
3. Check frontend is using `SubscriptionContext` (should be in root layout)
4. Try closing and reopening the app
5. Check browser console for subscription context errors

### Issue: "Missing stripe-signature header"

**Solution**:
- This means the request is not coming from Stripe
- Verify webhook URL is correct
- Check if using Stripe CLI, the forwarding is active
- In production, verify webhook endpoint URL in Stripe Dashboard

## Step 7: Production Checklist

Before going live:

- [ ] Switch to Stripe live mode
- [ ] Update all environment variables with live keys
- [ ] Set up production webhook endpoint
- [ ] Test with real payment method (small amount)
- [ ] Verify webhook events are received
- [ ] Test subscription cancellation flow
- [ ] Test payment failure handling
- [ ] Set up monitoring/alerting for webhook failures
- [ ] Review Stripe Dashboard webhook logs
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enabled (required for webhooks)

## Security Notes

1. **Never commit `.env` files** - They contain sensitive keys
2. **Use different keys for dev/prod** - Never use live keys in development
3. **Webhook signature verification** - Always verify webhook signatures
4. **Backend validation** - Frontend checks are UX only, backend enforces access
5. **HTTPS required** - Webhooks require HTTPS in production

## Monitoring

### Stripe Dashboard

- **Webhooks**: Monitor delivery status and retries
- **Customers**: View subscription status
- **Events**: See all webhook events

### Backend Logs

Monitor for:
- Webhook processing errors
- Stripe API errors
- Database update failures

### Database Queries

Check subscription status:
```sql
SELECT 
    id, 
    email, 
    subscription_plan, 
    subscription_status,
    stripe_subscription_id,
    subscription_current_period_end
FROM users
WHERE subscription_plan = 'premium';
```

## Support

For issues:
1. Check this guide first
2. Review `backend/WEBHOOK_SETUP.md` for webhook-specific issues
3. Check Stripe Dashboard for webhook delivery status
4. Review backend logs for errors
5. Check browser console for frontend errors

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
