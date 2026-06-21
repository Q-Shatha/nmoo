-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "products_archivedAt_idx";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");
