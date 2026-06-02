# nmoo Frontend Deployment

## Production Domain

Use this production domain for the storefront:

```txt
https://nmoo.com
```

Point `nmoo.com` to Vercel using the DNS records Vercel gives you after adding the domain to the project.

Recommended project settings:

```txt
Project name: nmoo-frontend
Root directory: frontend
Framework preset: Next.js
```

The project includes `vercel.json` with the standard build, dev, and install commands.

Detailed Vercel deployment steps are documented in:

```txt
../FRONTEND_VERCEL_DEPLOYMENT.md
```

## Environment Variables

Set this variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

## Deploy Commands

Use these commands for production checks:

```bash
npm install
npm run lint
npm run build
```

The API should be available at:

```txt
https://api.nmoo.com
```
