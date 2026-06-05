CREATE TABLE "product_addons" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_addons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_addons_productId_idx" ON "product_addons"("productId");
CREATE INDEX "product_addons_enabled_idx" ON "product_addons"("enabled");

ALTER TABLE "product_addons" ADD CONSTRAINT "product_addons_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items"
ADD COLUMN "selectedAddons" JSONB NOT NULL DEFAULT '[]';
