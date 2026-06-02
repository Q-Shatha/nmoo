ALTER TABLE "users" ADD COLUMN "storeUsername" TEXT;
CREATE UNIQUE INDEX "users_storeUsername_key" ON "users"("storeUsername");
