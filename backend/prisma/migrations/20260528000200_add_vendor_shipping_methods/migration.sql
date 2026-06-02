CREATE TABLE "vendor_shipping_methods" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "eta" TEXT,
  "fee" DECIMAL(10,2) NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "vendor_shipping_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendor_shipping_methods_vendorId_code_key" ON "vendor_shipping_methods"("vendorId", "code");
CREATE INDEX "vendor_shipping_methods_vendorId_idx" ON "vendor_shipping_methods"("vendorId");
CREATE INDEX "vendor_shipping_methods_code_idx" ON "vendor_shipping_methods"("code");

ALTER TABLE "vendor_shipping_methods"
ADD CONSTRAINT "vendor_shipping_methods_vendorId_fkey"
FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "vendor_shipping_methods" ("id", "vendorId", "code", "name", "description", "eta", "fee", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'spl', 'سبل', 'خيار اقتصادي مناسب لمعظم المدن داخل السعودية.', '2 - 5 أيام عمل', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users"
WHERE "role" IN ('VENDOR', 'ADMIN');

INSERT INTO "vendor_shipping_methods" ("id", "vendorId", "code", "name", "description", "eta", "fee", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'smsa', 'سمسا', 'توصيل سريع مع تتبع واضح للشحنة.', '1 - 3 أيام عمل', 25, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users"
WHERE "role" IN ('VENDOR', 'ADMIN');
