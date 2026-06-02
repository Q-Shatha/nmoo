# nmoo Frontend Vercel Deployment

## Vercel Project

Create a Vercel project from the repository.

Use these settings:

```txt
Project name: nmoo-frontend
Root directory: frontend
Framework preset: Next.js
Install command: npm install
Build command: npm run build
Development command: npm run dev
Production domain: nmoo.com
```

The frontend includes:

```txt
frontend/vercel.json
```

## Environment Variable

Set this in Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

Add it under:

```txt
Project Settings -> Environment Variables -> Production
```

After changing this value, redeploy the frontend.

## Deploy Flow

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Confirm the build settings from `frontend/vercel.json`.
4. Add `NEXT_PUBLIC_API_URL`.
5. Deploy.
6. Add the domain `nmoo.com`.
7. Create the DNS record Vercel asks for.

Detailed DNS steps are in:

```txt
DOMAIN_SETUP.md
```

## Local Preflight

Run these from `frontend` before deploying:

```bash
npm install
npm run lint
npm run build
npm run test:e2e
```

Run the workspace production check with a real vendor id:

```bash
$env:VENDOR_ID="{vendorId}"; npm run check:production
```

## Production Checks

After deployment, open:

```txt
https://nmoo.com
https://nmoo.com/vendors/{vendorId}
https://nmoo.com/cart
https://nmoo.com/checkout
https://nmoo.com/dashboard
```

The vendor storefront should fetch products from:

```txt
https://api.nmoo.com/api/products?vendorId={vendorId}
```

If the store does not load products, check:

- `NEXT_PUBLIC_API_URL` is exactly `https://api.nmoo.com`.
- The API is deployed and `https://api.nmoo.com/api` returns `ok`.
- Product lists include `vendorId`; the API intentionally rejects global product lists.
- The API `CORS_ORIGINS` includes `https://nmoo.com`.
