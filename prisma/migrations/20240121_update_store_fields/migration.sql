-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "customCss" SET DATA TYPE TEXT,
                    ALTER COLUMN "logoUrl" SET DATA TYPE TEXT,
                    ALTER COLUMN "faviconUrl" SET DATA TYPE TEXT,
                    ALTER COLUMN "description" SET DATA TYPE TEXT;

-- Update existing stores to use domain as subdomain
UPDATE "Store" 
SET domain = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-')) 
WHERE domain IS NULL;