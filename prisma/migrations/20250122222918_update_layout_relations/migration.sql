-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_layoutId_fkey";

-- AlterTable
ALTER TABLE "LayoutComponent" ALTER COLUMN "config" SET DEFAULT '{}',
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "HomeLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
