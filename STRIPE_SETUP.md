# Stripe Payment Setup for VietLinker-v4

## Overview
The payment system is fully implemented and ready to use. You only need to configure Stripe API keys.

## Stripe Dashboard Setup

1. **Create Stripe Account**: Go to https://stripe.com and create an account
2. **Get API Keys**: 
   - Go to Developers > API keys
   - Copy "Publishable key" (starts with `pk_test_`)
   - Copy "Secret key" (starts with `sk_test_`)

3. **Configure Webhook**:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe` (or `http://localhost:3000/api/webhooks/stripe` for local)
   - Events: Select `checkout.session.completed`
   - Copy the webhook signing secret (starts with `whsec_`)

## Environment Variables

Add these to your `.env.local` file:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here  
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
SUPABASE_SERVICE_KEY=your_service_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Credit Packages Available
- 10 Credits: $10 ($1.00 per credit)
- 25 Credits: $25 ($1.00 per credit) - Most Popular
- 50 Credits: $50 ($1.00 per credit)  
- 100 Credits: $100 ($1.00 per credit)

## Testing
Use Stripe test card numbers:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## Production
Replace test keys with live keys when ready for production.

## Payment Flow
1. User selects credit package on `/credits` page
2. System creates Stripe Checkout session via `/api/create-checkout`
3. User completes payment on Stripe Checkout
4. Stripe sends webhook to `/api/webhooks/stripe`
5. System adds credits to user account using `add_credits` RPC function
6. User is redirected back to `/credits` with success message

## Credit Usage
- Marketplace posts: 1 credit/day per listing
- Job posts: 1 credit/day per listing  
- Real estate posts: 1 credit/day per listing

## Troubleshooting
- If payment fails: Check Stripe API keys in environment variables
- If credits not added: Check webhook endpoint is registered and receiving events
- If webhook fails: Check Supabase service key and `add_credits` function exists
