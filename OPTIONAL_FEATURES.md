# nmoo Optional Production Features

## Rate Limiting

The API uses NestJS throttling globally.

Environment:

```env
RATE_LIMIT_TTL_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
```

## Stripe Payments

Stripe Checkout is prepared through:

```txt
POST /api/payments/checkout-session
```

Request:

```json
{
  "orderId": "uuid"
}
```

Environment:

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="sar"
FRONTEND_URL="https://nmoo.com"
```

If `STRIPE_SECRET_KEY` is empty, the endpoint returns `503` so local development stays safe.

Stripe webhook:

```txt
POST /api/payments/stripe/webhook
```

Configure this URL in Stripe:

```txt
https://api.nmoo.com/api/payments/stripe/webhook
```

The webhook marks orders as `PAID` when `checkout.session.completed` is received.

## External Product Images

The product model stores image keys/URLs, and the backend serves uploaded private S3 assets through signed access. Frontend pages should render product images through backend asset URLs instead of assuming S3 objects are public.

Recommended providers:

- Supabase Storage
- S3-compatible storage
- Cloudflare R2
- UploadThing

Environment:

```env
PUBLIC_ASSET_BASE_URL="https://cdn.nmoo.com"
```

For vendor store pages, product cards and product details should always receive products from one vendor scope:

```txt
GET /api/products?vendorId={vendorId}
```

Do not build optional features around a global product marketplace unless the product direction changes.
