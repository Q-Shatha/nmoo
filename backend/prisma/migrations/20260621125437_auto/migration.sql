-- CreateTable
CREATE TABLE "cart_events" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cart_events_vendorId_idx" ON "cart_events"("vendorId");

-- CreateIndex
CREATE INDEX "cart_events_buyerId_idx" ON "cart_events"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_events_buyerId_productId_key" ON "cart_events"("buyerId", "productId");

-- AddForeignKey
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
