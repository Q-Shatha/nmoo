# nmoo Deployment Checklist

## Local Readiness Check

Use this checklist after deploying the frontend, API, and PostgreSQL database.

Run the automated production check after deployment:

```bash
npm run check:production
```

For local verification:

```bash
$env:VENDOR_ID="{vendorId}"; npm run check:local
```

| Check | Local result |
| --- | --- |
| Frontend loads | Pass: `http://localhost:3000/` rendered content |
| Frontend Vercel project is configured | Use `FRONTEND_VERCEL_DEPLOYMENT.md` |
| Production domains are configured | Use `DOMAIN_SETUP.md` |
| API health works | Pass: `GET http://localhost:5000/api` returned `ok` |
| Database connection works | Pass: `GET /api/products?vendorId={vendorId}` returned data from PostgreSQL |
| Prisma migrations are applied | Pass: `npm run prisma:migrate:deploy` reported no pending migrations |
| Production environment variables are complete | Run `npm run env:check` on the API host |
| User registration works | Pass: covered by backend e2e tests |
| Login works | Pass: covered by backend e2e tests |
| Store fetches products from API | Pass: `GET /api/products?vendorId={vendorId}&page=1&limit=3` returned products |
| Search works | Pass: covered by backend and frontend e2e tests |
| Product page works | Pass: covered by frontend e2e tests |
| CORS is configured | Pass: `Origin: http://localhost:3000` returned `Access-Control-Allow-Origin: http://localhost:3000` |
| No secrets are exposed | Pass: environment examples use placeholders, real `.env` files stay local |
| Security notes reviewed | Use `SECURITY_NOTES.md` |
| Browser console has no errors | Pass: checked `/`, `/vendors/{vendorId}`, `/dashboard`, `/cart`, `/checkout` |

## Automated Production Check

The root script checks:

- API health: `/api`
- API products and pagination: `/api/products?vendorId={vendorId}&page=1&limit=3`
- CORS for the frontend origin
- Frontend pages: `/`, `/vendors/{vendorId}`, `/cart`, `/checkout`, `/dashboard`

Default production URLs:

```txt
Frontend: https://nmoo.com
API: https://api.nmoo.com
```

Override URLs when needed:

```bash
$env:FRONTEND_URL="https://your-frontend.com"; $env:API_URL="https://your-api.com"; $env:VENDOR_ID="{vendorId}"; npm run check:production
```

## Production Values

Frontend:

```txt
https://nmoo.com
```

API:

```txt
https://api.nmoo.com
```

Required API environment:

```env
DATABASE_URL="postgresql://user:password@host:5432/nmoo_db?schema=public"
JWT_SECRET="generate-a-random-production-secret-with-at-least-32-characters"
JWT_EXPIRES_IN="1d"
NODE_ENV="production"
FRONTEND_URL="https://nmoo.com"
CORS_ORIGINS="https://nmoo.com"
PORT=5000
SWAGGER_ENABLED="false"
```

Required frontend environment:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

## Final Commands

Frontend:

```bash
npm install
npm run lint
npm run build
npm run test:e2e
```

Backend:

```bash
npm install
npm run deploy:prepare
npm run test
npm run test:e2e
npm run start:prod
```

PostgreSQL:

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

Optional seed for local or staging demo data:

```bash
npm run db:seed
```
