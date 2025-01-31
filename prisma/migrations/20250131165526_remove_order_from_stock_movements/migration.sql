/*
  Warnings:

  - You are about to drop the column `orderId` on the `StockMovement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_orderId_fkey";

-- DropIndex
DROP INDEX "StockMovement_orderId_idx";

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "orderId";
