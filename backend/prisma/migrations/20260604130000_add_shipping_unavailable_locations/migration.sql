ALTER TABLE "vendor_shipping_methods"
ADD COLUMN "unavailableLocations" JSONB NOT NULL DEFAULT '[]'::jsonb;
