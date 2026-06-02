# nmoo Seed Data

Run the seed from the backend folder:

```bash
npm run db:seed
```

The seed is safe to run more than once. It uses fixed emails and product slugs with `upsert`.

## Accounts

Vendor:

```txt
Email: vendor@nmoo.test
Password: Nmoo12345
Role: VENDOR
```

Buyer:

```txt
Email: buyer@nmoo.test
Password: Nmoo12345
Role: BUYER
```

## Data

The seed creates:

- 4 categories.
- 6 active products.
- Product images through public HTTPS URLs.
- Active vendor subscription for the seeded vendor.

## Store-focused routes

Use the seeded vendor as the storefront owner. Products are not exposed through a global product page.

```txt
Vendor profile: /vendors/{vendorId}
Vendor storefront: /vendors/{vendorId}/storefront
Vendor product: /vendors/{vendorId}/products/{productId}
Product API list: /api/products?vendorId={vendorId}
```

After a vendor chooses a unique store username, public links become:

```txt
Vendor profile: /{storeUsername}
Vendor storefront: /{storeUsername}/storefront
Vendor product: /{storeUsername}/products/{productId}
```

The seeded buyer account can browse a specific vendor store, add products to cart, and checkout. The seeded vendor account can manage only products that belong to that vendor.

Use this only for local development or staging. Do not run it against production unless you intentionally want demo data.
