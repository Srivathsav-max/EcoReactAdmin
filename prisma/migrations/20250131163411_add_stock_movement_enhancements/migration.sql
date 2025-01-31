/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'cart';

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "originatorId" TEXT,
ADD COLUMN     "originatorType" TEXT;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE INDEX "StockMovement_orderId_idx" ON "StockMovement"("orderId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
