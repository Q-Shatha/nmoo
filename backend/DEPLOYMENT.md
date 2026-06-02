# nmoo API Deployment

## Production PostgreSQL

Use a managed PostgreSQL database such as Supabase, Neon, Railway PostgreSQL, Render PostgreSQL, or a VPS-managed Postgres instance.

For the first deployment, this repo includes a Render Blueprint at:

```txt
render.yaml
```

It creates an API service named `nmoo-api` and a PostgreSQL database named `nmoo-postgres`.

Render-specific deployment steps are documented in:

```txt
../BACKEND_RENDER_DEPLOYMENT.md
```

Detailed production database steps are documented in:

```txt
../PRODUCTION_DATABASE.md
```

Set these environment variables on the API host:

```env
DATABASE_URL="postgresql://user:password@host:5432/nmoo_db?schema=public"
JWT_SECRET="generate-a-random-production-secret-with-at-least-32-characters"
JWT_EXPIRES_IN="1d"
NODE_ENV="production"
FRONTEND_URL="https://nmoo.com"
CORS_ORIGINS="https://nmoo.com"
PORT=5000
SWAGGER_ENABLED="false"
RATE_LIMIT_TTL_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_CURRENCY="sar"
PUBLIC_ASSET_BASE_URL="https://cdn.nmoo.com"
```

## Domains

Use these production domains:

- Frontend: `https://nmoo.com`
- API: `https://api.nmoo.com`

Point `api.nmoo.com` to the API hosting platform using the DNS record required by the host, usually a `CNAME` for managed platforms or an `A` record for a VPS.

The API must allow the frontend origin through:

```env
FRONTEND_URL="https://nmoo.com"
CORS_ORIGINS="https://nmoo.com"
```

## Deploy Commands

Run migrations and generate Prisma Client before starting the API:

```bash
npm run deploy:prepare
npm run start:prod
```

If the platform separates build and release commands, use:

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
npm run build
```

Never use `prisma migrate dev` in production.
