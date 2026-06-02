# nmoo Production Environment Variables

## Frontend: Vercel

Set this in the Vercel project `nmoo-frontend`:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

Where to add it:

```txt
Vercel Project -> Settings -> Environment Variables -> Production
```

## API: Render

If you deploy with the included `render.yaml`, these values are already described in the Blueprint. Confirm them in Render:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="generated-by-render-or-your-secret"
JWT_EXPIRES_IN="1d"
NODE_ENV="production"
FRONTEND_URL="https://nmoo.com"
CORS_ORIGINS="https://nmoo.com"
SWAGGER_ENABLED="false"
RATE_LIMIT_TTL_SECONDS="60"
RATE_LIMIT_MAX_REQUESTS="120"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="sar"
PUBLIC_ASSET_BASE_URL="https://cdn.nmoo.com"
```

Where to add them:

```txt
Render Service -> Environment
```

`DATABASE_URL` can come from:

- Render PostgreSQL Blueprint connection.
- Supabase connection string.
- Neon connection string.
- Railway PostgreSQL connection string.

## API Environment Check

After setting the API environment variables, run this on the API host:

```bash
npm run env:check
```

Expected output:

```txt
Production API environment looks ready.
```

Then verify the database connection:

```bash
npm run db:check
```

## Important Rules

- Do not commit real `.env` files.
- Do not use local `DATABASE_URL` in production.
- Do not use placeholder `JWT_SECRET`.
- Keep `SWAGGER_ENABLED="false"` unless you intentionally want public API docs.
- `CORS_ORIGINS` must include the frontend origin exactly: `https://nmoo.com`.
- Keep `STRIPE_SECRET_KEY` empty in local development if you do not want real payments.
- Use `PUBLIC_ASSET_BASE_URL` for public image/CDN URLs when product images move to external storage.
