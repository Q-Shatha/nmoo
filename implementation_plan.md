# nmoo Store-Focused Implementation Plan

## Direction

nmoo is store-focused, not marketplace-focused. There is no public global product page that mixes products from different stores. Customers browse one store at a time, and all search, filter, product links, cart links, checkout context, store pages, and theme colors stay scoped to that store.

## Public Routes

- `/` is the platform home.
- `/:storeUsername` is the public store profile page once the owner selects a unique username.
- `/:storeUsername/storefront` is the customer-facing shopping storefront for one vendor.
- `/:storeUsername/products/:productId` is the product detail page inside that vendor store.
- `/vendors/:vendorId` routes remain as legacy/fallback routes when a store username is not set.
- `/store` is legacy only and redirects away from the removed global product listing.
- `/store/product/:id` is legacy only and redirects to the vendor-scoped product URL when possible.
- `/store-pages/:id` displays a vendor page such as return policy or about page, then links back to `/vendors/:vendorId`.

## Frontend Rules

- Product lists must call `getProducts({ vendorId, ...filters })`.
- Store profile actions that say "show all products" link to `/vendors/:vendorId/storefront`.
- Product cards link to `/vendors/:vendorId/products/:productId`.
- Prefer username links when `storeUsername` exists.
- Store owners manage their username from the dashboard; the frontend checks availability before saving.
- Cart items store `vendorId` so product links remain vendor-scoped.
- The public header receives `storeHref` only when the current page has a vendor context.
- Do not add links to `/store` for public shopping.
- Vendor theme tokens apply to the storefront and product cards for that vendor.

## Backend Rules

- `GET /api/products` requires `vendorId`.
- Public product filters apply only inside the requested vendor store.
- Product create/update/delete require authenticated `VENDOR` or `ADMIN`.
- Vendors can manage only their own products.
- Admins can manage all products.
- Product service ownership checks stay in place even when controller role guards pass.
- Store usernames are unique, normalized to lowercase, checked for reserved route names, and exposed through `/api/users/store-username/availability`.

## Verification

- Backend e2e tests must cover:
  - product listing without `vendorId` returns `400`;
  - product listing with `vendorId` returns only that store's products;
  - another vendor cannot update a product owned by a different store.
- Frontend tests must open:
  - `/vendors/:vendorId/storefront?q=...`;
  - `/vendors/:vendorId/products/:productId`;
  - `/dashboard` for vendor-owned product management.
