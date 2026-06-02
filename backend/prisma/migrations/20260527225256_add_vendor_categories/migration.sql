-- Add private vendor categories while keeping existing categories global.
ALTER TABLE "categories" ADD COLUMN "vendorId" TEXT;

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";

CREATE UNIQUE INDEX "categories_vendorId_slug_key" ON "categories"("vendorId", "slug");
CREATE INDEX "categories_vendorId_idx" ON "categories"("vendorId");

ALTER TABLE "categories"
ADD CONSTRAINT "categories_vendorId_fkey"
FOREIGN KEY ("vendorId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
