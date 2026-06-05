ALTER TABLE "products"
ADD COLUMN "archivedAt" TIMESTAMP(3);

UPDATE "products"
SET "archivedAt" = "updatedAt"
WHERE "status" = 'ARCHIVED' AND "archivedAt" IS NULL;

CREATE INDEX "products_archivedAt_idx" ON "products"("archivedAt");
