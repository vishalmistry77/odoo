/*
  Warnings:

  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'UNPAID', 'PAID', 'PARTIALLY_PAID', 'VOID');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deposit" DECIMAL(10,2),
ADD COLUMN     "taxAmount" DECIMAL(10,2),
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID';
