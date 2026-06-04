ALTER TABLE "vendor_shipping_methods"
ADD COLUMN "deliveryLocations" JSONB NOT NULL DEFAULT '[]'::jsonb;
