# nmoo Production Database

## Goal

Create a managed PostgreSQL database for production and copy its connection string into the API host as `DATABASE_URL`.

Recommended first path: Render PostgreSQL through the included `render.yaml`.

## Option A: Render Blueprint

The repository includes:

```txt
render.yaml
```

It defines:

```txt
Database service: nmoo-postgres
Database name: nmoo_db
Database user: nmoo
API service: nmoo-api
```

When the Blueprint is created on Render, Render injects the database connection string into the API service automatically:

```yaml
DATABASE_URL -> nmoo-postgres connectionString
```

No manual copy is needed for this option unless you decide to use a separate database provider.

## Option B: External PostgreSQL Provider

Use Supabase, Neon, Railway PostgreSQL, Render PostgreSQL, or another managed PostgreSQL provider.

Create a database named:

```txt
nmoo_db
```

Copy the provider connection string and set it on the API host:

```env
DATABASE_URL="postgresql://user:password@host:5432/nmoo_db?schema=public"
```

Keep `?schema=public` at the end unless the provider gives a different required schema.

## Verify The Connection

From the API host or from a local shell where `DATABASE_URL` points to production:

```bash
npm run db:check
```

Expected output:

```txt
Database: nmoo_db
Schema: public
Version: PostgreSQL ...
```

## Apply Migrations

After confirming `DATABASE_URL`, run:

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

Or run the full production prepare command:

```bash
npm run deploy:prepare
```

Do not run `prisma migrate dev` against production.

## Required Follow-Up

After the API deploy succeeds, run the production checklist:

```txt
DEPLOYMENT_CHECKLIST.md
```
