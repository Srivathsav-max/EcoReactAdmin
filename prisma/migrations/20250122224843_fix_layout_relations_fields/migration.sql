-- AlterTable
ALTER TABLE "_ProductToTaxon" ADD CONSTRAINT "_ProductToTaxon_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductToTaxon_AB_unique";
