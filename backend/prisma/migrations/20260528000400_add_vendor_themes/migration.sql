CREATE TABLE "vendor_themes" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "primaryColor" TEXT NOT NULL DEFAULT '#884a70',
  "secondaryColor" TEXT NOT NULL DEFAULT '#1e293b',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "vendor_themes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendor_themes_vendorId_key" ON "vendor_themes"("vendorId");

ALTER TABLE "vendor_themes"
ADD CONSTRAINT "vendor_themes_vendorId_fkey"
FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "vendor_themes" ("id", "vendorId", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", '#884a70', '#1e293b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users"
WHERE "role" IN ('VENDOR', 'ADMIN');
