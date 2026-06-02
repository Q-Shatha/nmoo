# خطة مشروع nmoo نمو

## 1. الهدف

بناء منصة تجارة إلكترونية عربية باسم **nmoo نمو** تتكون من:

- واجهة أمامية باستخدام Next.js.
- باك إند حديث باستخدام NestJS.
- قاعدة بيانات PostgreSQL.
- Prisma لإدارة قاعدة البيانات والـ migrations.
- لوحة تحكم للتجار.
- متجر للعملاء مع بحث وتصفية وصفحات منتجات.
- نظام مستخدمين وصلاحيات وطلبات وسلة.
- تجهيز كامل للنشر.

---

## 2. التقنيات المعتمدة

### الواجهة الأمامية

المجلد:

```txt
frontend
```

التقنيات:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- App Router
- RTL Arabic UI

### الباك إند الجديد

المجلد المقترح:

```txt
backend
```

التقنيات:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Passport.js داخل NestJS
- bcrypt لتشفير كلمات المرور
- class-validator و class-transformer للتحقق من DTOs
- Swagger لتوثيق API

### قاعدة البيانات

- PostgreSQL للتطوير والإنتاج.
- Prisma migrations لإدارة الجداول.
- لا يتم الاعتماد على SQLite في الخطة الجديدة.

---

## 3. الوضع الحالي

### الموجود حاليًا في الواجهة

- الصفحة الرئيسية `/`
- صفحة كل تاجر `/vendors/[vendorId]`
- صفحة المنتج داخل متجر التاجر `/vendors/[vendorId]/products/[productId]`
- لوحة التحكم `/dashboard`
- شريط علوي مشترك للصفحات العامة.
- فوتر مشترك.
- بحث في صفحة المتجر عبر query parameter.
- تصميم RTL عربي.

### الموجود حاليًا في الباك إند

يوجد باك إند قديم مبني على Express و SQLite.

الخطة الجديدة:

- استبدال بنية Express الحالية ببنية NestJS.
- استبدال SQLite بـ PostgreSQL.
- نقل منطق المصادقة والمنتجات والاشتراكات إلى modules منظمة.

---

## 4. المرحلة الأولى: تجهيز المشروع

### 4.1 تنظيف النصوص والهوية

المطلوب:

- تثبيت اسم المنتج في كل مكان: `nmoo نمو`.
- تنظيف أي نص عربي مكسور الترميز.
- توحيد النصوص العربية في الواجهة والباك إند.
- تحديث metadata في Next.js.

### 4.2 تثبيت نظام التصميم

المطلوب:

- اعتماد خط عربي موحد.
- توحيد:
  - الأزرار.
  - البطاقات.
  - الشريط العلوي.
  - الفوتر.
  - ألوان الحالات.
  - تباين النصوص.
- منع تكرار الشريط والفوتر في كل صفحة.

ملفات مهمة:

```txt
frontend/app/globals.css
frontend/app/components/PublicHeader.tsx
frontend/app/components/PublicFooter.tsx
frontend/app/page.tsx
frontend/app/vendors/[vendorId]/page.tsx
frontend/app/vendors/[vendorId]/products/[productId]/page.tsx
frontend/app/dashboard/page.tsx
```

---

## 5. المرحلة الثانية: إنشاء باك إند NestJS

### 5.1 إنشاء مشروع NestJS

من جذر المشروع:

```bash
npm i -g @nestjs/cli
nest new backend
```

أو إذا كان مجلد `backend` موجودًا:

- نقل الباك إند القديم إلى:

```txt
backend-legacy
```

- إنشاء NestJS جديد في:

```txt
backend
```

### 5.2 تثبيت الحزم الأساسية

داخل `backend`:

```bash
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install @prisma/client
npm install swagger-ui-express @nestjs/swagger
npm install helmet compression
npm install -D prisma
npm install -D @types/bcrypt @types/passport-jwt
```

### 5.3 تهيئة Prisma

```bash
npx prisma init
```

ينتج:

```txt
backend/prisma/schema.prisma
backend/.env
```

إعداد الاتصال:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nmoo_db?schema=public"
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="1d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

---

## 6. المرحلة الثالثة: PostgreSQL

### 6.1 تشغيل PostgreSQL محليًا

تم تثبيت PostgreSQL محليًا على الجهاز بدل استخدام Docker.

الحالة الحالية المؤكدة:

- الخدمة: `postgresql-x64-18`
- الحالة: `Running`
- بدء التشغيل: `Automatic`
- الإصدار: PostgreSQL 18.4
- مسار التثبيت: `E:\Postgres`
- المنفذ: `5432`
- حالة الاتصال: `localhost:5432 - accepting connections`

أدوات PostgreSQL موجودة هنا:

```txt
E:\Postgres\bin
```

للتحقق من التثبيت:

```powershell
& "E:\Postgres\bin\psql.exe" --version
& "E:\Postgres\bin\pg_isready.exe" -h localhost -p 5432
```

لإضافة `psql` إلى PATH بشكل مؤقت داخل نفس نافذة PowerShell:

```powershell
$env:Path = "E:\Postgres\bin;$env:Path"
```

الخطوة المطلوبة الآن قبل migration:

- إنشاء قاعدة البيانات `nmoo_db` إذا لم تكن موجودة.
- التأكد أن كلمة مرور المستخدم `postgres` تطابق قيمة `DATABASE_URL` في `backend/.env`.
- بعد ذلك تشغيل:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 6.2 Prisma schema مبدئي

الجداول الأساسية:

- User
- VendorSubscription
- Category
- Product
- ProductImage
- Order
- OrderItem
- Review

تصور مبدئي:

```prisma
enum UserRole {
  BUYER
  VENDOR
  ADMIN
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  COMPLETED
  CANCELLED
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(BUYER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  products     Product[]
  orders       Order[]
  subscription VendorSubscription?
  reviews      Review[]
}

model VendorSubscription {
  id        String   @id @default(uuid())
  vendorId  String   @unique
  plan      String   @default("free")
  status    String   @default("none")
  startedAt DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  vendor    User     @relation(fields: [vendorId], references: [id])
}

model Category {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  products  Product[]
}

model Product {
  id          String        @id @default(uuid())
  vendorId    String
  categoryId  String?
  title       String
  slug        String        @unique
  description String?
  price       Decimal
  stock       Int           @default(0)
  status      ProductStatus @default(DRAFT)
  imageUrl    String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  vendor      User          @relation(fields: [vendorId], references: [id])
  category    Category?     @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  orderItems  OrderItem[]
  reviews     Review[]
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  url       String
  alt       String?
  sortOrder Int     @default(0)

  product   Product @relation(fields: [productId], references: [id])
}

model Order {
  id        String      @id @default(uuid())
  buyerId   String
  status    OrderStatus @default(PENDING)
  total     Decimal
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  buyer     User        @relation(fields: [buyerId], references: [id])
  items     OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Decimal

  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Review {
  id        String   @id @default(uuid())
  productId String
  userId    String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  product   Product  @relation(fields: [productId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

### 6.3 تشغيل migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 7. المرحلة الرابعة: هيكلة NestJS

الهيكلة المقترحة:

```txt
backend/src/
  main.ts
  app.module.ts

  common/
    decorators/
      current-user.decorator.ts
      roles.decorator.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    filters/
      http-exception.filter.ts
    interceptors/
      response.interceptor.ts

  prisma/
    prisma.module.ts
    prisma.service.ts

  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
      register.dto.ts
      login.dto.ts
    strategies/
      jwt.strategy.ts

  users/
    users.module.ts
    users.controller.ts
    users.service.ts

  products/
    products.module.ts
    products.controller.ts
    products.service.ts
    dto/
      create-product.dto.ts
      update-product.dto.ts
      product-query.dto.ts

  categories/
    categories.module.ts
    categories.controller.ts
    categories.service.ts

  orders/
    orders.module.ts
    orders.controller.ts
    orders.service.ts
    dto/
      create-order.dto.ts
      update-order-status.dto.ts

  subscriptions/
    subscriptions.module.ts
    subscriptions.controller.ts
    subscriptions.service.ts
```

---

## 8. المرحلة الخامسة: API المطلوب

### 8.1 Auth

```http
POST /auth/register
POST /auth/login
GET /auth/me
```

Register body:

```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "StrongPassword123",
  "role": "VENDOR"
}
```

Login response:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "VENDOR"
  }
}
```

### 8.2 Products

```http
GET /products
GET /products/:id
POST /products
PATCH /products/:id
DELETE /products/:id
```

بحث وتصفية:

```http
GET /products?q=حذاء&category=shoes&minPrice=0&maxPrice=500&sort=latest&page=1&limit=12
```

قواعد:

- إنشاء المنتج للتاجر فقط.
- تعديل المنتج لصاحبه فقط أو للأدمن.
- الحذف soft delete أو status `ARCHIVED`.

### 8.3 Categories

```http
GET /categories
POST /categories
PATCH /categories/:id
DELETE /categories/:id
```

### 8.4 Orders

```http
POST /orders
GET /orders
GET /orders/:id
PATCH /orders/:id/status
```

قواعد:

- العميل ينشئ الطلب.
- التاجر يرى الطلبات التي تحتوي منتجاته.
- الأدمن يرى كل الطلبات.

### 8.5 Subscriptions

```http
GET /subscriptions/me
POST /subscriptions/activate
PATCH /subscriptions/:vendorId
```

ملاحظة:

- التفعيل اليدوي يستخدم في التطوير فقط.
- في الإنتاج يربط مع بوابة دفع لاحقًا.

---

## 9. المرحلة السادسة: ربط الواجهة بالباك إند

### 9.1 متغيرات البيئة في الواجهة

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 9.2 API client في Next.js

ملف:

```txt
frontend/lib/api.ts
```

وظائف:

- `getProducts`
- `getProductById`
- `login`
- `register`
- `getMe`
- `createProduct`
- `updateProduct`
- `createOrder`

### 9.3 ربط صفحة المتجر

بدل المنتجات الثابتة:

```ts
GET /products?q=...
```

الواجهة تعرض:

- Loading state.
- Empty state.
- Error state.
- Pagination.

### 9.4 ربط صفحة المنتج

```ts
GET /products/:id
```

لو المنتج غير موجود:

- عرض `notFound()`.

### 9.5 ربط لوحة التحكم

لوحة التحكم تحتاج:

- منتجات التاجر.
- الطلبات الأخيرة.
- إجمالي المبيعات.
- عدد الزيارات لاحقًا.

---

## 10. المرحلة السابعة: السلة والشراء

### 10.1 السلة

البداية:

- localStorage في الواجهة.

لاحقًا:

- جدول Cart و CartItem للمستخدمين المسجلين.

صفحات:

```txt
/cart
/checkout
```

### 10.2 إنشاء الطلب

عند إتمام الطلب:

```http
POST /orders
```

يتحقق الباك إند من:

- وجود المنتجات.
- توفر المخزون.
- السعر الحقيقي من قاعدة البيانات.
- حساب الإجمالي من السيرفر وليس من الواجهة.

---

## 11. المرحلة الثامنة: الأمان

### 11.1 NestJS Guards

المطلوب:

- `JwtAuthGuard`
- `RolesGuard`
- `CurrentUser` decorator
- `Roles` decorator

### 11.2 Validation

استخدام:

- DTOs
- class-validator
- ValidationPipe global

في `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### 11.3 حماية الإنتاج

المطلوب:

- Helmet.
- CORS محدد بدومين الواجهة.
- عدم طباعة أسرار في logs.
- عدم استخدام JWT secret افتراضي.
- rate limiting لاحقًا.

---

## 12. المرحلة التاسعة: الاختبارات

### 12.1 اختبارات الباك إند

NestJS يدعم Jest افتراضيًا.

اختبارات مطلوبة:

- Auth register.
- Auth login.
- منع إنشاء منتج بدون token.
- منع buyer من إنشاء منتج.
- السماح vendor بإنشاء منتج.
- البحث عن المنتجات.
- إنشاء طلب.
- منع تعديل طلب بدون صلاحية.

أوامر:

```bash
cd backend
npm run test
npm run test:e2e
```

### 12.2 اختبارات الواجهة

أدوات مقترحة:

- Playwright.
- Testing Library لاحقًا.

اختبارات:

- الصفحة الرئيسية تظهر.
- المتجر يبحث عن منتج.
- صفحة المنتج تفتح.
- لوحة التحكم تظهر بشكل صحيح.

---

## 13. المرحلة العاشرة: الأداء

### 13.1 الصور

المطلوب:

- تحويل `<img>` إلى `next/image`.
- ضبط `remotePatterns` في `next.config.ts`.
- أو استخدام صور محلية في `public/images`.

### 13.2 API

المطلوب:

- Pagination في المنتجات.
- Indexes في PostgreSQL:
  - `email`
  - `product.slug`
  - `product.title`
  - `category.slug`
- Cache لاحقًا للمنتجات العامة.

### 13.3 Prisma

المطلوب:

- تجنب N+1 queries.
- استخدام `select` و `include` بعناية.
- عدم إرجاع passwordHash.

---

## 14. المرحلة الحادية عشرة: النشر

### 14.1 الواجهة

المنصة المقترحة:

- Vercel

خطوات:

```bash
cd frontend
npm install
npm run lint
npm run build
```

متغيرات Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 14.2 NestJS API

منصات مقترحة:

- Render
- Railway
- Fly.io
- VPS

أوامر الإنتاج:

```bash
cd backend
npm install
npm run build
npm run start:prod
```

متغيرات البيئة:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-production-secret"
JWT_EXPIRES_IN="1d"
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
PORT=5000
```

### 14.3 PostgreSQL في الإنتاج

خيارات:

- Supabase Postgres
- Neon
- Railway PostgreSQL
- Render PostgreSQL
- RDS لاحقًا

بعد ضبط `DATABASE_URL`:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 14.4 الدومينات

اقتراح:

```txt
nmoo.com
api.nmoo.com
```

الواجهة:

```txt
https://nmoo.com
```

الباك إند:

```txt
https://api.nmoo.com
```

### 14.5 فحص بعد النشر

قائمة تحقق:

- الواجهة تعمل.
- API يعمل.
- الاتصال بقاعدة البيانات يعمل.
- Prisma migrations مطبقة.
- تسجيل حساب يعمل.
- تسجيل الدخول يعمل.
- المتجر يجلب المنتجات من API.
- البحث يعمل.
- صفحة المنتج تعمل.
- CORS مضبوط.
- لا توجد أسرار مكشوفة.
- لا توجد أخطاء في console.

---

## 15. ترتيب التنفيذ المقترح

### الأسبوع 1: تثبيت الواجهة

- تنظيف النصوص.
- توحيد التصميم.
- إصلاح التباين.
- تثبيت صفحات:
  - الرئيسية.
  - المتجر.
  - المنتج.
  - لوحة التحكم.

### الأسبوع 2: بناء NestJS

- إنشاء مشروع NestJS.
- إعداد ConfigModule.
- إعداد PrismaModule.
- إعداد PostgreSQL.
- إنشاء أول migration.
- إعداد Swagger.

### الأسبوع 3: Auth و Users

- Register.
- Login.
- JWT strategy.
- Guards.
- Roles.
- Auth e2e tests.

### الأسبوع 4: Products و Categories

- CRUD المنتجات.
- CRUD التصنيفات.
- البحث والتصفية.
- pagination.
- ربط المتجر بالـ API.

### الأسبوع 5: Orders و Cart

- سلة في الواجهة.
- إنشاء الطلبات.
- عرض الطلبات في لوحة التحكم.
- تحديث حالة الطلب.

### الأسبوع 6: Dashboard Integration

- منتجات التاجر.
- الطلبات الأخيرة.
- إحصائيات المبيعات.
- حماية لوحة التحكم.

### الأسبوع 7: الاختبارات والأمان

- اختبارات e2e للباك إند.
- اختبارات أساسية للواجهة.
- مراجعة CORS.
- مراجعة صلاحيات التاجر.
- تحسين validation.

### الأسبوع 8: النشر

- build للواجهة.
- build للباك إند.
- PostgreSQL إنتاج.
- Prisma migrate deploy.
- نشر API.
- نشر الواجهة.
- ربط الدومين.
- فحص نهائي.

---

## 16. تعريف MVP

يعتبر المشروع جاهزًا كنسخة MVP عندما يتوفر:

- واجهة عربية متناسقة.
- باك إند NestJS منظم.
- PostgreSQL مع Prisma migrations.
- تسجيل مستخدم وتسجيل دخول.
- أدوار BUYER و VENDOR و ADMIN.
- متجر يجلب منتجات من API.
- بحث وتصفية منتجات.
- صفحة منتج حقيقية.
- تاجر يضيف ويعدل منتجاته.
- عميل ينشئ طلبًا.
- لوحة تحكم تعرض منتجات وطلبات التاجر.
- اختبارات أساسية ناجحة.
- نشر مستقر للواجهة والـ API.
## Store-focused structure update

The project structure is now store-focused:

- There is no global public product page that mixes products from different vendors.
- The platform home stays at `/`.
- Each vendor has a public profile at `/vendors/:vendorId`.
- Each vendor has a shopping storefront at `/vendors/:vendorId/storefront`.
- After the owner selects a unique store username, public links use `/:storeUsername`, `/:storeUsername/storefront`, and `/:storeUsername/products/:productId` instead of ids.
- Each product page is scoped to its store at `/vendors/:vendorId/products/:productId`.
- `/store` is legacy only and redirects away from the removed global product listing.
- `/store/product/:id` is legacy only and redirects to the vendor-scoped product route when possible.
- Public product search, filters, sorting, and pagination must always include `vendorId`.
- Backend `GET /api/products` requires `vendorId`.
- Vendors can create, update, and delete only their own products. Admins can manage all products.
- Store pages such as return policy and about pages belong to a vendor and link back to `/vendors/:vendorId`.
