# nmoo Deployment Projects

## 1. Frontend Project

Recommended platform: Vercel

Create a Vercel project with:

```txt
Project name: nmoo-frontend
Root directory: frontend
Framework preset: Next.js
Build command: npm run build
Install command: npm install
Production domain: nmoo.com
```

Set this environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

The frontend project also includes:

```txt
frontend/vercel.json
```

Detailed Vercel deployment steps:

```txt
FRONTEND_VERCEL_DEPLOYMENT.md
```

## 2. API Project

Recommended platform for the first production deploy: Render

Create the API service from the repository using the included Blueprint:

```txt
render.yaml
```

Detailed Render deployment steps:

```txt
BACKEND_RENDER_DEPLOYMENT.md
```

Expected API settings:

```txt
Service name: nmoo-api
Root directory: backend
Build command: npm install && npm run deploy:prepare
Start command: npm run start:prod
Health check path: /api
Production domain: api.nmoo.com
```

Set or confirm these environment variables:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-production-secret"
JWT_EXPIRES_IN="1d"
NODE_ENV="production"
FRONTEND_URL="https://nmoo.com"
CORS_ORIGINS="https://nmoo.com"
SWAGGER_ENABLED="false"
```

The copy-ready environment variable guide is here:

```txt
PRODUCTION_ENV.md
```

## 3. Database Project

Recommended first option: managed PostgreSQL from the same API host.

For Render Blueprint deploys, the included `render.yaml` defines:

```txt
Database name: nmoo-postgres
Database: nmoo_db
User: nmoo
```

If using another provider such as Supabase, Neon, or Railway, copy its PostgreSQL connection string into `DATABASE_URL` on the API host.

Detailed database setup and verification steps are in:

```txt
PRODUCTION_DATABASE.md
```

## 4. Project Order

1. Create the production PostgreSQL database.
2. Create the API service and connect `DATABASE_URL`.
3. Create the frontend project and set `NEXT_PUBLIC_API_URL`.
4. Add `api.nmoo.com` to the API host.
5. Add `nmoo.com` to Vercel.
6. Run the production checks in `DEPLOYMENT_CHECKLIST.md`.

Domain setup details are in:

```txt
DOMAIN_SETUP.md
```
