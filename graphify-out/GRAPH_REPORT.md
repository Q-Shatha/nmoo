# Graph Report - .  (2026-06-21)

## Corpus Check
- 249 files · ~99,121 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1355 nodes · 2884 edges · 84 communities (69 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Cart & Checkout UI|Cart & Checkout UI]]
- [[_COMMUNITY_Authentication Backend|Authentication Backend]]
- [[_COMMUNITY_Discount Management|Discount Management]]
- [[_COMMUNITY_Product Dashboard UI|Product Dashboard UI]]
- [[_COMMUNITY_Shipping & Checkout DTOs|Shipping & Checkout DTOs]]
- [[_COMMUNITY_Address & Shipping Forms|Address & Shipping Forms]]
- [[_COMMUNITY_Order Management UI|Order Management UI]]
- [[_COMMUNITY_Discounts API|Discounts API]]
- [[_COMMUNITY_Vendor Dashboard Data|Vendor Dashboard Data]]
- [[_COMMUNITY_Vendor Storefront Pages|Vendor Storefront Pages]]
- [[_COMMUNITY_Dashboard Shell Layout|Dashboard Shell Layout]]
- [[_COMMUNITY_Store Pages API|Store Pages API]]
- [[_COMMUNITY_Store Page Management|Store Page Management]]
- [[_COMMUNITY_Deployment & Infrastructure|Deployment & Infrastructure]]
- [[_COMMUNITY_Products Service|Products Service]]
- [[_COMMUNITY_Categories API|Categories API]]
- [[_COMMUNITY_Product Listing UI|Product Listing UI]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Store-Scoped Architecture Plan|Store-Scoped Architecture Plan]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_Theme Customization|Theme Customization]]
- [[_COMMUNITY_Backend TypeScript Config|Backend TypeScript Config]]
- [[_COMMUNITY_Reviews API|Reviews API]]
- [[_COMMUNITY_Themes Service|Themes Service]]
- [[_COMMUNITY_Product Detail Pages|Product Detail Pages]]
- [[_COMMUNITY_Auth Decorators & Guards|Auth Decorators & Guards]]
- [[_COMMUNITY_Product Assets|Product Assets]]
- [[_COMMUNITY_Frontend TypeScript Config|Frontend TypeScript Config]]
- [[_COMMUNITY_Subscriptions API|Subscriptions API]]
- [[_COMMUNITY_Database Module|Database Module]]
- [[_COMMUNITY_Module 30|Module 30]]
- [[_COMMUNITY_Module 31|Module 31]]
- [[_COMMUNITY_Module 32|Module 32]]
- [[_COMMUNITY_Module 33|Module 33]]
- [[_COMMUNITY_Module 34|Module 34]]
- [[_COMMUNITY_Module 35|Module 35]]
- [[_COMMUNITY_Module 36|Module 36]]
- [[_COMMUNITY_Module 37|Module 37]]
- [[_COMMUNITY_Module 38|Module 38]]
- [[_COMMUNITY_Module 39|Module 39]]
- [[_COMMUNITY_Module 40|Module 40]]
- [[_COMMUNITY_Module 41|Module 41]]
- [[_COMMUNITY_Module 42|Module 42]]
- [[_COMMUNITY_Module 43|Module 43]]
- [[_COMMUNITY_Module 44|Module 44]]
- [[_COMMUNITY_Module 45|Module 45]]
- [[_COMMUNITY_Module 46|Module 46]]
- [[_COMMUNITY_Module 47|Module 47]]
- [[_COMMUNITY_Module 48|Module 48]]
- [[_COMMUNITY_Module 49|Module 49]]
- [[_COMMUNITY_Module 50|Module 50]]
- [[_COMMUNITY_Module 51|Module 51]]
- [[_COMMUNITY_Module 52|Module 52]]
- [[_COMMUNITY_Module 53|Module 53]]
- [[_COMMUNITY_Module 54|Module 54]]
- [[_COMMUNITY_Module 55|Module 55]]
- [[_COMMUNITY_Module 56|Module 56]]
- [[_COMMUNITY_Module 57|Module 57]]
- [[_COMMUNITY_Module 58|Module 58]]
- [[_COMMUNITY_Module 59|Module 59]]
- [[_COMMUNITY_Module 60|Module 60]]
- [[_COMMUNITY_Module 61|Module 61]]
- [[_COMMUNITY_Module 62|Module 62]]
- [[_COMMUNITY_Module 63|Module 63]]
- [[_COMMUNITY_Module 64|Module 64]]
- [[_COMMUNITY_Module 65|Module 65]]
- [[_COMMUNITY_Module 66|Module 66]]
- [[_COMMUNITY_Module 67|Module 67]]
- [[_COMMUNITY_Module 68|Module 68]]
- [[_COMMUNITY_Module 69|Module 69]]
- [[_COMMUNITY_Module 70|Module 70]]
- [[_COMMUNITY_Module 71|Module 71]]
- [[_COMMUNITY_Module 72|Module 72]]
- [[_COMMUNITY_Module 73|Module 73]]
- [[_COMMUNITY_Module 80|Module 80]]
- [[_COMMUNITY_Module 81|Module 81]]
- [[_COMMUNITY_Module 83|Module 83]]

## God Nodes (most connected - your core abstractions)
1. `AuthenticatedUser` - 108 edges
2. `apiRequest()` - 57 edges
3. `ApiError` - 45 edges
4. `ProductsService` - 33 edges
5. `PrismaService` - 28 edges
6. `ShippingMethodsService` - 28 edges
7. `loadVendorDashboardBase()` - 27 edges
8. `DiscountsService` - 26 edges
9. `ProductAssetsService` - 25 edges
10. `getVendorStoreHref()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `nmoo Frontend Deployment` --semantically_similar_to--> `nmoo Frontend Vercel Deployment`  [INFERRED] [semantically similar]
  frontend/DEPLOYMENT.md → FRONTEND_VERCEL_DEPLOYMENT.md
- `nmoo API Deployment (backend)` --semantically_similar_to--> `nmoo Production Environment Variables`  [INFERRED] [semantically similar]
  backend/DEPLOYMENT.md → PRODUCTION_ENV.md
- `Next.js Wordmark SVG (Next.js logo/brand)` --conceptually_related_to--> `Next.js Frontend (React 19, TypeScript, Tailwind CSS v4, RTL Arabic)`  [INFERRED]
  frontend/public/next.svg → plan.md
- `Render PostgreSQL Database (nmoo-postgres)` --semantically_similar_to--> `PostgreSQL with Prisma ORM`  [INFERRED] [semantically similar]
  render.yaml → plan.md
- `Vercel Logo SVG (triangle logomark, white on transparent)` --conceptually_related_to--> `Deployment: Vercel (frontend) + Render/Railway (backend)`  [INFERRED]
  frontend/public/vercel.svg → plan.md

## Import Cycles
- 1-file cycle: `frontend/app/[storeUsername]/products/[productId]/page.tsx -> frontend/app/[storeUsername]/products/[productId]/page.tsx`
- 1-file cycle: `frontend/app/[storeUsername]/reviews/new/page.tsx -> frontend/app/[storeUsername]/reviews/new/page.tsx`
- 1-file cycle: `frontend/app/[storeUsername]/storefront/page.tsx -> frontend/app/[storeUsername]/storefront/page.tsx`

## Hyperedges (group relationships)
- **Full-Stack Deployment Pipeline (Frontend + API + Database)** — nmoo_frontend_project, nmoo_api_service, nmoo_postgres_db, render_yaml, vercel_json [EXTRACTED 1.00]
- **API Security Mechanisms (JWT + CORS + Rate Limiting)** — jwt_auth, cors_config, rate_limiting, nmoo_api_service [INFERRED 0.85]
- **Deployment Documentation Cluster** — matjer_deployment_checklist, matjer_deployment_projects, matjer_backend_render_deployment, matjer_frontend_vercel_deployment, matjer_domain_setup [INFERRED 0.85]
- **nmoo Platform Core Tech Stack** — plan_nextjs_frontend, plan_nestjs_backend, plan_postgresql_prisma [EXTRACTED 1.00]
- **nmoo Production Deployment (Vercel + Render API + Render Postgres)** — plan_deployment_vercel_render, render_yaml_service, render_yaml_postgres [INFERRED 0.85]
- **Vendor-Scoped Store Access Pattern** — implementation_plan_store_scoped_routing, implementation_plan_backend_rules, plan_products_api [INFERRED 0.85]

## Communities (84 total, 15 thin omitted)

### Community 0 - "Cart & Checkout UI"
Cohesion: 0.05
Nodes (54): CartLine(), CartSummary(), CartView(), formatPrice(), getCartItemHref(), useCartItems(), AddressConfirmation(), CheckoutLine() (+46 more)

### Community 1 - "Authentication Backend"
Cohesion: 0.05
Nodes (20): AuthController, AuthService, LoginDto, RegisterDto, UpdateAddressDto, UpdateProfileDto, UpdateStoreStatusDto, UpdateStoreUsernameDto (+12 more)

### Community 2 - "Discount Management"
Cohesion: 0.05
Nodes (46): emptyForm, formatStoreStatus(), StoreLifecycleManager(), StoreLifecycleManagerProps, apiRequest(), AuthResponse, buildUrl(), CheckoutSession (+38 more)

### Community 3 - "Product Dashboard UI"
Cohesion: 0.07
Nodes (34): DashboardAccordion(), DashboardAccordionProps, calculateDraftOptionsStock(), calculateOptionsStock(), calculateProductStock(), DashboardProductManager(), DeletedProductRow(), formatPrice() (+26 more)

### Community 4 - "Shipping & Checkout DTOs"
Cohesion: 0.09
Nodes (10): CheckoutShippingOptionsDto, CreateShippingMethodDto, ShippingUnavailableLocationDto, ShippingMethodItemDto, UpdateShippingMethodDto, ShippingMethodsController, ShippingDestination, ShippingMethodsService (+2 more)

### Community 5 - "Address & Shipping Forms"
Cohesion: 0.06
Nodes (20): Draft, emptyLocation, LocationDraft, emptyDraft, emptyLocationDraft, LocationDraft, ShippingDraft, ShippingMethodManager() (+12 more)

### Community 6 - "Order Management UI"
Cohesion: 0.07
Nodes (28): formatOrderStatus(), formatPrice(), loadOrder(), formatOrderStatus(), formatPrice(), loadOrder(), createCheckoutSession(), getOrder() (+20 more)

### Community 7 - "Discounts API"
Cohesion: 0.10
Nodes (8): DiscountsController, AppliedDiscount, CheckoutProduct, DiscountsService, CreateDiscountCodeDto, DiscountItemDto, UpdateDiscountCodeDto, ValidateDiscountCodeDto

### Community 8 - "Vendor Dashboard Data"
Cohesion: 0.14
Nodes (28): getVendorStoreHref(), loadVendorDashboardBase(), VendorDashboardBase, DiscountCodeManager(), Dashboard(), loadDashboardData(), ShippingMethodForm(), DashboardDiscountsPage() (+20 more)

### Community 9 - "Vendor Storefront Pages"
Cohesion: 0.10
Nodes (27): createReview(), getMe(), getReviewableProducts(), getVendor(), getVendorShippingCoverage(), getVendorStorePages(), getVendorTheme(), ReviewableProduct (+19 more)

### Community 10 - "Dashboard Shell Layout"
Cohesion: 0.11
Nodes (20): DashboardShell(), DashboardShellProps, DashboardTheme, DashboardUnavailable(), EmptyPanel(), formatDashboardDate(), formatDashboardPrice(), formatOrderStatus() (+12 more)

### Community 11 - "Store Pages API"
Cohesion: 0.13
Nodes (5): CreateStorePageDto, UpdateStorePageDto, StorePagesController, StorePagesModule, StorePagesService

### Community 12 - "Store Page Management"
Cohesion: 0.10
Nodes (17): StorePageForm(), emptyDraft, StorePageDraft, StorePageManager(), StoreUsernameManager(), checkStoreUsernameAvailability(), createStorePage(), deleteStorePage() (+9 more)

### Community 13 - "Deployment & Infrastructure"
Cohesion: 0.18
Nodes (26): nmoo API Deployment (backend), CORS Configuration (CORS_ORIGINS), External Product Images / CDN Storage, nmoo Frontend Deployment, nmoo Frontend README (Next.js), JWT Authentication (JWT_SECRET / JWT_EXPIRES_IN), nmoo API Render Deployment, nmoo Deployment Checklist (+18 more)

### Community 15 - "Categories API"
Cohesion: 0.17
Nodes (5): CategoriesController, CategoriesModule, CategoriesService, CreateCategoryDto, UpdateCategoryDto

### Community 16 - "Product Listing UI"
Cohesion: 0.11
Nodes (14): formatPrice(), ProductCard(), ProductCardProps, getVendorReviews(), Product, themeToStyle(), averageRating(), fallbackReviews (+6 more)

### Community 17 - "Frontend Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, next, react, react-dom, react-icons, devDependencies, eslint, eslint-config-next (+16 more)

### Community 18 - "Store-Scoped Architecture Plan"
Cohesion: 0.11
Nodes (25): Backend API Rules (vendorId required, ownership checks), nmoo Store-Focused Implementation Plan, Store-Scoped Routing (storeUsername / vendorId), Store Username Availability API (/api/users/store-username/availability), Vendor Theme Tokens, Auth API (register, login, /auth/me), Cart via localStorage (initial implementation), Deployment: Vercel (frontend) + Render/Railway (backend) (+17 more)

### Community 19 - "Backend Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcrypt, class-transformer, class-validator, compression, helmet (+16 more)

### Community 20 - "Theme Customization"
Cohesion: 0.13
Nodes (17): colorMix(), contrastRatio(), hexToRgb(), ImageField, imageFields, readablePreviewText(), relativeLuminance(), rgbToHex() (+9 more)

### Community 21 - "Backend TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 22 - "Reviews API"
Cohesion: 0.15
Nodes (5): CreateReviewDto, ReviewsController, ReviewsModule, normalizeAssetUrl(), ReviewsService

### Community 23 - "Themes Service"
Cohesion: 0.17
Nodes (13): UpdateThemeDto, contrastRatio(), defaultTheme, hexToRgb(), mixWithWhite(), normalizeOptionalText(), normalizeOptionalUrl(), normalizeStoreStatus() (+5 more)

### Community 24 - "Product Detail Pages"
Cohesion: 0.14
Nodes (18): LegacyProductPage(), LegacyProductPageProps, buildUrlPath(), getProductById(), getProductReviews(), getProducts(), formatPrice(), formatStatus() (+10 more)

### Community 25 - "Auth Decorators & Guards"
Cohesion: 0.40
Nodes (5): CurrentUser, Roles(), JwtAuthGuard, RolesGuard, AuthenticatedRequest

### Community 26 - "Product Assets"
Cohesion: 0.17
Nodes (4): ProductAssetsController, ProductAssetsService, UploadedAssetStream, UploadedProductAsset

### Community 27 - "Frontend TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 28 - "Subscriptions API"
Cohesion: 0.18
Nodes (5): ActivateSubscriptionDto, UpdateSubscriptionDto, SubscriptionsController, SubscriptionsModule, SubscriptionsService

### Community 29 - "Database Module"
Cohesion: 0.13
Nodes (5): PrismaModule, PrismaService, AppModule, bootstrap(), getCorsOrigins()

### Community 30 - "Module 30"
Cohesion: 0.13
Nodes (7): AccountAvatar(), AccountAvatarProps, EditableName(), EditableNameProps, ApiError, ApiUser, updateMyProfile()

### Community 31 - "Module 31"
Cohesion: 0.12
Nodes (17): devDependencies, jest, @nestjs/testing, prisma, source-map-support, supertest, ts-jest, ts-node (+9 more)

### Community 32 - "Module 32"
Cohesion: 0.21
Nodes (4): CreateOrderDto, CreateOrderItemDto, UpdateOrderStatusDto, OrdersService

### Community 33 - "Module 33"
Cohesion: 0.25
Nodes (14): ThemeStyle(), VendorTheme, applyThemeTokens(), contrastRatio(), createThemeTokens(), getThemeVariables(), hexToRgb(), mixWithWhite() (+6 more)

### Community 34 - "Module 34"
Cohesion: 0.22
Nodes (6): CreateCheckoutSessionDto, PaymentsController, RawBodyRequest, PaymentsModule, PaymentsService, SHIPPING_LABELS

### Community 35 - "Module 35"
Cohesion: 0.19
Nodes (3): OrdersController, ProductsController, AuthenticatedUser

### Community 36 - "Module 36"
Cohesion: 0.30
Nodes (7): AuthModule, DiscountsModule, OrdersModule, ProductsModule, ShippingMethodsModule, ThemesModule, UsersModule

### Community 37 - "Module 37"
Cohesion: 0.19
Nodes (8): features, CartPageProps, FooterLink, getSocialLinks(), PublicFooter(), PublicFooterProps, SocialLink, toLink()

### Community 38 - "Module 38"
Cohesion: 0.14
Nodes (13): dependencies, bcrypt, cors, dotenv, express, jsonwebtoken, sqlite3, description (+5 more)

### Community 39 - "Module 39"
Cohesion: 0.14
Nodes (14): scripts, build, db:check, db:seed, deploy:prepare, env:check, prisma:generate, prisma:migrate:deploy (+6 more)

### Community 40 - "Module 40"
Cohesion: 0.19
Nodes (7): CheckoutPageProps, loadHeaderUser(), PublicHeader(), PublicHeaderProps, StoreNavLink(), StoreNavLinkProps, RegisterForm()

### Community 41 - "Module 41"
Cohesion: 0.23
Nodes (10): getVendorByUsername(), StoreUsernameReviewPage(), StoreUsernameReviewPageProps, StoreUsernameProductPage(), StoreUsernameProductPageProps, StoreUsernameStorefrontPage(), StoreUsernameStorefrontPageProps, StoreUsernamePage() (+2 more)

### Community 42 - "Module 42"
Cohesion: 0.24
Nodes (5): CreateProductDto, ProductAddonDto, ProductOptionDto, ProductQueryDto, UpdateProductDto

### Community 43 - "Module 43"
Cohesion: 0.17
Nodes (9): db, sqlite3, app, bcrypt, cors, db, dotenv, express (+1 more)

### Community 44 - "Module 44"
Cohesion: 0.18
Nodes (4): AccountMenu(), AccountMenuProps, DesktopAccountMenu(), formatRole()

### Community 45 - "Module 45"
Cohesion: 0.33
Nodes (9): apiUrl, assert(), checkApiHealth(), checkApiProducts(), checkCors(), checkFrontendPages(), frontendPaths, frontendUrl (+1 more)

### Community 46 - "Module 46"
Cohesion: 0.29
Nodes (7): AccountData, AccountDetails(), AccountPage(), formatCountry(), formatRole(), loadAccount(), getCountryLabel()

### Community 48 - "Module 48"
Cohesion: 0.22
Nodes (3): loadOrders(), OrdersData, OrdersPage()

### Community 49 - "Module 49"
Cohesion: 0.36
Nodes (9): AuthResponse, demoAccounts, getExpectedRole(), getRequestOrigin(), getRoleMismatchMessage(), getSafeNextPath(), POST(), redirectToLogin() (+1 more)

### Community 50 - "Module 50"
Cohesion: 0.25
Nodes (5): Review, getInitials(), ReviewCard(), ReviewsCarousel(), ReviewsCarouselProps

### Community 51 - "Module 51"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

### Community 52 - "Module 52"
Cohesion: 0.29
Nodes (5): LoginForm(), LoginFormProps, LoginMode, loginModes, LoginPageProps

### Community 53 - "Module 53"
Cohesion: 0.25
Nodes (6): configuredS3Keys, invalidCorsOrigins, missing, placeholders, required, s3Keys

### Community 54 - "Module 54"
Cohesion: 0.38
Nodes (6): ibmPlexSansArabic, loadTheme(), metadata, RootLayout(), viewport, getActiveTheme()

### Community 55 - "Module 55"
Cohesion: 0.43
Nodes (5): Env, isValidOrigin(), isValidUrl(), PLACEHOLDER_JWT_SECRETS, validateEnvironment()

### Community 56 - "Module 56"
Cohesion: 0.29
Nodes (6): name, private, scripts, check:local, check:production, version

### Community 57 - "Module 57"
Cohesion: 0.29
Nodes (5): bcrypt, categories, { DiscountType, PrismaClient, ProductStatus, UserRole }, prisma, products

### Community 59 - "Module 59"
Cohesion: 0.40
Nodes (4): AddressForm(), AddressData, AddressPage(), loadAccount()

### Community 60 - "Module 60"
Cohesion: 0.53
Nodes (5): formatDate(), loadPage(), StorePageProps, StorePageView(), getStorePage()

### Community 61 - "Module 61"
Cohesion: 0.40
Nodes (4): buildCommand, devCommand, framework, installCommand

### Community 63 - "Module 63"
Cohesion: 0.50
Nodes (3): collection, $schema, sourceRoot

### Community 64 - "Module 64"
Cohesion: 0.50
Nodes (3): exclude, extends, include

### Community 67 - "Module 67"
Cohesion: 0.67
Nodes (3): Frontend Next.js Agent Rules, Frontend CLAUDE.md (references AGENTS.md), Next.js Breaking-Change Warning for Agents

## Knowledge Gaps
- **316 isolated node(s):** `sqlite3`, `db`, `name`, `version`, `description` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthenticatedUser` connect `Module 35` to `Module 32`, `Authentication Backend`, `Module 34`, `Shipping & Checkout DTOs`, `Discounts API`, `Module 42`, `Store Pages API`, `Products Service`, `Categories API`, `Reviews API`, `Themes Service`, `Auth Decorators & Guards`, `Subscriptions API`, `Module 62`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `UsersService` connect `Authentication Backend` to `Auth Decorators & Guards`, `Module 36`, `Database Module`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `ApiError` connect `Module 30` to `Cart & Checkout UI`, `Discount Management`, `Product Dashboard UI`, `Address & Shipping Forms`, `Order Management UI`, `Module 40`, `Vendor Dashboard Data`, `Dashboard Shell Layout`, `Vendor Storefront Pages`, `Module 44`, `Store Page Management`, `Module 46`, `Module 48`, `Product Listing UI`, `Theme Customization`, `Product Detail Pages`, `Module 59`, `Module 60`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `sqlite3`, `db`, `name` to the rest of the system?**
  _318 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cart & Checkout UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0532724505327245 - nodes in this community are weakly interconnected._
- **Should `Authentication Backend` be split into smaller, more focused modules?**
  _Cohesion score 0.05406746031746032 - nodes in this community are weakly interconnected._
- **Should `Discount Management` be split into smaller, more focused modules?**
  _Cohesion score 0.05200501253132832 - nodes in this community are weakly interconnected._