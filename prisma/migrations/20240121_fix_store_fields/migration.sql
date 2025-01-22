-- DropIndex
DROP INDEX IF EXISTS "Store_domain_key";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN IF EXISTS "domain";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "logoUrl";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "faviconUrl";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "customCss";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "themeSettings";

-- AddColumns
ALTER TABLE "Store" 
ADD COLUMN "domain" TEXT,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "faviconUrl" TEXT,
ADD COLUMN "customCss" TEXT,
ADD COLUMN "themeSettings" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Store_domain_key" ON "Store"("domain");

-- Update NULL domains to be unique
UPDATE "Store"
SET domain = CONCAT(LOWER(name), '-', id)
WHERE domain IS NULL;