-- AlterTable
ALTER TABLE "vendor_shipping_methods" ADD COLUMN     "isPickup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupAddress" TEXT;
