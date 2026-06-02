# nmoo Security Notes

## Backend

`npm audit` currently reports:

```txt
found 0 vulnerabilities
```

The API also includes global rate limiting through `@nestjs/throttler`.

## Frontend

`npm audit` reports 2 moderate vulnerabilities from the transitive `postcss` version bundled through `next`.

The suggested command is:

```bash
npm audit fix --force
```

Do not run this automatically right now because npm reports that it would install `next@9.3.3`, which is a breaking downgrade from the current Next.js 16 setup.

Track this until a compatible Next/PostCSS update is available, then update normally and rerun:

```bash
npm install
npm audit
npm run lint
npm run build
npm run test:e2e
```
