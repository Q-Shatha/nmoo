ALTER TABLE "vendor_shipping_methods"
ADD COLUMN "excludedRegions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "vendor_themes"
ADD COLUMN "cashOnDeliveryEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "orders"
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'ONLINE';
