# nmoo Domain Setup

## Domains

Use these production domains:

```txt
Frontend: https://nmoo.com
API: https://api.nmoo.com
```

## Add Domains To Hosting Platforms

### Vercel

Add the storefront domain to the Vercel project:

```txt
nmoo.com
www.nmoo.com
```

Vercel will show the exact DNS records required for your registrar. Common records are:

```txt
Type: A
Name: @
Value: 76.76.21.21
```

```txt
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Use the values Vercel shows if they differ.

### Render

Add the API domain to the Render web service:

```txt
api.nmoo.com
```

Render will show the exact DNS target for the service. Commonly this is a `CNAME` record:

```txt
Type: CNAME
Name: api
Value: <your-render-service-target>
```

Use the value Render shows for your service.

## Required Environment Values

Frontend on Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.nmoo.com
```

API on Render:

```env
FRONTEND_URL=https://nmoo.com
CORS_ORIGINS=https://nmoo.com
SWAGGER_ENABLED=false
```

After changing environment variables, redeploy the affected service.

## DNS Verification

From a terminal:

```powershell
nslookup nmoo.com
nslookup www.nmoo.com
nslookup api.nmoo.com
```

Expected:

- `nmoo.com` resolves to Vercel.
- `www.nmoo.com` resolves to Vercel.
- `api.nmoo.com` resolves to Render.

DNS can take time to propagate. If the result still points to an old value, wait and check again.

## HTTPS Verification

Open:

```txt
https://nmoo.com
https://api.nmoo.com/api
```

Expected API response:

```json
{
  "name": "nmoo نمو API",
  "status": "ok",
  "version": "0.0.1"
}
```

## CORS Verification

After both domains are active, the storefront should load products from the API.

You can also run the automated check from the repository root:

```bash
npm run check:production
```

If products do not load:

1. Confirm `NEXT_PUBLIC_API_URL=https://api.nmoo.com` in Vercel.
2. Confirm `CORS_ORIGINS=https://nmoo.com` in Render.
3. Redeploy both services after environment changes.
4. Check `https://api.nmoo.com/api` directly.
