CREATE TABLE "store_pages" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "store_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "store_pages_vendorId_slug_key" ON "store_pages"("vendorId", "slug");
CREATE INDEX "store_pages_vendorId_idx" ON "store_pages"("vendorId");
CREATE INDEX "store_pages_published_idx" ON "store_pages"("published");

ALTER TABLE "store_pages"
ADD CONSTRAINT "store_pages_vendorId_fkey"
FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
