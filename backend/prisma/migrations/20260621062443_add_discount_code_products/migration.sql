/*
  Warnings:

  - You are about to drop the column `productId` on the `discount_codes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "discount_codes" DROP CONSTRAINT "discount_codes_productId_fkey";

-- AlterTable
ALTER TABLE "discount_codes" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "discount_code_products" (
    "discountCodeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "discount_code_products_pkey" PRIMARY KEY ("discountCodeId","productId")
);

-- CreateIndex
CREATE INDEX "discount_code_products_productId_idx" ON "discount_code_products"("productId");

-- AddForeignKey
ALTER TABLE "discount_code_products" ADD CONSTRAINT "discount_code_products_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "discount_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_code_products" ADD CONSTRAINT "discount_code_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
